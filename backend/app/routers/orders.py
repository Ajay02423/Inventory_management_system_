from __future__ import annotations

import logging
import uuid
from collections import defaultdict
from datetime import timezone

from fastapi import APIRouter, Depends, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.errors import APIError
from app.models import Customer, Order, OrderItem, OrderStatus, Product
from app.schemas import OrderCreate, OrderDetailRead, OrderListRead


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/orders", tags=["Orders"])


def serialize_order_detail(order: Order) -> OrderDetailRead:
    return OrderDetailRead.model_validate(
        {
            "id": order.id,
            "customer": order.customer,
            "status": order.status,
            "total_amount": order.total_amount,
            "order_date": order.order_date,
            "created_at": order.created_at,
            "items": [
                {
                    "id": item.id,
                    "product_id": item.product_id,
                    "product_name": item.product.name,
                    "sku": item.product.sku,
                    "quantity": item.quantity,
                    "unit_price": item.unit_price,
                    "subtotal": item.quantity * item.unit_price,
                }
                for item in order.items
            ],
        }
    )


@router.post("", response_model=OrderDetailRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)) -> OrderDetailRead:
    customer = db.get(Customer, payload.customer_id)
    if not customer:
        raise APIError(status.HTTP_404_NOT_FOUND, "Customer not found.", "CUSTOMER_NOT_FOUND")

    requested_quantities: dict[uuid.UUID, int] = defaultdict(int)
    for item in payload.items:
        requested_quantities[item.product_id] += item.quantity

    products = db.scalars(
        select(Product).where(Product.id.in_(list(requested_quantities.keys()))).with_for_update()
    ).all()

    if len(products) != len(requested_quantities):
        raise APIError(status.HTTP_404_NOT_FOUND, "One or more products were not found.", "PRODUCT_NOT_FOUND")

    product_map = {product.id: product for product in products}
    insufficient_products: list[str] = []

    for product_id, requested_quantity in requested_quantities.items():
        product = product_map[product_id]
        if requested_quantity > product.quantity:
            insufficient_products.append(product.name)

    if insufficient_products:
        raise APIError(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            f"Insufficient stock for: {', '.join(insufficient_products)}.",
            "INSUFFICIENT_STOCK",
        )

    order_date = payload.order_date
    if order_date is not None and order_date.tzinfo is None:
        order_date = order_date.replace(tzinfo=timezone.utc)

    order_kwargs = {
        "customer_id": payload.customer_id,
        "status": OrderStatus.CONFIRMED,
        "total_amount": 0,
    }
    if order_date is not None:
        order_kwargs["order_date"] = order_date

    order = Order(**order_kwargs)
    total_amount = 0.0

    try:
        db.add(order)
        db.flush()

        for item in payload.items:
            product = product_map[item.product_id]
            product.quantity -= item.quantity
            if product.quantity < 0:
                raise APIError(
                    status.HTTP_422_UNPROCESSABLE_ENTITY,
                    f"Insufficient stock for {product.name}.",
                    "INSUFFICIENT_STOCK",
                )

            order_item = OrderItem(
                order_id=order.id,
                product_id=product.id,
                quantity=item.quantity,
                unit_price=product.price,
            )
            total_amount += product.price * item.quantity
            db.add(order_item)

        order.total_amount = round(total_amount, 2)
        db.commit()
    except APIError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        logger.exception("Failed to create order for customer %s", payload.customer_id)
        raise

    fresh_order = (
        db.execute(
            select(Order)
            .options(
                joinedload(Order.customer),
                joinedload(Order.items).joinedload(OrderItem.product),
            )
            .where(Order.id == order.id)
        )
        .unique()
        .scalar_one_or_none()
    )
    if not fresh_order:
        raise APIError(status.HTTP_500_INTERNAL_SERVER_ERROR, "Order could not be loaded.", "ORDER_LOAD_FAILED")
    return serialize_order_detail(fresh_order)


@router.get("", response_model=list[OrderListRead])
def list_orders(db: Session = Depends(get_db)) -> list[OrderListRead]:
    rows = db.execute(
        select(
            Order.id,
            Order.customer_id,
            Customer.full_name.label("customer_name"),
            func.count(OrderItem.id).label("item_count"),
            Order.status,
            Order.total_amount,
            Order.order_date,
            Order.created_at,
        )
        .join(Customer, Customer.id == Order.customer_id)
        .outerjoin(OrderItem, OrderItem.order_id == Order.id)
        .group_by(Order.id, Order.customer_id, Customer.full_name, Order.status, Order.total_amount, Order.order_date, Order.created_at)
        .order_by(Order.order_date.desc())
    ).all()

    return [
        OrderListRead(
            id=row.id,
            customer_id=row.customer_id,
            customer_name=row.customer_name,
            item_count=row.item_count,
            status=row.status,
            total_amount=row.total_amount,
            order_date=row.order_date,
            created_at=row.created_at,
        )
        for row in rows
    ]


@router.get("/{order_id}", response_model=OrderDetailRead)
def get_order(order_id: uuid.UUID, db: Session = Depends(get_db)) -> OrderDetailRead:
    order = (
        db.execute(
            select(Order)
            .options(
                joinedload(Order.customer),
                joinedload(Order.items).joinedload(OrderItem.product),
            )
            .where(Order.id == order_id)
        )
        .unique()
        .scalar_one_or_none()
    )
    if not order:
        raise APIError(status.HTTP_404_NOT_FOUND, "Order not found.", "ORDER_NOT_FOUND")
    return serialize_order_detail(order)


@router.delete("/{order_id}", response_model=OrderDetailRead)
def cancel_order(order_id: uuid.UUID, db: Session = Depends(get_db)) -> OrderDetailRead:
    order = (
        db.execute(
            select(Order)
            .options(
                joinedload(Order.customer),
                joinedload(Order.items).joinedload(OrderItem.product),
            )
            .where(Order.id == order_id)
        )
        .unique()
        .scalar_one_or_none()
    )
    if not order:
        raise APIError(status.HTTP_404_NOT_FOUND, "Order not found.", "ORDER_NOT_FOUND")
    if order.status == OrderStatus.CANCELLED:
        raise APIError(status.HTTP_400_BAD_REQUEST, "Order is already cancelled.", "ORDER_ALREADY_CANCELLED")

    try:
        for item in order.items:
            item.product.quantity += item.quantity
        order.status = OrderStatus.CANCELLED
        db.commit()
    except APIError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        logger.exception("Failed to cancel order %s", order_id)
        raise

    fresh_order = (
        db.execute(
            select(Order)
            .options(
                joinedload(Order.customer),
                joinedload(Order.items).joinedload(OrderItem.product),
            )
            .where(Order.id == order_id)
        )
        .unique()
        .scalar_one_or_none()
    )
    if not fresh_order:
        raise APIError(status.HTTP_500_INTERNAL_SERVER_ERROR, "Order could not be loaded.", "ORDER_LOAD_FAILED")
    return serialize_order_detail(fresh_order)
