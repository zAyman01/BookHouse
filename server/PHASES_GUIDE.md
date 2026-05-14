# BookHouse Backend — Remaining Phases Guide

> **Completed:** Phase 0 (fixes) · Phase 1 (Auth) · Phase 2 (Books)  
> **Remaining:** Phase 3 → 7 below — implement in order, each phase depends on the ones above it.

---

## Dependency Order

```
Phase 3 (Reviews)  → needs Phase 1 + 2
Phase 4 (Coupons)  → needs Phase 1
Phase 5 (Orders)   → needs Phase 1 + 2 + 4
Phase 6 (Users)    → needs Phase 5
Phase 7 (Reports)  → needs Phase 1
```

---

## Phase 3 — Reviews

**Route prefix:** `/api/reviews`  
**Files to create:**
- `validators/review.validator.js`
- `services/review.service.js`
- `controllers/review.controller.js`
- Wire `routes/review.routes.js`

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/reviews/book/:bookId` | Public | All reviews for a book |
| POST | `/api/reviews/book/:bookId` | protect | Submit a review |
| PUT | `/api/reviews/:id` | protect | Update own review |
| DELETE | `/api/reviews/:id` | protect | Delete own review or admin |

### Validator (`review.validator.js`)

```js
createReviewSchema: { rating: 1–5 (required), comment: string (optional, max 1000) }
updateReviewSchema: { rating, comment } — both optional, min(1)
```

### Service Logic & Issues to Avoid

**`getBookReviews(bookId)`**
- Verify the book exists and is published — throw 404 if not.
- Populate `userId` with `name` only (never return email).
- Paginate results.

**`createReview(bookId, data, requestingUser)`**
- ⚠️ **Purchase gate:** check `requestingUser.library.some(id => id.equals(bookId))` — only users who purchased the book can review it. Throw 403 otherwise.
- ⚠️ **Duplicate guard:** the unique index `{ userId, bookId }` will throw a Mongoose error code `11000` — the global error handler already converts that to a 409. No manual check needed, but document it in the service.
- After creating the review, **recalculate** `ratingsAverage` and `ratingsCount` on the `Book` document:
  ```js
  const stats = await Review.aggregate([
    { $match: { bookId: book._id } },
    { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  await Book.findByIdAndUpdate(bookId, {
    ratingsAverage: stats[0]?.avg ?? 0,
    ratingsCount:   stats[0]?.count ?? 0,
  });
  ```
- ⚠️ Do NOT use `book.reviews.push()` — that array was removed in Phase 0.

**`updateReview(reviewId, data, requestingUser)`**
- Fetch review, check `review.userId.toString() === requestingUser._id.toString()`.
- After update, recalculate book ratings (same aggregation above).

**`deleteReview(reviewId, requestingUser)`**
- Allow if owner OR admin (`requestingUser.role === ROLES.ADMIN`).
- After delete, recalculate book ratings — if no reviews remain, reset both fields to `0`.

### Route Order Warning

`/book/:bookId` must be registered **before** `/:id` — otherwise Express captures `"book"` as the `:id` param.

```js
router.get('/book/:bookId', ...);   // ← first
router.post('/book/:bookId', ...);  // ← first
router.put('/:id', ...);
router.delete('/:id', ...);
```

---

## Phase 4 — Coupons

**Route prefix:** `/api/coupons`  
**Files to create:**
- `validators/coupon.validator.js`
- `services/coupon.service.js`
- `controllers/coupon.controller.js`
- Wire `routes/coupon.routes.js`

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/coupons` | protect, ADMIN | Create coupon |
| GET | `/api/coupons` | protect, ADMIN | List all coupons |
| DELETE | `/api/coupons/:id` | protect, ADMIN | Delete coupon |
| POST | `/api/coupons/validate` | protect | Validate a code at checkout |

### Validator (`coupon.validator.js`)

```js
createCouponSchema: {
  code:            string, uppercase, required,
  discountPercent: number, 1–100, required,
  expiresAt:       ISO date string, must be in the future, required,
  usageLimit:      number, min 1, default 1,
  isActive:        boolean, optional,
}
validateCouponSchema: { code: string, required }
```

### Service Logic & Issues to Avoid

**`createCoupon(data)`**
- Convert `code` to uppercase before saving (the schema does it too, but safer to do it explicitly).
- ⚠️ `expiresAt` must be in the future — validate in Joi with `Joi.date().greater('now')`.

**`getAllCoupons()`**
- Return all coupons; admin only. No pagination needed (admin view).

**`deleteCoupon(id)`**
- Hard delete is fine (`findByIdAndDelete`). Soft-delete via `isActive: false` is an alternative if you want to preserve order history referencing this coupon.

**`validateCoupon(code)`**
- The `Coupon` model already has `Coupon.validateCoupon(code)` static method — **call that directly**, don't re-implement the logic.
- This endpoint is called from the frontend at checkout to show the discounted price before the user places the order.
- ⚠️ Do NOT increment `usedCount` here — only increment it when the order is actually placed (Phase 5).
- Return `{ discountPercent, code }` so the frontend can show the discount.

### Route Order Warning

`/validate` must be before `/:id`:

```js
router.post('/validate', protect, ...);  // ← first
router.post('/', protect, authorize(ADMIN), ...);
router.get('/', protect, authorize(ADMIN), ...);
router.delete('/:id', protect, authorize(ADMIN), ...);
```

---

## Phase 5 — Orders

**Route prefix:** `/api/orders`  
**Files to create:**
- `validators/order.validator.js`
- `services/order.service.js`
- `controllers/order.controller.js`
- Wire `routes/order.routes.js`

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/orders` | protect | Place an order |
| GET | `/api/orders/my` | protect | Current user's orders |
| GET | `/api/orders/:id` | protect | Single order detail |
| GET | `/api/orders` | protect, ADMIN | All orders |

### Validator (`order.validator.js`)

```js
placeOrderSchema: {
  bookIds:     array of valid ObjectId strings, min 1, required,
  couponCode:  string, optional,
}
```

### Service Logic & Issues to Avoid

**`placeOrder(data, requestingUser)`** — the most critical service in the project.

1. **Fetch all books:** `Book.find({ _id: { $in: bookIds }, isPublished: true })`.
2. ⚠️ **Validate count:** if `books.length !== bookIds.length`, some books don't exist or aren't published — throw 400 with a clear message.
3. ⚠️ **Already purchased check:** for each book, check if it's already in `requestingUser.library`. Throw 400 listing the duplicate titles — don't silently skip them.
4. **Snapshot prices:** build `orderBooks = books.map(b => ({ book: b._id, priceAtPurchase: b.price }))`. Never recalculate from the DB later — this is why we snapshot.
5. **Calculate total before discount:** `rawTotal = orderBooks.reduce((sum, b) => sum + b.priceAtPurchase, 0)`.
6. **Apply coupon (if provided):**
   - Call `Coupon.validateCoupon(couponCode)` — throws if invalid.
   - `discountAmount = (rawTotal * coupon.discountPercent) / 100`.
   - `finalTotal = rawTotal - discountAmount`.
   - ⚠️ Increment coupon usage **after** the order is saved: `await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } })`.
7. **Create order:**
   ```js
   await Order.create({
     userId: requestingUser._id,
     books: orderBooks,
     totalPrice: finalTotal,
     appliedCoupon: couponCode || null,
     discountAmount: discountAmount || 0,
     status: ORDER_STATUS.COMPLETED,
   });
   ```
8. **Add books to library:**
   ```js
   await User.findByIdAndUpdate(requestingUser._id, {
     $addToSet: { library: { $each: bookIds } },
   });
   ```
   Use `$addToSet` not `$push` — prevents duplicates at the DB level.
9. ⚠️ **Atomicity:** steps 7 and 8 are two separate writes. If step 8 fails the user won't have access despite being charged. Use a MongoDB session/transaction if the Atlas cluster supports it, or at minimum wrap in a try/catch that logs the failure for manual recovery.

**`getMyOrders(userId)`**
- `Order.find({ userId }).populate('books.book', 'title coverImage')`.
- Paginate.

**`getOrderById(orderId, requestingUser)`**
- Fetch order. Check `order.userId.toString() === requestingUser._id.toString()` OR admin.
- Populate `books.book` with title, price, coverImage.

**`getAllOrders(query)`** (admin)
- Paginate. Populate `userId` with `name, email`.

### Route Order Warning

`/my` must be before `/:id`:

```js
router.get('/my', protect, ...);   // ← first
router.get('/:id', protect, ...);
router.get('/', protect, authorize(ADMIN), ...);
```

---

## Phase 6 — Users

**Route prefix:** `/api/users`  
**Files to create:**
- `services/user.service.js`
- `controllers/user.controller.js`
- Wire `routes/user.routes.js`

> No separate validator file needed — inputs are simple ObjectIds or a progress number.

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/users/library` | protect | User's purchased books |
| GET | `/api/users/favorites` | protect | User's favorited books |
| POST | `/api/users/favorites/:bookId` | protect | Add to favorites |
| DELETE | `/api/users/favorites/:bookId` | protect | Remove from favorites |
| GET | `/api/users/progress/:bookId` | protect | Reading progress for a book |
| PUT | `/api/users/progress/:bookId` | protect | Update reading progress |
| GET | `/api/users` | protect, ADMIN | All users |
| DELETE | `/api/users/:id` | protect, ADMIN | Deactivate user |

