# BookHouse

> A full-stack e-book marketplace built with the MERN stack. Authors publish and manage books, readers discover and purchase them, and admins oversee the platform — all wrapped in a modern, responsive UI with real-time analytics.

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│                   Client (React + Vite)         │
│  Port 5173 (dev) → proxies /api → localhost:5000│
│  Production    → /api routed to Vercel function │
├─────────────────────────────────────────────────┤
│               Server (Express + Mongoose)       │
│  Port 5000 (dev) → app.listen()                 │
│  Vercel         → serverless function (api/)    │
├─────────────────────────────────────────────────┤
│              MongoDB Atlas (Mongoose ODM)       │
│  Cached connection across lambda invocations    │
├─────────────────────────────────────────────────┤
│          Cloudinary (image hosting)             │
│  Avatars, book covers — no local disk storage   │
└─────────────────────────────────────────────────┘
```

- **Client**: React 19 SPA built with Vite. Styled with CSS Modules. Animations via Framer Motion. Charts via Recharts.
- **Server**: Express API with a service layer pattern. Route → Controller → Service → Model.
- **Database**: MongoDB with Mongoose ODM. Collections: users, books, reviews, orders, carts, coupons, follows, OTPs, reading progress.
- **Media**: Cloudinary for all image uploads (avatars, covers). No local disk I/O — serverless-compatible.
- **Deployment**: Vercel (serverless functions for API, static hosting for client). Single root `.env` for all environments.

---

## Features

### User System
- Three roles: **Reader**, **Author**, **Admin** — each with distinct permissions and views
- JWT-based authentication with token storage in `localStorage`
- OTP-based password reset flow (forgot → verify → reset)
- Profile management (name, email, password, avatar)
- Account deactivation with cascading cleanup (orders, reviews, follows, cart)
- Follow/unfollow other users; follower counts on profiles

### Book Management
- Full CRUD for authors
- Draft-by-default workflow: books are created as drafts, authors publish manually
- Rich metadata: title, author, description, genre, format (hardcover, paperback, e-book, audiobook), price, cover image, file upload
- Search across titles, authors, and descriptions
- Filter by genre, format, price range; sort by rating, price, date

### Purchases & Library
- Server-synced shopping cart per user (guest cart merges on login)
- Coupon code system with percentage discounts, usage limits, and expiry
- Order placement with automatic status tracking
- Personal library — purchased books are available for reading/download
- Purchase-gated reviews: only buyers can rate and review

### Author Dashboard
- Real-time KPIs: total books, total sales, revenue, average rating
- Revenue trend chart (6-month rolling)
- Genre distribution pie chart
- Top-selling books leaderboard
- Per-book management: edit, publish/unpublish, delete

### Admin Panel
- User management: view all users, deactivate accounts
- Coupon management: create, list, delete discount codes
- Report management: view and resolve user reports
- Order management: view all platform orders

### Reader Experience
- Browse books with advanced filtering and pagination
- Bookmark favorites (synced to account)
- Rate and review purchased books
- View author profiles with their published works
- Responsive design with dark mode support
- Scroll-triggered animations (20–30% visibility threshold)

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | React | 19.2 |
| | Vite | 7.3 |
| | React Router | 6.21 |
| | Framer Motion | 12.38 |
| | Recharts | 3.8 |
| | Axios | 1.6 |
| | React Icons | 5.6 |
| **Backend** | Node.js | 18+ |
| | Express | 4.18 |
| | Mongoose | 8.0 |
| | JSON Web Token | 9.0 |
| | bcryptjs | 2.4 |
| | Joi | 17.12 |
| | Nodemailer | 8.0 |
| | Multer + Cloudinary | 1.4 / 4.0 |
| **DevOps** | Vite | 7.3 |
| | ESLint | 9.39 |
| | Vitest | 4.1 |
| | Supertest | 7.2 |
| **Infrastructure** | MongoDB Atlas | — |
| | Cloudinary | — |
| | Vercel (hosting) | — |

---

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- MongoDB 6+ (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier)
- [Cloudinary](https://cloudinary.com) account (free tier, for image uploads)

### Installation

```bash
# Clone the repository
git clone https://github.com/zAyman01/BookHouse.git
cd book-house

