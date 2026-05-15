# BookHouse — Full-Stack Completion Plan

## Architecture Philosophy

**Frontend → Backend → Database**
Every feature flows: React page → API service → Express route → Controller → Service → Mongoose Model → MongoDB

## Dependency Map

```
Phase 1 (Backend APIs)     ──→  Phase 2 (Frontend infra)
                                      │
                    ┌─────────────────┼──────────────────┐
                    ▼                 ▼                   ▼
            Phase 3 (Auth)    Phase 4 (Library/      Phase 5 (Favorites/
                                    Favorites)           Cart/Orders)
                    │                 │                   │
                    └────────┬────────┘                   │
                             ▼                            │
                    Phase 6 (Book Detail/Read)            │
                             │                            │
                             └──────────┬─────────────────┘
                                        ▼
                               Phase 7 (Author Dashboard)
                                        │
                               Phase 8 (Admin features)
                                        │
                               Phase 9 (Missing pages)
                                        │
                               Phase 10 (Polish & QA)
```

---

## Phase 1 — Complete the Backend API

### 1A — Orders API

**Files to create:**
- `server/validators/order.validator.js`
- `server/services/order.service.js`
- `server/controllers/order.controller.js`
- Uncomment + wire `server/routes/order.routes.js`

#### order.validator.js
```js
import Joi from 'joi';

export const placeOrderSchema = Joi.object({
  bookIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  couponCode: Joi.string().optional(),
});
```

#### order.service.js logic
- Fetch books by IDs, verify all exist and are published
- Check none are already in `requestingUser.library`
- Snapshot prices at purchase time
- Apply coupon if provided (call `Coupon.validateCoupon()`)
- Create Order with `ORDER_STATUS.COMPLETED`
- Add books to `user.library` via `$addToSet`
- Increment coupon `usedCount` after order save

#### order.controller.js
- `placeOrder`, `getMyOrders`, `getOrderById`, `getAllOrders`
- All wrapped with `catchAsync`, responses via `ApiResponse.success`

#### Routes (`order.routes.js`)
```js
router.post('/', protect, validate(placeOrderSchema), orderController.placeOrder);
router.get('/my', protect, orderController.getMyOrders);
router.get('/:id', protect, orderController.getOrderById);
router.get('/', protect, authorize(ROLES.ADMIN), orderController.getAllOrders);
```

---

### 1B — Users API

**Files to create:**
- `server/services/user.service.js`
- `server/controllers/user.controller.js`
- Uncomment + wire `server/routes/user.routes.js`

#### user.service.js — 8 methods
| Method | Logic |
|--------|-------|
| `getLibrary(userId)` | `User.findById().populate('library', 'title coverImage authorName price')` — select `-fileUrl` |
| `getFavorites(userId)` | Same, populate `favorites` |
| `addFavorite(bookId, userId)` | Verify book exists & published, `$addToSet` |
| `removeFavorite(bookId, userId)` | `$pull` |
| `getProgress(bookId, userId)` | `ReadingProgress.findOne()` — verify book in library first |
| `updateProgress(bookId, data, userId)` | `findOneAndUpdate` with `upsert: true` |
| `getAllUsers(query)` | Paginate, filter by `?role=`, never return password |
| `deactivateUser(id)` | Set `isActive: false`, cannot deactivate another admin |

#### Routes (`user.routes.js`)
```js
router.get('/library', protect, userController.getLibrary);
router.get('/favorites', protect, userController.getFavorites);
router.post('/favorites/:bookId', protect, userController.addFavorite);
router.delete('/favorites/:bookId', protect, userController.removeFavorite);
router.get('/progress/:bookId', protect, userController.getProgress);
router.put('/progress/:bookId', protect, userController.updateProgress);
router.get('/', protect, authorize(ROLES.ADMIN), userController.getAllUsers);
router.delete('/:id', protect, authorize(ROLES.ADMIN), userController.deactivateUser);
```

---

### 1C — Reports API

**Files to create:**
- `server/validators/report.validator.js`
- `server/services/report.service.js`
- `server/controllers/report.controller.js`
- Uncomment + wire `server/routes/report.routes.js`

#### report.service.js — 4 methods
- `submitReport`: Validate target exists by type, prevent self-reporting for type `user`
- `getAllReports`: Paginate, filter by `?status=` and `?type=`
- `getReportById`: Populate `reportedBy` with name + email
- `updateReportStatus`: Only allow PENDING → REVIEWED/DISMISSED

