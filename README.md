# BELLYlicious Lawaan Online Ordering System

Premium boneless lechon belly pre-order platform for **St. Ignatius Heights, Lawaan, Roxas City, Capiz**.

## Tech Stack

| Layer | Stack |
|-------|--------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, shadcn-style Radix UI, React Router v6, Zustand |
| Backend | Laravel 12, Sanctum API tokens |
| Database | MySQL |

## Project Structure

```
DalivaSibugUcag_FinalProject/
├── client/                          # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Button, Input, Card, Badge…
│   │   │   ├── layout/              # Navbar, Footer, AdminLayout
│   │   │   ├── auth/                # ProtectedRoute
│   │   │   └── orders/              # OrderStatusBadge
│   │   ├── pages/                   # Public & customer pages
│   │   │   └── admin/               # Admin dashboard pages
│   │   ├── stores/                  # authStore, cartStore (Zustand)
│   │   ├── lib/                     # api, utils
│   │   └── types/
│   └── .env                         # VITE_API_URL
│
└── server/                          # Laravel API
    ├── app/
    │   ├── Http/Controllers/Api/    # Public API
    │   │   └── Admin/               # Admin API
    │   ├── Http/Middleware/
    │   └── Models/
    ├── database/migrations/
    ├── database/seeders/
    └── routes/api.php
```

## Setup

### 1. Database

Create MySQL database:

```sql
CREATE DATABASE bellylicious;
```

Update `server/.env`:

```
DB_DATABASE=bellylicious
```

### 2. Backend

```bash
cd server
composer install
php artisan migrate --seed
php artisan serve
```

API: `http://127.0.0.1:8000/api`

### 3. Frontend

```bash
cd client
npm install
npm run dev
```

App: `http://localhost:5173`

## Default Accounts (after seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bellylicious.ph | password123 |
| Customer | customer@example.com | password123 |

## Features

- **Public**: Landing, menu, about, pre-order flow, cart, guest checkout, order tracking
- **Customer**: Register/login, order history
- **Admin** (`/admin/login`): Dashboard, products (CRUD + variants), orders, schedule, users, reports

## API Overview

| Method | Endpoint | Auth |
|--------|----------|------|
| POST | `/api/register`, `/api/login` | — |
| GET | `/api/menu` | — |
| POST | `/api/orders` | Optional (guest) |
| GET | `/api/orders` | Customer |
| GET | `/api/admin/*` | Admin Bearer token |

## Business Rules

- **Pre-orders only** — minimum 1 day lead time (2 days recommended)
- **50% downpayment** required to confirm
- **Pickup** at Lawaan or **delivery** within Roxas City (zone-based fees)