# Install all dependencies (root + client + server)
npm run install-all
```

### Environment Configuration

```bash
# Copy the environment template
cp .env.example .env
```

Edit `.env` with your credentials:

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | 64-char hex string for token signing | Yes |
| `JWT_EXPIRE` | Token expiry duration (e.g., `30d`) | Yes |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API key | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | Yes |
| `SMTP_HOST` | SMTP server hostname | For email |
| `SMTP_PORT` | SMTP server port | For email |
| `SMTP_USER` | SMTP username | For email |
| `SMTP_PASS` | SMTP password | For email |
| `CLIENT_URL` | CORS origin (dev: `http://localhost:5173`) | Yes |
| `VITE_API_URL` | Client API base URL (`/api` for relative) | Yes |

> **Note**: SMTP vars can be left empty — the app falls back to [Ethereal](https://ethereal.email) test emails (logged to console only).

### Database Seeding

```bash
cd server && npm run seed && cd ..
```

This creates sample data:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@bookhouse.com | admin1234 |
| Reader | alice@bookhouse.com | reader1234 |
| Author | *slug*@bookhouse.com | author1234 |

Author emails follow the pattern `sluggified-name@bookhouse.com` (e.g., `fitzgerald@bookhouse.com`). Run the seed script to see the full list.

### Development

```bash
# Start both client and server concurrently
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend**: http://localhost:5000
- **Health check**: http://localhost:5000/api/health

The Vite dev server proxies `/api` requests to the Express backend, so all requests appear same-origin during development.

---

## Project Structure

```
book-house/
├── api/                          # Vercel serverless entry point
│   └── index.js                  # Imports and re-exports Express app
│
├── client/                       # React SPA (Vite)
│   ├── public/                   # Static assets (favicon)
│   ├── src/
│   │   ├── assets/               # Images, static resources
│   │   ├── components/           # Reusable UI components
│   │   │   ├── Header.jsx        # Navigation + auth-aware links
│   │   │   ├── Footer.jsx
│   │   │   ├── BookCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AuthorRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── ScrollToTop.jsx
│   │   │   ├── PageLoader.jsx
│   │   │   └── Spinner.jsx
│   │   ├── context/              # React Context providers
│   │   │   ├── AuthContext.jsx    # Auth state, login/logout/register
│   │   │   ├── CartContext.jsx    # Cart state (server + localStorage)
│   │   │   ├── ThemeContext.jsx   # Dark/light mode
│   │   │   └── NotificationContext.jsx  # Toast notifications
│   │   ├── hooks/                # Custom hooks
│   │   │   └── useAuth.js        # Auth context consumer
│   │   ├── pages/                # Route page components
│   │   │   ├── Home.jsx          # Landing page with hero, stats, genres
│   │   │   ├── Library.jsx       # Browse & filter books
│   │   │   ├── Book-Detail.jsx   # Book details + reviews
│   │   │   ├── Cart.jsx          # Shopping cart
│   │   │   ├── SignIn.jsx / SignUp.jsx
│   │   │   ├── ForgotPassword.jsx / ResetPassword.jsx
│   │   │   ├── Account.jsx       # Profile, library, security, prefs
│   │   │   ├── Favorites.jsx     # Bookmarked books
│   │   │   ├── Orders.jsx        # Order history
│   │   │   ├── AuthorDashboard.jsx  # KPIs, charts, book management
│   │   │   ├── AuthorProfile.jsx # Public author page
│   │   │   ├── Admin.jsx         # Users, coupons, reports, orders
│   │   │   ├── Library.jsx       # Book discovery
│   │   │   └── Static pages      # Privacy, Terms, Contact, FAQs
│   │   ├── services/             # API client functions
│   │   │   ├── api.js            # Axios instance (baseURL, interceptors)
│   │   │   ├── auth.service.js
│   │   │   ├── book.service.js
│   │   │   ├── cart.service.js
│   │   │   ├── follow.service.js
│   │   │   ├── order.service.js
│   │   │   ├── review.service.js
│   │   │   └── user.service.js
│   │   └── utils/                # Animation variants, helpers
│   ├── eslint.config.js          # ESLint flat config
│   └── vite.config.js            # Vite configuration + proxy
│
├── server/                       # Express API
│   ├── app.js                    # Express app (exported, no listen())
│   ├── server.js                 # Local dev server (app.listen())
│   ├── config/
│   │   ├── db.config.js          # MongoDB connection
│   │   └── cloudinary.config.js  # Cloudinary SDK setup
│   ├── controllers/              # Request handlers
│   ├── middleware/
│   │   ├── protect.middleware.js # JWT verification
│   │   ├── errorHandler.middleware.js  # Global error handler
│   │   └── notFound.middleware.js
│   ├── models/                   # Mongoose schemas
│   │   ├── user.model.js
│   │   ├── book.model.js
│   │   ├── review.model.js
│   │   ├── order.model.js
│   │   ├── cart.model.js
│   │   ├── coupon.model.js
│   │   ├── follow.model.js
│   │   ├── otp.model.js
│   │   └── readingProgress.model.js
│   ├── routes/                   # Express routers
│   ├── services/                 # Business logic layer
│   │   ├── auth.service.js
│   │   ├── book.service.js
│   │   ├── cart.service.js
│   │   ├── email.service.js
│   │   ├── follow.service.js
│   │   ├── order.service.js
│   │   └── review.service.js
│   ├── utils/
│   │   ├── appError.util.js      # Custom error class
│   │   ├── generateToken.util.js # JWT generation
│   │   ├── uploadMiddleware.util.js  # Multer + Cloudinary
│   │   └── avatarUpload.util.js  # Avatar-specific upload
│   ├── validators/               # Joi validation schemas
│   ├── seed.js                   # Database seeder
│   └── tests/                    # Vitest + Supertest suite
│
├── .env                          # Environment variables (gitignored)
├── .env.example                  # Environment template
├── .gitignore
├── vercel.json                   # Vercel deployment config
└── package.json                  # Root workspace (build, dev scripts)
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start client + server concurrently |
| `npm run client` | Start Vite dev server only |
| `npm run server` | Start Express with Nodemon |
| `npm run build` | Install client deps + build for production |
| `npm run install-all` | Install deps in root, client, and server |
| `npm run start` | Start Express server in production mode |
| `npm run seed` | Seed database with sample data (run from `server/`) |
| `npm run lint` | Run ESLint on client code |
| `npm test` | Run Vitest API test suite |

---

## API Reference

### Authentication

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Create a new account |
| POST | `/api/auth/login` | — | Sign in |
| GET | `/api/auth/me` | ✓ | Get current user profile |
| PUT | `/api/auth/profile` | ✓ | Update name and email |
| PUT | `/api/auth/password` | ✓ | Change password |
| POST | `/api/auth/forgot-password` | — | Request password reset OTP |
| POST | `/api/auth/verify-otp` | — | Verify OTP (validates without consuming) |
| POST | `/api/auth/reset-password` | — | Reset password with OTP |
| DELETE | `/api/auth/account` | ✓ | Deactivate account and cascade cleanup |

### Books

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/books` | — | List published books (paginated, filterable) |
| GET | `/api/books/genres` | — | Get genre counts |
| GET | `/api/books/:id` | — | Get book details |
| POST | `/api/books` | Author | Create a new book (draft) |
| PUT | `/api/books/:id` | Author | Update book details |
| PUT | `/api/books/:id/publish` | Author | Publish/unpublish a book |
| DELETE | `/api/books/:id` | Author | Delete a book |
| GET | `/api/books/analytics` | Author | Dashboard KPIs and charts |
| GET | `/api/books/my` | Author | List my books |

### Reviews

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/reviews/book/:id` | ✓ | Create a review (purchase-gated) |
| PUT | `/api/reviews/:id` | ✓ | Update a review |
| DELETE | `/api/reviews/:id` | ✓ | Delete a review |

### Orders

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | ✓ | Place an order |
| GET | `/api/orders/my` | ✓ | Get my order history |

### Cart

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/cart` | ✓ | Get current cart |
| POST | `/api/cart` | ✓ | Add item to cart |
| PUT | `/api/cart/:bookId` | ✓ | Update item quantity |
| DELETE | `/api/cart/:bookId` | ✓ | Remove item from cart |
| DELETE | `/api/cart` | ✓ | Clear entire cart |
| POST | `/api/cart/merge` | ✓ | Merge guest cart on login |

### Follows

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/follow/:userId` | ✓ | Follow a user |
| DELETE | `/api/follow/:userId` | ✓ | Unfollow a user |
| GET | `/api/follow/:userId/stats` | — | Get follower/following counts |
| GET | `/api/follow/:userId/check` | ✓ | Check if following |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users` | Admin | List all users |
| DELETE | `/api/users/:id` | Admin | Deactivate a user |
| GET | `/api/coupons` | Admin | List all coupons |
| POST | `/api/coupons` | Admin | Create a coupon |
| DELETE | `/api/coupons/:id` | Admin | Delete a coupon |
| GET | `/api/reports` | Admin | List all reports |
| PUT | `/api/reports/:id` | Admin | Update report status |
| GET | `/api/orders` | Admin | List all orders |

### Health

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/health` | — | Health check (uptime, timestamp) |

---

## Authentication Flow

```
Register/Login
  └─ POST /api/auth/register (or /login)
      └─ Server validates with Joi
          └─ Creates/finds user
              └─ Generates JWT (expiry from JWT_EXPIRE)
                  └─ Returns { token, user }

Forgot Password
  └─ POST /api/auth/forgot-password { email }
      └─ Generates 6-digit OTP, stores in DB
          └─ Sends email via Nodemailer (SMTP or Ethereal)
              └─ Returns success (no OTP leak)

Verify OTP
  └─ POST /api/auth/verify-otp { email, otp }
      └─ Checks OTP exists and is not expired
          └─ Does NOT mark as used ─ validates only
              └─ Returns success

Reset Password
  └─ POST /api/auth/reset-password { email, otp, password }
      └─ Validates OTP again
          └─ Updates password (hashed with bcryptjs)
              └─ Marks OTP as used (consumed)
                  └━ Clears existing sessions (force re-login)
```

> **Security**: OTPs are never leaked in API responses. The verify step validates without consuming, so users aren't locked out by a failed verification attempt.

---

## Deployment

The project is optimized for [Vercel](https://vercel.com) deployment with the API running as serverless functions.

### Vercel Setup

1. **Push to GitHub** and import the repository in the Vercel dashboard
2. **Root directory**: `./` (default)
3. **Build command**: `npm run build` (defined in `vercel.json`)
4. **Output directory**: `client/dist` (defined in `vercel.json`)
5. **Serverless function**: `api/index.js` — automatically detected

### Environment Variables

Set these in the Vercel project dashboard:

| Variable | Example | Purpose |
|----------|---------|---------|
| `MONGODB_URI` | `mongodb+srv://...` | Database connection |
| `JWT_SECRET` | `<64-char-hex>` | Token signing |
| `CLOUDINARY_CLOUD_NAME` | `dfwxuucfi` | Image uploads |
| `CLOUDINARY_API_KEY` | `7769...` | Image uploads |
| `CLOUDINARY_API_SECRET` | `3kzQb...` | Image uploads |
| `SMTP_HOST` | `smtp.gmail.com` | Email sending |
| `SMTP_PORT` | `587` | Email sending |
| `SMTP_USER` | `user@gmail.com` | Email auth |
| `SMTP_PASS` | `<app-password>` | Email auth |
| `CLIENT_URL` | `https://your-app.vercel.app` | CORS origin |
| `VITE_API_URL` | `/api` | Client API base URL |
| `NODE_ENV` | `production` | Environment mode |

### Architecture Considerations

- **MongoDB connection** is cached globally (`global._mongooseCache`) with `maxPoolSize: 1` — the standard Vercel pattern. First request is slow (~cold start), subsequent requests are fast.
- **No disk storage**: All image uploads go directly to Cloudinary. Book files use `memoryStorage`. The `/tmp` directory on Vercel is not used.
- **Body limit**: 4 MB (Vercel's maximum). Uploads larger than 4 MB should use client-side direct upload to Cloudinary.
- **Rate limiting**: Best-effort in serverless (per-function-instance counters). For strict rate limiting, use Vercel Edge middleware or a third-party service.

### Local Production Test

```bash
# Build the client
npm run build

# Start the server in production mode
NODE_ENV=production npm run start
```

---

## Development

### Code Quality

```bash
# Lint client code
cd client && npm run lint
```

The project uses ESLint 9 with flat config (`client/eslint.config.js`). The following plugins are active:

- `@eslint/js` — recommended rules
- `eslint-plugin-react-hooks` — hooks rules
- `eslint-plugin-react-refresh` — Fast Refresh compatibility

### Testing

```bash
# Run API test suite (from server directory)
cd server && npm test
```

The test suite uses Vitest and Supertest to validate:
- User registration, login, authentication
- Book CRUD, search, filtering
- Review creation and management
- Follow/unfollow functionality
- Forgot password and reset flow
- Author analytics endpoint
- 404 and error handling

### Project Conventions

- **ESM only**: All `.js` files use `import`/`export` syntax. Root `package.json` has `"type": "module"`.
- **Service layer pattern**: Routes → Controllers → Services → Models. Controllers are thin; business logic lives in services.
- **Error handling**: Custom `AppError` class with `isOperational` flag. The global error handler distinguishes operational errors (sent to client) from programming errors (logged, generic message sent).
- **CSS Modules**: Component-scoped styles with `.module.css` files. No CSS-in-JS.
- **Server-synced cart**: Cart state is stored on the server for authenticated users and in `localStorage` for guests. Guest cart merges into server cart on login.

---

## License

ISC
