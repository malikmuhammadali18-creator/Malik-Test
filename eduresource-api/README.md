# EduResource API

A production-ready **Educational Resources Management REST API** built with **NestJS**, **TypeScript**, **PostgreSQL** (via Prisma ORM), **Redis**, and **AWS S3-compatible storage**.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 |
| Framework | NestJS 11 + TypeScript |
| Database | PostgreSQL 15 |
| ORM | Prisma 7 |
| Cache / Queue | Redis 7 |
| Auth | JWT (access + refresh), bcrypt |
| Storage | AWS S3 / S3-compatible |
| Docs | Swagger / OpenAPI |
| Container | Docker + Docker Compose |
| Testing | Jest (unit + e2e) |

---

## 📁 Project Structure

```
eduresource-api/
├── prisma/
│   ├── schema.prisma          # Full database schema
│   └── seed.ts                # Seed script with demo data
├── src/
│   ├── app.module.ts          # Root module
│   ├── main.ts                # Bootstrap with Swagger + Security
│   ├── common/
│   │   ├── filters/           # Global exception filter
│   │   └── interceptors/      # Response transformation
│   ├── prisma/                # Prisma global module
│   ├── auth/                  # Authentication (JWT, Guards, RBAC)
│   │   ├── decorators/        # @Roles decorator
│   │   ├── dto/               # RegisterDto, LoginDto
│   │   └── guards/            # JwtAuthGuard, RolesGuard
│   ├── users/                 # User CRUD
│   ├── schools/               # School management
│   ├── resources/             # Resource lifecycle
│   ├── storage/               # Abstract S3 storage service
│   ├── search/                # Full-text + filtered search
│   ├── notifications/         # In-app notifications
│   ├── reports/               # Analytics & statistics
│   └── audit-logs/            # Audit trail
├── test/
│   ├── auth.e2e-spec.ts       # Auth e2e tests
│   └── jest-e2e.json          # e2e Jest config
├── .env                       # Environment variables
├── Dockerfile                 # Multi-stage production build
└── docker-compose.yml         # Full stack (API + Postgres + Redis)
```

---

## ⚙️ Setup & Installation

### Prerequisites

- **Node.js** 20+
- **Docker** + Docker Compose
- An **S3-compatible** storage bucket (AWS S3, MinIO, Cloudflare R2, etc.)

### 1. Clone & Install

```bash
git clone <repo-url>
cd eduresource-api
npm install
```

### 2. Configure Environment

Copy and edit the environment file:

```bash
cp .env .env.local
```

Update these values in `.env`:

```env
DATABASE_URL="postgresql://root:password@localhost:5432/eduresource?schema=public"
REDIS_URL="redis://localhost:6379"

JWT_SECRET="your-super-secure-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

S3_BUCKET="your-s3-bucket"
S3_REGION="us-east-1"
S3_KEY="your-aws-key"
S3_SECRET="your-aws-secret"

SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="user@example.com"
SMTP_PASSWORD="yourpassword"
```

---

## 🐳 Running with Docker

Start PostgreSQL and Redis locally:

```bash
docker compose up db redis -d
```

Run migrations and seed:

```bash
npm run db:migrate
npm run db:seed
```

Start the API in development mode:

```bash
npm run start:dev
```

Or run the **full production stack** (API + DB + Redis):

```bash
docker compose up --build
```

---

## 📚 API Documentation

Once the server is running, access **Swagger UI** at:

```
http://localhost:3000/api/docs
```

All endpoints are documented with:
- Request body schemas
- Response formats
- Bearer token authentication
- Example values

---

## 🔑 Authentication

All protected routes require a **Bearer JWT token**:

```
Authorization: Bearer <access_token>
```

**Endpoints:**

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/v1/auth/register` | Create a new account |
| POST | `/api/v1/auth/login` | Login and get JWT |

---

## 👥 User Roles & Permissions

| Role | Permissions |
|---|---|
| **Admin** | Full system access |
| **SchoolAdmin** | Manage own school, users, resources |
| **Teacher** | CRUD own resources, collections |
| **Student** | View permitted resources |
| **Guest** | View public resources only |

---

## 🗺️ API Endpoints

| Module | Prefix | Description |
|---|---|---|
| Auth | `/api/v1/auth` | Register, Login |
| Users | `/api/v1/users` | User management |
| Schools | `/api/v1/schools` | School CRUD |
| Resources | `/api/v1/resources` | Resource lifecycle + file upload |
| Search | `/api/v1/search` | Full filter + pagination search |
| Notifications | `/api/v1/notifications` | User notifications |
| Reports | `/api/v1/reports` | Analytics & statistics |
| Audit Logs | `/api/v1/audit-logs` | Audit trail (admin only) |

---

## 🧪 Testing

Run unit tests:

```bash
npm run test
```

Run with coverage:

```bash
npm run test:cov
```

Run e2e tests (requires database):

```bash
npm run test:e2e
```

---

## 🌱 Seed Data

The seed script creates the following demo accounts:

| Role | Email | Password |
|---|---|---|
| Admin | `malikmuhammadali18@gmail.com` | `laptophp99` |
| School Admin | `schooladmin@greenwood.edu` | `SchoolAdmin@1234` |
| Teacher | `teacher@greenwood.edu` | `Teacher@1234` |

To seed:

```bash
npm run db:seed
```

---

## 🔒 Security Features

- ✅ **Helmet** - Secure HTTP headers
- ✅ **CORS** - Configurable cross-origin policies
- ✅ **JWT** - Stateless authentication
- ✅ **bcrypt** - Password hashing (10 salt rounds)
- ✅ **RBAC** - Role-based access control guards
- ✅ **ValidationPipe** - Global request validation + sanitization
- ✅ **SQL Injection Protection** - via Prisma ORM parameterized queries
- ✅ **Environment Variables** - No secrets in source code

---

## 📊 Response Format

**Success:**

```json
{
  "success": true,
  "message": "Request successful",
  "data": {}
}
```

**Error:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": ["email must be an email"]
}
```

---

## 🗄️ Database Schema

Key entities:
- **User** — UUID PK, soft-delete, roles, school association
- **School** — UUID PK, soft-delete, owns users and resources
- **Resource** — UUID PK, soft-delete, file reference, taxonomy, tags, view/download counters
- **File** — Metadata only (actual file in S3)
- **Category / Subject / Grade / Tag** — Taxonomy entities
- **Collection** — Teacher-organized resource sets
- **Notification** — In-app notifications per user
- **AuditLog** — Full action audit trail

---

## 📝 License

UNLICENSED — Private use only.