### Service Logic & Issues to Avoid

**`getLibrary(userId)`**
- `User.findById(userId).populate('library', 'title coverImage authorName price')`.
- ⚠️ Select `-fileUrl` on the populate — never expose book file paths.

**`getFavorites(userId)`**
- Same as library but populate `favorites`.

**`addFavorite(bookId, requestingUser)`**
- Verify the book exists and is published — throw 404 if not.
- `User.findByIdAndUpdate(userId, { $addToSet: { favorites: bookId } })`.
- ⚠️ Use `$addToSet` — silently ignores if already favorite (no error, no duplicate).

**`removeFavorite(bookId, requestingUser)`**
- `User.findByIdAndUpdate(userId, { $pull: { favorites: bookId } })`.
- No error if bookId wasn't in favorites — that's fine.

**`getProgress(bookId, userId)`**
- `ReadingProgress.findOne({ userId, bookId })`.
- ⚠️ Must verify the book is in `user.library` first — only purchased books can have progress.
- Return `null` progress (not a 404) if no record yet — user hasn't started reading.

**`updateProgress(bookId, data, userId)`**
- ⚠️ Same purchase check as above.
- `ReadingProgress.findOneAndUpdate({ userId, bookId }, { currentPage: data.currentPage }, { upsert: true, new: true })`.
- Validate `currentPage` is a positive integer in the route (can use a quick inline check or mini Joi schema).