#### Routes (`report.routes.js`)
```js
router.post('/', protect, reportController.submitReport);
router.get('/', protect, authorize(ROLES.ADMIN), reportController.getAllReports);
router.get('/:id', protect, authorize(ROLES.ADMIN), reportController.getReportById);
router.put('/:id', protect, authorize(ROLES.ADMIN), reportController.updateReportStatus);
```

---

## Phase 2 — Frontend Infrastructure

### 2A — API Service Layer (`client/src/services/`)

Create axios instance with base URL, interceptors for auth token + error handling.

**Files to create:**

- `services/api.js` — Axios instance with `VITE_API_URL`, request interceptor to attach JWT from localStorage, response interceptor to handle 401 → redirect to signin
- `services/auth.service.js` — `login()`, `register()`, `getMe()`, `logout()`
- `services/book.service.js` — `getBooks()`, `getBook()`, `createBook()`, `updateBook()`, `deleteBook()`
- `services/review.service.js` — `getReviews()`, `createReview()`, `updateReview()`, `deleteReview()`
- `services/order.service.js` — `placeOrder()`, `getMyOrders()`, `getOrder()`
- `services/user.service.js` — `getLibrary()`, `getFavorites()`, `addFavorite()`, `removeFavorite()`, `getProgress()`, `updateProgress()`
- `services/coupon.service.js` — `validateCoupon()`
- `services/report.service.js` — `submitReport()`

Each service exports plain async functions that call `api.get/post/put/delete` and return `response.data.data`.

### 2B — Auth Context (`client/src/context/AuthContext.jsx`)

```jsx
// Provides: user, token, loading, login, register, logout, isAuthenticated, isAdmin
// On mount: check localStorage for token, call GET /api/auth/me to validate
// login(): call authService.login(), store token in localStorage, set user
// logout(): remove token, clear user
```

### 2C — Custom Hooks (`client/src/hooks/`)

- `useAuth()` — Shortcut to `useContext(AuthContext)`
- `useApi(serviceMethod, ...deps)` — Generic hook for loading/error/data states
- `useFavorites()` — Wraps user service favorites methods, provides toggle + check

### 2D — Utils (`client/src/utils/`)

- `constants.js` — Route paths, book genres, formats, price defaults
- `format.js` — Price formatting (EGP), date formatting, rating display
- `validators.js` — Shared validation functions (email, password strength, etc.)

### 2E — Route Guards

Create a `ProtectedRoute` component that checks `isAuthenticated` from AuthContext, redirects to `/signin` if not logged in.

Create an `AdminRoute` that additionally checks `isAdmin`.

Wrap protected pages in `App.jsx`:
```jsx
<Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
<Route path="/dashboard" element={<ProtectedRoute><AuthorDashboard /></ProtectedRoute>} />
```

### 2F — Fix Header Navigation

Replace `<a href>` with `<Link>` from react-router-dom in `Header.jsx` to prevent full page reloads.

---

## Phase 3 — Auth Integration

### 3A — SignIn Page
- Remove mock console.log
- Import `useAuth()` hook
- On submit: call `login(email, password)`
- On success: redirect to `/` or a return URL
- Show inline API errors below the form

### 3B — SignUp Page
- Import `useAuth()` hook
- On submit: call `register(name, email, password)`
- On success: redirect to `/signin` with a success message
- Show inline API errors

### 3C — Auth-Dependent UI
- Header: Show user name + avatar + logout button when authenticated, show Sign In/Sign Up buttons when not
- Disable "Add to Cart", "Add to Favorites" for unauthenticated users (with tooltip or redirect)

---

## Phase 4 — Library & Favorites (Real Data)

### 4A — Library Page
- Replace hardcoded `ALL_BOOKS` with API call to `GET /api/books?search=&genre=&format=&maxPrice=&sort=&page=&limit=`
- Connect search, filter, sort, pagination to URL query params
- Add loading skeleton states
- Connect favorites toggle to `POST / DELETE /api/users/favorites/:bookId`

### 4B — Favorites Page
- Replace hardcoded `FAVORITE_BOOKS` with API call to `GET /api/users/favorites`
- Show empty state when no favorites
- "Add to Cart" button should call order service (Phase 5)
- "View More" → navigate to `/library`

### 4C — BookCard Component
- Accept `onToggleFavorite` prop with visual heart toggle (filled/outline)
- Show actual rating from API data
- Link to `/book-detail/:id`

---

## Phase 5 — Cart, Checkout & Orders

### 5A — Cart Context (`client/src/context/CartContext.jsx`)
- Items array with `{ book, quantity }`
- `addItem`, `removeItem`, `updateQuantity`, `clearCart`, `totalItems`, `subtotal`
- Persist to localStorage

