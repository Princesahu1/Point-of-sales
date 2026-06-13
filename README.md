# 🛒 POS & Inventory Management System

A production-ready **full-stack** Point of Sale and Inventory Management System built with:
- **Backend**: Spring Boot 3.2 + Spring Security + JWT + MySQL
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Database**: MySQL 8.0+

---

## 📁 Project Structure

```
point-of-sales-project/
├── backend/                      ← Spring Boot backend
│   ├── src/
│   │   └── main/
│   │       ├── java/com/pos/
│   │       │   ├── config/       ← SecurityConfig, CorsConfig, SwaggerConfig
│   │       │   ├── controller/   ← REST controllers
│   │       │   ├── dto/          ← Data Transfer Objects
│   │       │   ├── exception/    ← Global exception handling
│   │       │   ├── mapper/       ← MapStruct mappers
│   │       │   ├── model/        ← JPA entities
│   │       │   ├── repository/   ← Spring Data repositories
│   │       │   ├── security/     ← JWT filter + UserDetailsService
│   │       │   ├── service/      ← Service interfaces
│   │       │   └── serviceImpl/  ← Service implementations
│   │       └── resources/
│   │           ├── application.yml ← MySQL config + JWT + CORS
│   │           ├── schema.sql      ← MySQL DDL
│   │           └── data.sql        ← Seed data
│   └── pom.xml
├── frontend/                     ← React + Vite app
│   └── src/
│       ├── api/                  ← Axios service layer
│       ├── components/           ← Shared components
│       ├── context/              ← AuthContext (JWT state)
│       └── pages/                ← All page components
└── docs/                         ← Postman collections, etc.
```

---

## 🚀 Quick Start (Easiest Way - Docker)

The easiest way to run this project on **any device** without database errors or manual setup is using Docker.

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

### 1️⃣ Run the entire stack
Open a terminal in the root folder (where `docker-compose.yml` is) and run:
```bash
docker compose up -d
```
*This will automatically download MySQL, set up the database, build the Spring Boot backend, and start the React frontend!*

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8080
- **Swagger UI**: http://localhost:8080/swagger-ui/index.html

To stop the servers, run: `docker compose down`

---

## 🛠️ Manual Start (Without Docker)

If you don't have Docker, you'll need:
- Java 17+
- Maven 3.8+
- MySQL 8.0+
- Node.js 18+

### 1️⃣ Database Setup (MySQL)
Create a database named `pos_db`. The app defaults to `root` user with password `Sahu@177`. 
*(If your MySQL uses a different password, edit `backend/src/main/resources/application.yml` or set the `DB_PASSWORD` environment variable).*

### 2️⃣ Run the Backend
```bash
cd backend
mvn clean spring-boot:run
```

### 3️⃣ Run the Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🔑 Default Credentials

All accounts have password: **`password123`**

| Username  | Role             |
|-----------|-----------------|
| `admin`   | ADMIN           |
| `manager` | STORE_MANAGER   |
| `cashier` | CASHIER         |
| `clerk`   | INVENTORY_CLERK |
| `analyst` | BUSINESS_ANALYST|

---

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint             | Description         | Auth |
|--------|----------------------|---------------------|------|
| POST   | `/api/auth/login`    | Login               | ❌   |
| POST   | `/api/auth/register` | Register new user   | ❌   |

### 📦 Products
| Method | Endpoint                    | Description          | Role          |
|--------|-----------------------------|----------------------|---------------|
| GET    | `/api/products`             | List all products    | All           |
| GET    | `/api/products/{id}`        | Get product by ID    | All           |
| GET    | `/api/products/barcode/{b}` | Get by barcode       | All           |
| GET    | `/api/products/search?q=`   | Search products      | All           |
| POST   | `/api/products`             | Create product       | MANAGER+      |
| PUT    | `/api/products/{id}`        | Update product       | MANAGER+      |
| DELETE | `/api/products/{id}`        | Delete product       | ADMIN         |

### 🏪 Sales (POS)
| Method | Endpoint              | Description        | Role          |
|--------|-----------------------|--------------------|---------------|
| POST   | `/api/sales`          | Create sale        | CASHIER+      |
| GET    | `/api/sales`          | List sales         | MANAGER+      |
| GET    | `/api/sales/{id}`     | Get sale by ID     | MANAGER+      |
| POST   | `/api/sales/{id}/refund` | Refund sale     | MANAGER+      |

### 📊 Inventory
| Method | Endpoint                         | Description       | Role     |
|--------|----------------------------------|-------------------|----------|
| GET    | `/api/inventory`                 | List all stock    | CLERK+   |
| GET    | `/api/inventory/low-stock`       | Low stock items   | CLERK+   |
| PUT    | `/api/inventory/{id}/adjust`     | Adjust stock      | CLERK+   |
| GET    | `/api/inventory/alerts`          | Get alerts        | CLERK+   |
| PUT    | `/api/inventory/alerts/{id}/resolve` | Resolve alert | CLERK+   |

### 📈 Reports
| Method | Endpoint                       | Description          | Role      |
|--------|--------------------------------|----------------------|-----------|
| GET    | `/api/reports/summary`         | Dashboard summary    | MANAGER+  |
| GET    | `/api/reports/daily?date=`     | Daily sales report   | ANALYST+  |
| GET    | `/api/reports/monthly?year=&month=` | Monthly report  | ANALYST+  |
| GET    | `/api/reports/inventory`       | Inventory report     | ANALYST+  |
| GET    | `/api/reports/top-products`    | Top selling products | ANALYST+  |

---

## 🛡️ Security

- JWT token expires after **24 hours**
- All `/api/auth/**` endpoints are public
- Swagger UI at `/swagger-ui/**` is public
- All other endpoints require valid JWT Bearer token

---

## 🎨 Frontend Features

| Feature               | Description                              |
|-----------------------|------------------------------------------|
| Dark theme            | Professional dark UI with Tailwind CSS   |
| Role-based routing    | Pages hidden/shown by user role          |
| JWT persistence       | Token stored in localStorage             |
| Axios interceptors    | Auto-attach token, 401 → redirect login  |
| Real-time search      | Debounced product search in POS          |
| Barcode scan          | Type barcode + Enter to add to cart      |
| Recharts              | Revenue area chart, pie chart, bar chart |
| react-hot-toast       | Non-intrusive notification system        |

---

## 🔧 Production Checklist

- [ ] Change JWT secret in `application.yml`
- [ ] Set strong MySQL password
- [ ] Set `ddl-auto: validate` and `sql.init.mode: never` after first run
- [ ] Update `cors.allowed-origins` to your frontend domain
- [ ] Enable HTTPS
- [ ] Set `logging.level.root: WARN` in production
