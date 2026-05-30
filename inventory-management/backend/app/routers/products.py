from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database import get_db
from app.errors import APIError
from app.models import Customer, Order, OrderItem, OrderStatus, Product
from app.schemas import ProductCreate, ProductInsightsRead, ProductRead, ProductUpdate, RecentOrderRead

router = APIRouter(prefix="/products", tags=["Products"])


def serialize_product(product: Product) -> ProductRead:
    return ProductRead.model_validate(
        {
            "id": product.id,
            "name": product.name,
            "sku": product.sku,
            "price": product.price,
            "quantity": product.quantity,
            "low_stock_threshold": product.low_stock_threshold,
            "description": product.description,
            "image_url": product.image_url,
            "low_stock": product.quantity < product.low_stock_threshold,
            "created_at": product.created_at,
            "updated_at": product.updated_at,
        }
    )


@router.post("", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)) -> ProductRead:
    existing = db.scalar(select(Product).where(Product.sku == payload.sku))
    if existing:
        raise APIError(status.HTTP_409_CONFLICT, "SKU already exists.", "DUPLICATE_SKU")

    product = Product(**payload.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return serialize_product(product)


@router.get("", response_model=list[ProductRead])
def list_products(db: Session = Depends(get_db)) -> list[ProductRead]:
    products = db.scalars(select(Product).order_by(Product.created_at.desc())).all()
    return [serialize_product(product) for product in products]


@router.get("/{product_id}", response_model=ProductRead)
def get_product(product_id: uuid.UUID, db: Session = Depends(get_db)) -> ProductRead:
    product = db.get(Product, product_id)
    if not product:
        raise APIError(status.HTTP_404_NOT_FOUND, "Product not found.", "PRODUCT_NOT_FOUND")
    return serialize_product(product)


@router.get("/{product_id}/insights", response_model=ProductInsightsRead)
def get_product_insights(product_id: uuid.UUID, db: Session = Depends(get_db)) -> ProductInsightsRead:
    product = db.get(Product, product_id)
    if not product:
        raise APIError(status.HTTP_404_NOT_FOUND, "Product not found.", "PRODUCT_NOT_FOUND")

    stats = db.execute(
        select(
            func.max(Order.order_date).label("last_ordered_at"),
            func.count(func.distinct(Order.id)).label("total_orders_count"),
            func.coalesce(func.sum(OrderItem.quantity), 0).label("total_quantity_sold"),
            func.coalesce(func.sum(OrderItem.quantity * OrderItem.unit_price), 0).label("revenue_generated"),
        )
        .select_from(OrderItem)
        .join(Order, Order.id == OrderItem.order_id)
        .where(OrderItem.product_id == product_id, Order.status != OrderStatus.CANCELLED)
    ).one()

    recent_rows = db.execute(
        select(
            Order.id,
            Customer.full_name.label("customer_name"),
            Order.total_amount,
            Order.status,
            Order.order_date,
            OrderItem.quantity,
        )
        .select_from(OrderItem)
        .join(Order, Order.id == OrderItem.order_id)
        .join(Customer, Customer.id == Order.customer_id)
        .where(OrderItem.product_id == product_id)
        .order_by(Order.order_date.desc())
        .limit(5)
    ).all()

    return ProductInsightsRead(
        last_ordered_at=stats.last_ordered_at,
        total_orders_count=int(stats.total_orders_count or 0),
        total_quantity_sold=int(stats.total_quantity_sold or 0),
        revenue_generated=round(float(stats.revenue_generated or 0), 2),
        recent_orders=[
            RecentOrderRead(
                id=row.id,
                customer_name=row.customer_name,
                total_amount=float(row.total_amount or 0),
                status=row.status,
                order_date=row.order_date,
                quantity=row.quantity,
            )
            for row in recent_rows
        ],
    )


@router.put("/{product_id}", response_model=ProductRead)
def update_product(
    product_id: uuid.UUID,
    payload: ProductUpdate,
    db: Session = Depends(get_db),
) -> ProductRead:
    product = db.get(Product, product_id)
    if not product:
        raise APIError(status.HTTP_404_NOT_FOUND, "Product not found.", "PRODUCT_NOT_FOUND")

    duplicate = db.scalar(select(Product).where(Product.sku == payload.sku, Product.id != product_id))
    if duplicate:
        raise APIError(status.HTTP_409_CONFLICT, "SKU already exists.", "DUPLICATE_SKU")

    for field, value in payload.model_dump().items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return serialize_product(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
def delete_product(product_id: uuid.UUID, db: Session = Depends(get_db)) -> Response:
    product = db.get(Product, product_id)
    if not product:
        raise APIError(status.HTTP_404_NOT_FOUND, "Product not found.", "PRODUCT_NOT_FOUND")

    has_orders = db.scalar(select(OrderItem).where(OrderItem.product_id == product_id).limit(1))
    if has_orders:
        raise APIError(
            status.HTTP_409_CONFLICT,
            "Products with orders cannot be deleted.",
            "PRODUCT_HAS_ORDERS",
        )

    db.delete(product)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)
