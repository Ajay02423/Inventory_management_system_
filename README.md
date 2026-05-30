# Inventory Manager

Inventory Manager is a production-ready full-stack inventory and order management system built with React, FastAPI, PostgreSQL, and Docker. It gives teams a single place to manage products, customers, orders, stock deductions, stock restoration on cancellations, per-product low-stock alerts, quick detail drawers, and a live dashboard for stock visibility.

## Features

- Product management with SKU uniqueness enforcement
- Customer management with unique email enforcement
- Atomic order creation with stock deduction and backend-calculated totals
- Order cancellation with stock restoration
- Dashboard metrics for products, customers, orders, revenue, and low-stock products
- Responsive React UI with sidebar and mobile navigation
- Dockerized local setup for database, backend, and frontend
- Alembic migration scaffold included for schema evolution

## Architecture

```text
┌──────────────┐      HTTP/JSON       ┌──────────────┐      SQLAlchemy       ┌────────────────┐
│ React + Vite │ ───────────────────► │ FastAPI API  │ ────────────────────► │ PostgreSQL 15  │
│ Tailwind UI  │ ◄─────────────────── │ /api routes  │ ◄──────────────────── │ Persistent DB  │
└──────────────┘                      └──────────────┘                        └────────────────┘
       │                                      │
       └──────────── Docker Compose ──────────┘
```

## Project Structure

```text
inventory-management/
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── database.py
│   │   ├── errors.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── routers/
│   │   └── schemas.py
│   ├── Dockerfile
│   ├── requirements.txt
│   └── alembic.ini
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── docker-compose.prod.yml
├── .env.example
└── README.md
```

## Prerequisites

- Docker Desktop or Docker Engine with Compose
- Node.js 20+ for running the frontend without Docker
- Python 3.11+
- PostgreSQL 15+ if running without Docker

## Local Development With Docker

```bash
git clone <your-repository-url>
cd Inventory_Management_System/inventory-management
cp .env.example .env
docker compose up --build
```

Access the app at `http://localhost`

Useful service endpoints:

- Frontend: `http://localhost`
- Backend: `http://localhost:8000`
- Health check: `http://localhost:8000/health`

## API Summary

### Health

```bash
curl http://localhost:8000/health
```

### Products

Create product:

```bash
curl -X POST http://localhost:8000/api/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Wireless Scanner","sku":"WS-100","price":149.99,"quantity":25,"description":"Warehouse barcode scanner"}'
```

List products:

```bash
curl http://localhost:8000/api/products
```

Get product by ID:

```bash
curl http://localhost:8000/api/products/<product_id>
```

Update product:

```bash
curl -X PUT http://localhost:8000/api/products/<product_id> \
  -H "Content-Type: application/json" \
  -d '{"name":"Wireless Scanner","sku":"WS-100","price":159.99,"quantity":30,"description":"Updated scanner"}'
```

Delete product:

```bash
curl -X DELETE http://localhost:8000/api/products/<product_id>
```

### Customers

Create customer:

```bash
curl -X POST http://localhost:8000/api/customers \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Morgan Lee","email":"morgan@example.com","phone":"+1-555-0132"}'
```

List customers:

```bash
curl http://localhost:8000/api/customers
```

Get customer by ID:

```bash
curl http://localhost:8000/api/customers/<customer_id>
```

Delete customer:

```bash
curl -X DELETE http://localhost:8000/api/customers/<customer_id>
```

### Orders

Create order:

```bash
curl -X POST http://localhost:8000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_id":"<customer_id>","items":[{"product_id":"<product_id>","quantity":2}]}'
```

List orders:

```bash
curl http://localhost:8000/api/orders
```

Get order by ID:

```bash
curl http://localhost:8000/api/orders/<order_id>
```

Cancel order:

```bash
curl -X DELETE http://localhost:8000/api/orders/<order_id>
```

### Dashboard

```bash
curl http://localhost:8000/api/dashboard
```

## Running Without Docker

### Backend

```bash
cd backend
python -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
cp ../.env.example ../.env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

On PowerShell, activate the environment with:

```powershell
.venv\Scripts\Activate.ps1
```

Optional migration workflow:

```bash
alembic revision --autogenerate -m "init"
alembic upgrade head
```

### Frontend

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

## Deployment Guide

### Backend on Render

1. Create a PostgreSQL instance.
2. Create a new Web Service from the `backend` directory.
3. Set `DATABASE_URL` and `ALLOWED_ORIGINS` environment variables.
4. Use the start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.

### Frontend on Vercel

1. Import the `frontend` directory as a separate project.
2. Set `VITE_API_URL` to your deployed backend URL.
3. Build command: `npm run build`
4. Output directory: `dist`

## Environment Variables

| Variable | Example | Purpose |
| --- | --- | --- |
| `POSTGRES_USER` | `inventory_user` | PostgreSQL username |
| `POSTGRES_PASSWORD` | `securepassword123` | PostgreSQL password |
| `POSTGRES_DB` | `inventory_db` | PostgreSQL database name |
| `DATABASE_URL` | `postgresql://inventory_user:securepassword123@db:5432/inventory_db` | Backend database connection string |
| `ALLOWED_ORIGINS` | `http://localhost,http://localhost:80` | Comma-separated CORS origins |
| `VITE_API_URL` | `http://localhost:8000` | Frontend API base URL for local development |

## Notes

- Backend startup creates tables automatically for local convenience.
- Order totals are always calculated server-side.
- Deleting a customer removes their orders and restores stock for non-cancelled orders first.
- Deleting a product with historical order items returns `409 Conflict`.