**`getAllUsers(query)`** (admin)
- Paginate. Never return `password` field.
- Support optional `?role=` filter.

**`deactivateUser(id)`** (admin)
- Set `isActive: false` — do NOT delete the document.
- ⚠️ Cannot deactivate another admin — check target user's role first, throw 403 if admin.

### Route Order Warning

Named routes must come before param routes:

```js
router.get('/library', protect, ...);           // ← first
router.get('/favorites', protect, ...);         // ← first
router.post('/favorites/:bookId', protect, ...);
router.delete('/favorites/:bookId', protect, ...);
router.get('/progress/:bookId', protect, ...);
router.put('/progress/:bookId', protect, ...);
router.get('/', protect, authorize(ADMIN), ...);
router.delete('/:id', protect, authorize(ADMIN), ...);  // ← last
```

---

## Phase 7 — Reports

**Route prefix:** `/api/reports`  
**Files to create:**
- `validators/report.validator.js`
- `services/report.service.js`
- `controllers/report.controller.js`
- Wire `routes/report.routes.js`

### Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/reports` | protect | Submit a report |
| GET | `/api/reports` | protect, ADMIN | All reports |
| GET | `/api/reports/:id` | protect, ADMIN | Single report |
| PUT | `/api/reports/:id` | protect, ADMIN | Update status + admin notes |

