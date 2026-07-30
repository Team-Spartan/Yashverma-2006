# Backend API

Production-ready REST API built with Node.js, TypeScript, Express, Prisma, and PostgreSQL.

## Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Cache**: Redis
- **Auth**: JWT (access + refresh tokens)
- **Validation**: Zod
- **Logging**: Pino
- **API Docs**: Swagger/OpenAPI
- **Testing**: Vitest
- **Containerization**: Docker + Docker Compose

## Features

- JWT authentication with refresh tokens
- Role-based access control (Admin/User)
- Request validation with Zod
- Pagination, filtering, sorting, and search
- File upload with Multer
- Rate limiting and security headers
- Centralized error handling
- Health check endpoint
- Swagger API documentation
- PostgreSQL database with Prisma migrations
- Redis caching
- CI/CD with GitHub Actions

## Project Structure

```
src/
├── config/          # Environment, database, Redis configuration
├── controllers/     # Request handlers
├── routes/          # API route definitions
├── services/        # Business logic
├── repositories/    # Database access layer
├── middleware/       # Express middleware
├── validators/      # Zod schemas for validation
├── utils/           # Helper functions, logger, error classes
├── types/           # TypeScript type definitions
├── docs/            # Swagger documentation
└── index.ts         # Application entry point
```

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Docker & Docker Compose (optional)

### Local Development

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database
npm run seed

# Start development server
npm run dev
```

### Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop all services
docker-compose down
```

### API Documentation

Visit `http://localhost:3000/api-docs` for Swagger UI.

### Default Users

| Email              | Password  | Role  |
| ------------------ | --------- | ----- |
| admin@example.com  | Admin@123 | ADMIN |
| user@example.com   | User@123  | USER  |

## API Endpoints

### Auth

| Method | Endpoint                | Description          | Auth |
| ------ | ----------------------- | -------------------- | ---- |
| POST   | /api/auth/register      | Register new user    | No   |
| POST   | /api/auth/login         | Login                | No   |
| POST   | /api/auth/logout        | Logout               | Yes  |
| POST   | /api/auth/refresh-token | Refresh access token | No   |
| POST   | /api/auth/forgot-password | Request password reset | No |
| POST   | /api/auth/reset-password | Reset password     | No   |
| GET    | /api/auth/verify-email  | Verify email         | No   |
| GET    | /api/auth/profile       | Get profile          | Yes  |

### Users

| Method | Endpoint                 | Description     | Auth  |
| ------ | ------------------------ | --------------- | ----- |
| GET    | /api/users/profile       | Get own profile | Yes   |
| PUT    | /api/users/profile       | Update profile  | Yes   |
| DELETE | /api/users/profile       | Delete account  | Yes   |
| POST   | /api/users/change-password | Change password | Yes |
| POST   | /api/users/avatar        | Upload avatar   | Yes   |
| GET    | /api/users               | List users      | Admin |
| GET    | /api/users/stats         | User statistics | Admin |
| GET    | /api/users/:id           | Get user by ID  | Admin |
| PUT    | /api/users/:id/role      | Update role     | Admin |
| DELETE | /api/users/:id           | Delete user     | Admin |

### Health

| Method | Endpoint     | Description  |
| ------ | ------------ | ------------ |
| GET    | /api/health  | Health check |

## Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

## Linting

```bash
# Lint
npm run lint

# Format
npm run format
```

## Environment Variables

See `.env.example` for all required and optional environment variables.

## Architecture

### Layered Architecture

1. **Routes** - Define API endpoints and apply middleware
2. **Controllers** - Handle HTTP request/response
3. **Services** - Business logic layer
4. **Repositories** - Database access layer (Prisma)
5. **Middleware** - Cross-cutting concerns (auth, validation, errors)

### Key Design Decisions

- **Separation of concerns**: Each layer has a single responsibility
- **Repository pattern**: Database operations abstracted behind repository classes
- **Service layer**: Business logic isolated from HTTP concerns
- **Validation at boundary**: Zod schemas validate all input at the route level
- **Centralized error handling**: All errors converted to consistent API responses
- **Operational errors**: `ApiError` class distinguishes user-facing errors from bugs

## License

MIT