### 5B — Cart Page (`/cart`)
- List cart items with quantities, prices, remove button
- Coupon code input with validation (call `POST /api/coupons/validate`)
- Order summary: subtotal, discount, total
- "Proceed to Checkout" button

### 5C — Checkout Flow
- Confirm order summary
- Call `POST /api/orders` with `bookIds` and optional `couponCode`
- On success: clear cart, redirect to `/orders` with success toast
- On failure: show error message

### 5D — Orders Page (`/orders`)
- Replace placeholder with full order history
- List orders with: date, books purchased, prices, total, coupon used
- Each order is expandable to show book details
- Loading / empty / error states

### 5E — Book Detail Add-to-Cart
- Wire quantity selector + "Add to Cart" button to CartContext
- Show success toast on add
- "Add to Wishlist" → calls `POST /api/users/favorites/:bookId`

---

## Phase 6 — Book Detail & Reading

### 6A — Book-Detail Page (`/book-detail/:id`)
- Use `useParams()` to get book ID
- Fetch book from `GET /api/books/:id`
- Fetch reviews from `GET /api/reviews/book/:bookId`
- Replace hardcoded gradient covers with actual book cover image
- Star rating display with half-star support (keep existing SVG approach)
- "Read Online" button (if book is in user's library) → opens reader page
- Review section: list reviews with user name + rating + comment + date
- Review submission form (if user purchased the book)

### 6B — Reader Page (`/read/:bookId`)
- Protected route (must own the book)
- Fetch book file URL from `GET /api/books/:id/read`
- Display PDF/epub in an embedded viewer (e.g., `react-pdf` or iframe)
- Track reading progress via `PUT /api/users/progress/:bookId`
- Show progress bar based on current page / total pages

---

## Phase 7 — Author Dashboard Integration

- Replace all hardcoded mock data with real API calls
- Fetch author's books from `GET /api/books?author=<userId>`
- Stats: sales count from orders, average rating from book data, revenue calculation
- Book upload form → call `POST /api/books` with FormData (cover + file)
- Edit / delete existing books
- View reviews on author's books

---

## Phase 8 — Admin Features

### 8A — Admin Dashboard (`/admin`)
- Protected + AdminRoute
- Stats overview: total users, total books, total orders, total revenue

### 8B — User Management
- List all users (`GET /api/users`) with pagination + role filter
- Deactivate user button

### 8C — Coupon Management
- List all coupons (`GET /api/coupons`)
- Create coupon form
- Delete coupon

### 8D — Reports Management
- List all reports (`GET /api/reports`) with status + type filters
- View report detail
- Update status (reviewed/dismissed) + add admin notes

### 8E — Book Management
- List all books with pagination
- Delete inappropriate books

---

## Phase 9 — Missing Pages

### 9A — Home Page (`/`)
Design and implement a proper landing page with:
- Hero section with search bar
- Featured books carousel (top-rated or newly added)
- Categories section
- Newsletter signup
- Call-to-action sections
- Footer with working links

### 9B — Account Page (`/account`)
- User profile info (name, email, role, member since)
- Edit profile (change name, email)
- Change password
- Reading progress overview (recently read books with progress bars)

### 9C — Static Pages (Footer Links)
Create simple pages for: `/categories`, `/benefits`, `/team`, `/faqs`, `/contact`, `/terms`, `/privacy`
- Can be static content or generated from a CMS
- At minimum: placeholder with basic layout matching site design

---

## Phase 10 — Polish & QA

### 10A — Error Handling
- Consistent error display (toast notifications)
- Network error handling (offline detection, retry suggestions)
- Form error states matching existing design patterns

### 10B — Loading States
- Skeleton loaders for book grids, detail pages, and lists
- Spinner for button loading states

### 10C — Empty States
- No books found matching filters (Library)
- No favorites yet (Favorites)
- No orders yet (Orders)
- Empty cart (Cart)
- Dashboard with no published books

### 10D — Responsive Design Audit
- Test all pages at mobile, tablet, desktop breakpoints
- Ensure sidebar collapses properly (Library, Dashboard, Admin)
- Touch-friendly buttons and filters

### 10E — Performance
- Lazy-load page components with `React.lazy()` + `Suspense`
- Debounce search input (300ms)
- Paginate all list views on both frontend and backend
- Image lazy loading (already present in some components)

### 10F — Security Checklist
- All protected routes check auth on frontend AND backend
- JWT token stored in localStorage, sent via Authorization header
- No sensitive data exposed in API responses
- CORS configured correctly
- Rate limiting applied (already on server)

### 10G — Testing
- Backend: test each new endpoint with Postman collection
- Frontend: manually test complete user flows:
  - Register → Login → Browse Library → Add to Cart → Checkout → Read Book
  - Author: Login → Upload Book → View Dashboard
  - Admin: Login → Manage Users/Coupons/Reports

---

## Quick Reference: File Creation Map

### Backend (New Files)

| File | Purpose |
|------|---------|
| `server/validators/order.validator.js` | Joi schemas for order placement |
| `server/validators/report.validator.js` | Joi schemas for report submission/update |
| `server/services/order.service.js` | Order business logic |
| `server/services/user.service.js` | User library/favorites/progress logic |
| `server/services/report.service.js` | Report business logic |
| `server/controllers/order.controller.js` | Order request handlers |
| `server/controllers/user.controller.js` | User request handlers |
| `server/controllers/report.controller.js` | Report request handlers |

### Frontend (New Files)

| File | Purpose |
|------|---------|
| `client/src/services/api.js` | Axios instance + interceptors |
| `client/src/services/auth.service.js` | Auth API calls |
| `client/src/services/book.service.js` | Book API calls |
| `client/src/services/review.service.js` | Review API calls |
| `client/src/services/order.service.js` | Order API calls |
| `client/src/services/user.service.js` | User API calls |
| `client/src/services/coupon.service.js` | Coupon API calls |
| `client/src/services/report.service.js` | Report API calls |
| `client/src/context/AuthContext.jsx` | Auth state provider |
| `client/src/context/CartContext.jsx` | Cart state provider |
| `client/src/hooks/useAuth.js` | Auth context shortcut |
| `client/src/hooks/useApi.js` | Generic data-fetching hook |
| `client/src/hooks/useFavorites.js` | Favorites toggle hook |
| `client/src/utils/constants.js` | Shared constants |
| `client/src/utils/format.js` | Formatting utilities |
| `client/src/utils/validators.js` | Validation utilities |
| `client/src/components/ProtectedRoute.jsx` | Auth route guard |
| `client/src/components/AdminRoute.jsx` | Admin route guard |
| `client/src/pages/Home.jsx` | Full home page (rewrite) |
| `client/src/pages/Orders.jsx` | Order history page |
| `client/src/pages/Account.jsx` | User account page |
| `client/src/pages/Cart.jsx` | Shopping cart page |
| `client/src/pages/Read.jsx` | Book reader page |
| `client/src/pages/Admin.jsx` | Admin dashboard |
| `client/src/pages/Categories.jsx` | Categories page |
| `client/src/pages/Benefits.jsx` | Benefits page |
| `client/src/pages/Team.jsx` | Team page |
| `client/src/pages/FAQs.jsx` | FAQ page |
| `client/src/pages/Contact.jsx` | Contact page |
| `client/src/pages/Terms.jsx` | Terms page |
| `client/src/pages/Privacy.jsx` | Privacy page |

---

## Existing Code to Modify

| File | Change |
|------|--------|
| `client/src/App.jsx` | Add new routes, wrap protected routes, add AuthProvider |
| `client/src/main.jsx` | Wrap App with AuthProvider |
| `client/src/components/Header.jsx` | Replace `<a>` with `<Link>`, show auth-dependent UI |
| `client/src/components/Header.jsx` | Add active page detection via `useLocation()` |
| `client/src/pages/SignIn.jsx` | Connect to auth service |
| `client/src/pages/SignUp.jsx` | Connect to auth service |
| `client/src/pages/Library.jsx` | Replace mock data with API calls |
| `client/src/pages/Favorites.jsx` | Replace mock data with API calls |
| `client/src/pages/Book-Detail.jsx` | Add ID from URL params, fetch real data |
| `client/src/pages/AuthorDashboard.jsx` | Replace mock data with API calls |
| `server/server.js` | Wire new route files (orders, users, reports) |
| `server/routes/order.routes.js` | Uncomment and wire |
| `server/routes/user.routes.js` | Uncomment and wire |
| `server/routes/report.routes.js` | Uncomment and wire |

---

## Recommended Implementation Order (Simplified)

```
Week 1:  Phase 1 (Backend APIs) + Phase 2 (Frontend infra)
Week 2:  Phase 3 (Auth) + Phase 4 (Library/Favorites)
Week 3:  Phase 5 (Cart/Orders) + Phase 6 (Book Detail/Read)
Week 4:  Phase 7 (Dashboard) + Phase 8 (Admin) + Phase 9 (Missing Pages) + Phase 10 (Polish)
```