### Validator (`report.validator.js`)

```js
createReportSchema: {
  type:     one of REPORT_TYPE values ('user', 'book', 'review'), required,
  targetId: valid ObjectId string, required,
  reason:   string, min 10, max 500, required,
}
updateReportStatusSchema: {
  status:     one of REPORT_STATUS values ('reviewed', 'dismissed'), required,
  adminNotes: string, optional,
}
```

### Service Logic & Issues to Avoid

**`submitReport(data, requestingUser)`**
- ⚠️ **Validate the target exists** based on `type`:
  - `REPORT_TYPE.BOOK` → `Book.findById(targetId)` — throw 404 if missing/unpublished.
  - `REPORT_TYPE.USER` → `User.findById(targetId)` — throw 404 if not found.
  - `REPORT_TYPE.REVIEW` → `Review.findById(targetId)` — throw 404 if not found.
- ⚠️ **Prevent self-reporting:** if `type === 'user'`, check `targetId !== requestingUser._id.toString()` — throw 400.
- Save with `status: REPORT_STATUS.PENDING` (schema default).

**`getAllReports(query)`** (admin)
- Paginate. Support `?status=` and `?type=` filters matching `REPORT_STATUS` / `REPORT_TYPE` values.
- Populate `reportedBy` with `name, email`.

**`getReportById(id)`** (admin)
- Populate `reportedBy` with `name, email`.

**`updateReportStatus(id, data)`** (admin)
- Only allow transitioning from `PENDING` → `REVIEWED` or `PENDING` → `DISMISSED`.
- ⚠️ Do not allow reopening a report (setting back to `PENDING`).
- Save `adminNotes` if provided.

---

## General Rules (apply to all phases)

1. **Always use `catchAsync`** — never write `try/catch` in controllers directly.
2. **Always throw `AppError`** — never `throw new Error(...)` in services.
3. **Never return `fileUrl`** — use `.select('-fileUrl')` on any Book query that goes to the client.
4. **Never return `password`** — never `.select('+password')` unless you need it for comparison.
5. **ObjectId comparison** — always use `.toString()` or `.equals()`, never `===` directly.
6. **`$addToSet` over `$push`** — for arrays like `library`, `favorites` to avoid duplicates.
7. **Validate middleware order** — `protect` → `authorize` → `uploadFiles` (if any) → `validate` → controller.
8. **Named routes before param routes** — `/my`, `/validate`, `/book/:bookId` must come before `/:id`.

---

## Files Per Phase (quick reference)

| Phase | Validator | Service | Controller | Route |
|-------|-----------|---------|------------|-------|
| 3 Reviews | ✅ create | `getBookReviews`, `createReview`, `updateReview`, `deleteReview` | 4 handlers | wire 4 routes |
| 4 Coupons | ✅ create + validate | `createCoupon`, `getAllCoupons`, `deleteCoupon`, `validateCoupon` | 4 handlers | wire 4 routes |
| 5 Orders | ✅ placeOrder | `placeOrder`, `getMyOrders`, `getOrderById`, `getAllOrders` | 4 handlers | wire 4 routes |
| 6 Users | — (no separate file) | `getLibrary`, `getFavorites`, `addFavorite`, `removeFavorite`, `getProgress`, `updateProgress`, `getAllUsers`, `deactivateUser` | 8 handlers | wire 8 routes |
| 7 Reports | ✅ create + update | `submitReport`, `getAllReports`, `getReportById`, `updateReportStatus` | 4 handlers | wire 4 routes |
