from __future__ import annotations

import logging
import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.errors import APIError
from app.models import Customer, Order, OrderItem, OrderStatus
from app.schemas import CustomerCreate, CustomerInsightsRead, CustomerRead, RecentOrderRead


logger = logging.getLogger(__name__)
router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)) -> CustomerRead:
    existing = db.scalar(select(Customer).where(Customer.email == payload.email))
    if existing:
        raise APIError(status.HTTP_409_CONFLICT, "Email already exists.", "DUPLICATE_EMAIL")

    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.commit()
    db.refresh(customer)
    return CustomerRead.model_validate(customer)


@router.get("", response_model=list[CustomerRead])
def list_customers(db: Session = Depends(get_db)) -> list[CustomerRead]:
    customers = db.scalars(select(Customer).order_by(Customer.created_at.desc())).all()
    return [CustomerRead.model_validate(customer) for customer in customers]


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: uuid.UUID, db: Session = Depends(get_db)) -> CustomerRead:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise APIError(status.HTTP_404_NOT_FOUND, "Customer not found.", "CUSTOMER_NOT_FOUND")
    return CustomerRead.model_validate(customer)


@router.get("/{customer_id}/insights", response_model=CustomerInsightsRead)
def get_customer_insights(customer_id: uuid.UUID, db: Session = Depends(get_db)) -> CustomerInsightsRead:
    customer = db.get(Customer, customer_id)
    if not customer:
        raise APIError(status.HTTP_404_NOT_FOUND, "Customer not found.", "CUSTOMER_NOT_FOUND")

    stats = db.execute(
        select(
            func.count(Order.id).label("total_orders"),
            func.coalesce(func.sum(Order.total_amount), 0).label("total_spent"),
            func.max(Order.order_date).label("last_order_date"),
        )
        .where(Order.customer_id == customer_id, Order.status != OrderStatus.CANCELLED)
    ).one()

    recent_rows = db.execute(
        select(
            Order.id,
            Customer.full_name.label("customer_name"),
            Order.total_amount,
            Order.status,
            Order.order_date,
        )
        .join(Customer, Customer.id == Order.customer_id)
        .where(Order.customer_id == customer_id)
        .order_by(Order.order_date.desc())
        .limit(5)
    ).all()

    return CustomerInsightsRead(
        total_orders=int(stats.total_orders or 0),
        total_spent=round(float(stats.total_spent or 0), 2),
        last_order_date=stats.last_order_date,
        recent_orders=[
            RecentOrderRead(
                id=row.id,
                customer_name=row.customer_name,
                total_amount=float(row.total_amount or 0),
                status=row.status,
                order_date=row.order_date,
                quantity=None,
            )
            for row in recent_rows
        ],
    )


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_customer(customer_id: uuid.UUID, db: Session = Depends(get_db)) -> Response:
    customer = (
        db.execute(
            select(Customer)
            .options(
                joinedload(Customer.orders)
                .joinedload(Order.items)
                .joinedload(OrderItem.product)
            )
            .where(Customer.id == customer_id)
        )
        .unique()
        .scalar_one_or_none()
    )
    if not customer:
        raise APIError(status.HTTP_404_NOT_FOUND, "Customer not found.", "CUSTOMER_NOT_FOUND")

    try:
        for order in customer.orders:
            if order.status == OrderStatus.CANCELLED:
                continue
            for item in order.items:
                item.product.quantity += item.quantity
            order.status = OrderStatus.CANCELLED

        db.delete(customer)
        db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except APIError:
        db.rollback()
        raise
    except Exception:
        db.rollback()
        logger.exception("Failed to delete customer %s", customer_id)
        raise
