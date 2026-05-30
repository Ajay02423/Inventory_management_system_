from __future__ import annotations

import logging
import os
from contextlib import asynccontextmanager
from datetime import datetime, timedelta

from fastapi import Depends, FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy import func, inspect, select, text
from sqlalchemy.orm import Session

from app.database import Base, engine, get_db
from app.errors import APIError
from app.models import Customer, Order, OrderStatus, Product
from app.routers.customers import router as customers_router
from app.routers.orders import router as orders_router
from app.routers.products import router as products_router, serialize_product
from app.schemas import DashboardSummary


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger(__name__)


def ensure_schema_updates() -> None:
    inspector = inspect(engine)

    product_columns = {column["name"] for column in inspector.get_columns("products")} if inspector.has_table("products") else set()
    order_columns = {column["name"] for column in inspector.get_columns("orders")} if inspector.has_table("orders") else set()

    statements: list[str] = []

    if "products" in inspector.get_table_names():
        if "low_stock_threshold" not in product_columns:
            statements.append("ALTER TABLE products ADD COLUMN low_stock_threshold INTEGER NOT NULL DEFAULT 10")
        if "image_url" not in product_columns:
            statements.append("ALTER TABLE products ADD COLUMN image_url TEXT")
        statements.append("UPDATE products SET low_stock_threshold = 10 WHERE low_stock_threshold IS NULL")

    if "orders" in inspector.get_table_names():
        if "order_date" not in order_columns:
            statements.append("ALTER TABLE orders ADD COLUMN order_date TIMESTAMP WITH TIME ZONE")
            statements.append("UPDATE orders SET order_date = created_at WHERE order_date IS NULL")
            statements.append("ALTER TABLE orders ALTER COLUMN order_date SET NOT NULL")

    if not statements:
        return

    with engine.begin() as connection:
        for statement in statements:
            connection.execute(text(statement))


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("Creating database tables if needed.")
    Base.metadata.create_all(bind=engine)
    ensure_schema_updates()
    yield


app = FastAPI(title="Inventory Manager API", version="1.0.0", lifespan=lifespan)

allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "*")
allowed_origins = ["*"] if allowed_origins_env == "*" else [origin.strip() for origin in allowed_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allowed_origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(APIError)
async def api_error_handler(_: Request, exc: APIError) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail, "code": exc.code})


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    first_error = exc.errors()[0] if exc.errors() else {"msg": "Validation failed."}
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": first_error["msg"], "code": "VALIDATION_ERROR"},
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    if isinstance(exc.detail, dict):
        content = {
            "detail": exc.detail.get("detail", "Request failed."),
            "code": exc.detail.get("code", "HTTP_ERROR"),
        }
    else:
        content = {"detail": str(exc.detail), "code": "HTTP_ERROR"}
    return JSONResponse(status_code=exc.status_code, content=content)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled server error", exc_info=exc)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error.", "code": "INTERNAL_SERVER_ERROR"},
    )


@app.get("/health")
def health_check(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}


@app.get("/api/dashboard", response_model=DashboardSummary)
def get_dashboard(db: Session = Depends(get_db)) -> DashboardSummary:
    total_products = db.scalar(select(func.count(Product.id))) or 0
    total_customers = db.scalar(select(func.count(Customer.id))) or 0
    total_orders = db.scalar(select(func.count(Order.id)).where(Order.status == OrderStatus.CONFIRMED)) or 0
    total_revenue = db.scalar(
        select(func.coalesce(func.sum(Order.total_amount), 0)).where(Order.status != OrderStatus.CANCELLED)
    ) or 0
    low_stock_products = db.scalars(
        select(Product)
        .where(Product.quantity < Product.low_stock_threshold)
        .order_by(Product.quantity.asc(), Product.name.asc())
    ).all()

    return DashboardSummary(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=round(float(total_revenue), 2),
        low_stock_products=[serialize_product(product) for product in low_stock_products],
    )


@app.get("/api/dashboard/orders-chart")
def get_orders_chart(period: str = "7d", db: Session = Depends(get_db)) -> list[dict[str, int | str]]:
    now = datetime.utcnow()

    if period == "24h":
        data: list[dict[str, int | str]] = []
        for i in range(23, -1, -1):
            bucket_start = now - timedelta(hours=i + 1)
            bucket_end = now - timedelta(hours=i)
            count = db.scalar(
                select(func.count(Order.id)).where(Order.created_at >= bucket_start, Order.created_at < bucket_end)
            ) or 0
            label = (now - timedelta(hours=i)).strftime("%I%p").lstrip("0")
            data.append({"label": label, "orders": int(count)})
        return data

    data = []
    for i in range(6, -1, -1):
        day_start = (now - timedelta(days=i)).replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = day_start + timedelta(days=1)
        count = db.scalar(
            select(func.count(Order.id)).where(Order.created_at >= day_start, Order.created_at < day_end)
        ) or 0
        label = day_start.strftime("%d %b")
        data.append({"label": label, "orders": int(count)})

    return data


app.include_router(products_router, prefix="/api")
app.include_router(customers_router, prefix="/api")
app.include_router(orders_router, prefix="/api")
