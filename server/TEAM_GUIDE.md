# BookHouse Backend — Team Guide

> Read this before writing a single line of code.  
> Everything your team needs to start building features is already set up — this guide explains how to use it.

---

## 📋 Table of Contents

1. [Initial Setup](#1-initial-setup)
2. [Project Structure](#2-project-structure)
3. [Naming Convention](#3-naming-convention)
4. [Request Flow](#4-request-flow)
5. [How to Implement a Feature (Step-by-Step)](#5-how-to-implement-a-feature-step-by-step)
6. [Using Existing Utils](#6-using-existing-utils)
7. [Using Existing Middleware](#7-using-existing-middleware)
8. [Constants Reference](#8-constants-reference)
9. [File Upload](#9-file-upload)
10. [Error Handling Rules](#10-error-handling-rules)
11. [API Response Rules](#11-api-response-rules)
12. [Roles & Permissions](#12-roles--permissions)
13. [Team Workflow](#13-team-workflow)

---

## 1. Initial Setup

### Prerequisites

- Node.js v18+
- MongoDB running locally or MongoDB Atlas URI

### Steps

```bash
# 1. Clone the repo
git clone <repo-url>
cd BookStore/server

# 2. Install dependencies
npm install

# 3. Set up environment variables
copy ..\\.env.example ..\\.env
# Then open .env and fill in:
#   MONGODB_URI=mongodb://localhost:27017/book-house
#   JWT_SECRET=any_random_string_min_32_chars
#   JWT_EXPIRE=30d
#   CLIENT_URL=http://localhost:5173
#   PORT=5000
#   NODE_ENV=development

# 4. Start the server
npm run dev
```

### Expected Output

```
✅ MongoDB Connected: localhost
🚀 Server running on port 5000 in development mode
```

### Verify it's working

```
GET http://localhost:5000/health
→ { "status": "OK", "message": "Server is running" }
```

---

## 2. Project Structure

```
server/
├── server.js                        ← Entry point. Do NOT add logic here.
│
├── config/
│   ├── db.config.js                 ← MongoDB connection (already wired)
│   └── constants.config.js          ← All app-wide enums (ROLES, ORDER_STATUS, etc.)
│
├── models/                          ← Mongoose schemas — shape of DB data
│   ├── user.model.js
│   ├── book.model.js
│   ├── review.model.js
│   ├── order.model.js
│   ├── coupon.model.js
│   ├── readingProgress.model.js
│   └── report.model.js
│
├── middleware/                      ← Functions that run BEFORE a controller
│   ├── protect.middleware.js        ← JWT auth — attaches req.user
│   ├── authorize.middleware.js      ← Role check — 403 if not allowed
│   ├── errorHandler.middleware.js   ← Global error catcher (last in chain)
│   └── notFound.middleware.js       ← 404 handler for undefined routes
│
├── utils/                           ← Shared tools — use everywhere
│   ├── appError.util.js             ← Custom error class
│   ├── apiResponse.util.js          ← Standardized response helper
│   ├── catchAsync.util.js           ← Wraps async controllers (no try/catch)
│   ├── generateToken.util.js        ← JWT token generator
│   └── uploadMiddleware.util.js     ← Multer upload handlers
│
├── routes/                          ← API endpoint definitions
│   ├── auth.routes.js               → /api/auth
│   ├── book.routes.js               → /api/books
│   ├── review.routes.js             → /api/reviews
│   ├── order.routes.js              → /api/orders
│   ├── user.routes.js               → /api/users
│   ├── coupon.routes.js             → /api/coupons
│   └── report.routes.js             → /api/reports
│
├── controllers/                     ← YOUR WORK: handle req/res, call services
├── services/                        ← YOUR WORK: business logic
└── validators/                      ← YOUR WORK: input validation schemas
```

---

## 3. Naming Convention

All files follow **dot-notation** with a type suffix:

| Type       | Pattern              | Example                 |
| ---------- | -------------------- | ----------------------- |
| Model      | `name.model.js`      | `book.model.js`         |
| Route      | `name.routes.js`     | `auth.routes.js`        |
| Controller | `name.controller.js` | `auth.controller.js`    |
| Service    | `name.service.js`    | `auth.service.js`       |
| Middleware | `name.middleware.js` | `protect.middleware.js` |
| Validator  | `name.validator.js`  | `auth.validator.js`     |
| Util       | `name.util.js`       | `appError.util.js`      |
| Config     | `name.config.js`     | `db.config.js`          |

> **Always** lowercase. **Multi-word**: use camelCase — `readingProgress.model.js`

---

## 4. Request Flow

Every request follows this exact path:

```
Client Request (HTTP)
        │
        ▼
[ server.js ]
  Global middleware runs first:
  helmet → morgan → mongoSanitize → xss → hpp → rateLimit → cors → body parser
        │
        ▼
[ routes/*.routes.js ]
  Matches the URL and HTTP method
  Applies route-level middleware (protect, authorize, validate)
        │
        ▼
[ middleware/protect.middleware.js ]   ← only on protected routes
  Verifies JWT → attaches req.user
        │
        ▼
[ middleware/authorize.middleware.js ] ← only on role-restricted routes
  Checks req.user.role
        │
        ▼
[ controllers/*.controller.js ]        ← YOUR CODE STARTS HERE
  Receives (req, res, next)
  Calls the service → gets result → sends response
        │
        ▼
[ services/*.service.js ]              ← YOUR BUSINESS LOGIC
  Validates business rules
  Calls Mongoose models directly
        │
        ▼
[ models/*.model.js ]
  Mongoose queries the database
        │
        ▼
[ MongoDB ]
        │
        ▼
[ utils/apiResponse.util.js ]
  Formats and sends the JSON response back to client
```

**If anything throws**, it skips to:

```
[ middleware/errorHandler.middleware.js ] ← handles ALL errors consistently
```

---

## 5. How to Implement a Feature (Step-by-Step)

Using **"User Registration"** as an example. Follow this same pattern for every feature.

### Step 1 — Open the route file

Open [routes/auth.routes.js](routes/auth.routes.js). You'll see the endpoints listed in comments:

```js
// router.post('/register', validate(registerSchema), authController.register);
```

### Step 2 — Create the validator

Create `validators/auth.validator.js`:

```js
import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
```

### Step 3 — Create the validate middleware

Create `middleware/validate.middleware.js`:

```js
import AppError from '../utils/appError.util.js';

const validate = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const message = error.details.map((d) => d.message).join('. ');
    return next(new AppError(message, 400));
  }
  next();
};

export default validate;
```

### Step 4 — Create the service

Create `services/auth.service.js`:

```js
import User from '../models/user.model.js';
import AppError from '../utils/appError.util.js';
import generateToken from '../utils/generateToken.util.js';

export const registerUser = async ({ name, email, password }) => {
  // Check if email already exists
  const existing = await User.findOne({ email });
  if (existing) throw new AppError('Email already in use', 409);

  // Create user (password hashed automatically by User model pre-save hook)
  const user = await User.create({ name, email, password });

  // Generate JWT
  const token = generateToken(user._id);

  return { user, token };
};

export const loginUser = async ({ email, password }) => {
  // Get user with password (password is select:false by default)
  const user = await User.findOne({ email }).select('+password');
  if (!user) throw new AppError('Invalid email or password', 401);

  // Compare password using model instance method
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new AppError('Invalid email or password', 401);

  const token = generateToken(user._id);

  return { user, token };
};
```

### Step 5 — Create the controller

Create `controllers/auth.controller.js`:

```js
import catchAsync from '../utils/catchAsync.util.js';
import ApiResponse from '../utils/apiResponse.util.js';
import { registerUser, loginUser } from '../services/auth.service.js';

export const register = catchAsync(async (req, res) => {
  const { user, token } = await registerUser(req.body);
  ApiResponse.success(res, { user, token }, 'Registered successfully', 201);
});

export const login = catchAsync(async (req, res) => {
  const { user, token } = await loginUser(req.body);
  ApiResponse.success(res, { user, token }, 'Logged in successfully');
});

export const getMe = catchAsync(async (req, res) => {
  ApiResponse.success(res, { user: req.user }, 'User fetched');
});
```

### Step 6 — Wire the route

Uncomment and update `routes/auth.routes.js`:

```js
import { Router } from 'express';
import protect from '../middleware/protect.middleware.js';
import validate from '../middleware/validate.middleware.js';
import { registerSchema, loginSchema } from '../validators/auth.validator.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.get('/me', protect, authController.getMe);

export default router;
```

### Step 7 — Test

```
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Expected:

```json
{
  "success": true,
  "message": "Registered successfully",
  "data": {
    "user": { ... },
    "token": "eyJ..."
  }
}
```

---

## 6. Using Existing Utils

### `appError.util.js` — Throw a controlled error

```js
import AppError from '../utils/appError.util.js';

// Usage: throw new AppError('message', statusCode)
throw new AppError('Book not found', 404);
throw new AppError('Unauthorized', 401);
throw new AppError('Email already exists', 409);
```

> The `errorHandler.middleware.js` catches this and sends it as JSON automatically.  
> **Never** use `res.status(400).json(...)` for errors — always use `AppError` + `next()`.

---

### `apiResponse.util.js` — Send a success response

```js
import ApiResponse from '../utils/apiResponse.util.js';

// Success (default status 200)
ApiResponse.success(res, data, 'message');

// Success with custom status
ApiResponse.success(res, data, 'Created', 201);

// All responses follow: { success, message, data }
```

> **Never** use raw `res.json(...)` — always use `ApiResponse.success()`.

---

### `catchAsync.util.js` — Wrap async controllers

```js
import catchAsync from '../utils/catchAsync.util.js';

// ALWAYS wrap your async controllers with catchAsync
// This forwards any thrown error to errorHandler automatically
export const myController = catchAsync(async (req, res, next) => {
  // No try/catch needed!
  const result = await someAsyncOperation();
  ApiResponse.success(res, result, 'Done');
});
```

---

### `generateToken.util.js` — Create a JWT

```js
import generateToken from '../utils/generateToken.util.js';

const token = generateToken(user._id);
// Returns a signed JWT string using JWT_SECRET and JWT_EXPIRE from .env
```

---

## 7. Using Existing Middleware

### `protect.middleware.js` — Require login

Add `protect` to any route that needs authentication:

```js
import protect from '../middleware/protect.middleware.js';

router.get('/my-orders', protect, orderController.getMyOrders);
// req.user is now available in the controller
```

Inside the controller, access the logged-in user:

```js
const userId = req.user._id;
const userRole = req.user.role;
```

---

### `authorize.middleware.js` — Require a specific role

Always use **after** `protect`. Use constants from `constants.config.js`:

```js
import protect from '../middleware/protect.middleware.js';
import authorize from '../middleware/authorize.middleware.js';
import { ROLES } from '../config/constants.config.js';

// Admin only
router.get('/', protect, authorize(ROLES.ADMIN), controller.getAllUsers);

// Author or Admin
router.post(
  '/',
  protect,
  authorize(ROLES.AUTHOR, ROLES.ADMIN),
  controller.createBook
);

// Any logged-in user (just use protect, no authorize needed)
router.get('/me', protect, controller.getMe);
```

---

## 8. Constants Reference

Import from `config/constants.config.js`. **Never hardcode strings** — always use these:

```js
import {
  ROLES,
  ORDER_STATUS,
  REPORT_STATUS,
  REPORT_TYPE,
  UPLOAD_PATHS,
} from '../config/constants.config.js';

ROLES.USER; // 'user'
ROLES.AUTHOR; // 'author'
ROLES.ADMIN; // 'admin'

ORDER_STATUS.PENDING; // 'pending'
ORDER_STATUS.COMPLETED; // 'completed'
ORDER_STATUS.CANCELLED; // 'cancelled'

REPORT_STATUS.PENDING; // 'pending'
REPORT_STATUS.REVIEWED; // 'reviewed'
REPORT_STATUS.DISMISSED; // 'dismissed'

REPORT_TYPE.USER; // 'user'
REPORT_TYPE.BOOK; // 'book'
REPORT_TYPE.REVIEW; // 'review'

UPLOAD_PATHS.BOOKS; // 'uploads/books'
UPLOAD_PATHS.COVERS; // 'uploads/covers'
```

---

## 9. File Upload

Two Multer instances are ready in `utils/uploadMiddleware.util.js`:

```js
import {
  uploadBookFile,
  uploadCoverImage,
} from '../utils/uploadMiddleware.util.js';

// In a route:
router.post(
  '/',
  protect,
  authorize(ROLES.AUTHOR, ROLES.ADMIN),
  uploadCoverImage, // handles field: "coverImage" → saves to uploads/covers/
  uploadBookFile, // handles field: "bookFile"   → saves to uploads/books/
  bookController.createBook
);

// In the controller, the file path is:
req.file.path; // if single upload
req.files.coverImage; // if using fields()
```

Uploaded files are served at:

```
GET http://localhost:5000/uploads/covers/cover-1234567890.jpg
GET http://localhost:5000/uploads/books/book-1234567890.pdf
```

---

## 10. Error Handling Rules

| Situation          | What to do                                                       |
| ------------------ | ---------------------------------------------------------------- |
| Resource not found | `throw new AppError('Book not found', 404)`                      |
| Not authenticated  | Already handled by `protect` middleware                          |
| Not authorized     | Already handled by `authorize` middleware                        |
| Validation failed  | `throw new AppError('validation message', 400)`                  |
| Duplicate entry    | Let Mongoose throw — `errorHandler` converts `code 11000` to 409 |
| Bad ObjectId       | Let Mongoose throw — `errorHandler` converts `CastError` to 400  |
| Unknown/unexpected | Just throw or let it bubble — `errorHandler` sends 500           |

### ❌ Never do this:

```js
// Don't catch and suppress errors
try {
  const user = await User.findById(id);
} catch (e) {
  return res.status(500).json({ message: 'error' }); // BAD
}
```

### ✅ Always do this:

```js
// Let catchAsync forward it to errorHandler
export const getUser = catchAsync(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', 404);
  ApiResponse.success(res, { user }, 'User found');
});
```

---

## 11. API Response Rules

All responses **must** follow this shape:

```json
// Success
{
  "success": true,
  "message": "Books fetched successfully",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Book not found"
}
```

Use **only** these two methods:

```js
ApiResponse.success(res, data, message, statusCode); // for success
// Errors are handled automatically by errorHandler — never send error responses manually
```

---

## 12. Roles & Permissions

| Action                 | user | author | admin |
| ---------------------- | ---- | ------ | ----- |
| Browse & search books  | ✅   | ✅     | ✅    |
| Buy books              | ✅   | ✅     | ✅    |
| Leave reviews          | ✅   | ✅     | ✅    |
| Add to favorites       | ✅   | ✅     | ✅    |
| Track reading progress | ✅   | ✅     | ✅    |
| Apply coupons          | ✅   | ✅     | ✅    |
| Submit reports         | ✅   | ✅     | ✅    |
| Publish/upload books   | ❌   | ✅     | ✅    |
| Manage own books       | ❌   | ✅     | ✅    |
| Manage all books       | ❌   | ❌     | ✅    |
| Manage all users       | ❌   | ❌     | ✅    |
| Manage coupons         | ❌   | ❌     | ✅    |
| Review reports         | ❌   | ❌     | ✅    |

---

## 13. Team Workflow

### Before you start a feature

1. **Pull latest** from main branch
2. **Create a feature branch**: `git checkout -b feature/auth-register`
3. Open the relevant **route file** — read the comments to know what's needed
4. Follow the 7-step pattern in [Section 5](#5-how-to-implement-a-feature-step-by-step)

### Files you will create (per feature)

```
controllers/name.controller.js   ← always
services/name.service.js         ← always
validators/name.validator.js     ← if the route accepts a body
```

### Files you will edit (per feature)

```
routes/name.routes.js            ← uncomment the relevant routes
```

### Files you should NEVER edit

```
server.js                        ← route mounting only, ask team lead
middleware/*.middleware.js        ← ask team lead before touching
utils/*.util.js                   ← ask team lead before touching
config/*.config.js                ← ask team lead before touching
```

### Commit convention

```
feat: add user registration endpoint
fix: handle duplicate email error in auth
refactor: extract order total calculation to service
```

### Before opening a Pull Request

- [ ] Server starts without errors (`npm run dev`)
- [ ] Your endpoint returns `{ success, message, data }` format
- [ ] Protected routes return 401 without a token
- [ ] Role-restricted routes return 403 with wrong role
- [ ] Invalid input returns 400 with a clear message
