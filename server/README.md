# BookHouse — Backend Server

Express.js + MongoDB REST API for the BookHouse application.

---

## 📁 Folder Structure

```
server/
├── config/           # DB connection and environment config
├── controllers/      # Route handlers — receive req, call service, send res
├── helpers/          # Small reusable utility functions (e.g., formatDate, paginate)
├── middleware/       # Custom middleware (auth, error handler, validate)
├── models/           # Mongoose schemas & models
├── Repository/       # Data access layer — all DB queries live here
├── routes/           # Express routers — map HTTP endpoints to controllers
├── services/         # Business logic layer — called by controllers
├── utils/            # General utilities (e.g., ApiResponse, AppError classes)
├── validators/       # Request validation schemas (e.g., using Joi or express-validator)
└── server.js         # App entry point
```

---

## 🔄 Request Flow

```
Client Request
     │
     ▼
[ server.js ]          → Global middleware (helmet, cors, rate-limit, morgan)
     │
     ▼
[ routes/ ]            → Maps endpoint to the correct controller
     │
     ▼
[ middleware/ ]        → Auth check (JWT), input validation, etc.
     │
     ▼
[ controllers/ ]       → Receives req/res, delegates logic to service
     │
     ▼
[ services/ ]          → Business logic (e.g., register user, place order)
     │
     ▼
[ Repository/ ]        → Database queries via Mongoose models
     │
     ▼
[ models/ ]            → Mongoose schema definitions
     │
     ▼
[ Database (MongoDB) ] → Data persisted / retrieved
     │
     ▼
[ utils/ApiResponse ]  → Standardized JSON response sent back to client
```

---

## 📐 Layer Responsibilities

| Layer          | Responsibility                   | Example                         |
| -------------- | -------------------------------- | ------------------------------- |
| `routes/`      | Define HTTP method + path        | `POST /api/auth/register`       |
| `middleware/`  | Auth, validation, error handling | `protect.js`, `validate.js`     |
| `controllers/` | Handle req/res, call services    | `authController.js`             |
| `services/`    | Business logic                   | `authService.js`                |
| `Repository/`  | DB queries only                  | `userRepository.js`             |
| `models/`      | Mongoose schema                  | `User.js`, `Book.js`            |
| `helpers/`     | Small reusable functions         | `paginate.js`                   |
| `validators/`  | Input schema validation          | `authValidator.js`              |
| `utils/`       | Shared classes/helpers           | `AppError.js`, `ApiResponse.js` |
| `config/`      | DB connection, env setup         | `db.js`                         |

---
