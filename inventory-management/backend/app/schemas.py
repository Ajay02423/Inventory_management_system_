from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.models import OrderStatus


class ProductBase(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    sku: str = Field(min_length=1, max_length=100)
    price: float = Field(ge=0)
    quantity: int = Field(ge=0)
    low_stock_threshold: int = Field(default=10, ge=1)
    description: str | None = None
    image_url: str | None = None


class ProductCreate(ProductBase):
    pass


class ProductUpdate(ProductBase):
    pass


class ProductRead(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    low_stock: bool
    created_at: datetime
    updated_at: datetime


class CustomerBase(BaseModel):
    full_name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    phone: str = Field(min_length=1, max_length=50)


class CustomerCreate(CustomerBase):
    pass


class CustomerRead(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime


class OrderItemCreate(BaseModel):
    product_id: uuid.UUID
    quantity: int = Field(ge=1)


class OrderCreate(BaseModel):
    customer_id: uuid.UUID
    order_date: datetime | None = None
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    product_id: uuid.UUID
    product_name: str
    sku: str
    quantity: int
    unit_price: float
    subtotal: float


class OrderListRead(BaseModel):
    id: uuid.UUID
    customer_id: uuid.UUID
    customer_name: str
    item_count: int
    status: OrderStatus
    total_amount: float
    order_date: datetime
    created_at: datetime


class OrderDetailRead(BaseModel):
    id: uuid.UUID
    customer: CustomerRead
    status: OrderStatus
    total_amount: float
    order_date: datetime
    created_at: datetime
    items: list[OrderItemRead]


class RecentOrderRead(BaseModel):
    id: uuid.UUID
    customer_name: str
    total_amount: float
    status: OrderStatus
    order_date: datetime
    quantity: int | None = None


class ProductInsightsRead(BaseModel):
    last_ordered_at: datetime | None
    total_orders_count: int
    total_quantity_sold: int
    revenue_generated: float
    recent_orders: list[RecentOrderRead]


class CustomerInsightsRead(BaseModel):
    total_orders: int
    total_spent: float
    last_order_date: datetime | None
    recent_orders: list[RecentOrderRead]


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: float
    low_stock_products: list[ProductRead]
