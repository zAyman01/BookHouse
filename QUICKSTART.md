# Quick Start Guide

## Super Quick Setup

```bash
# 1. Install all dependencies
npm run install-all

# 2. Set up environment files
copy .env.example .env
cd client && copy .env.example .env && cd ..

# 3. Edit .env files with your MongoDB URI and secrets

# 4. Start development
npm run dev
```

**Done!** Frontend runs on http://localhost:5173, Backend on http://localhost:5000

---

## 📝 Essential Commands

| Command               | Description                  |
| --------------------- | ---------------------------- |
| `npm run dev`         | Start both client & server   |
| `npm run client`      | Start only frontend (React)  |
| `npm run server`      | Start only backend (Express) |
| `npm run install-all` | Install all dependencies     |
| `npm run build`       | Build for production         |

---

## 📂 Quick Reference - Where to Put Your Code

### Client (Frontend)

```
client/src/
├── components/    → Reusable UI components (Button, Card, etc.)
├── pages/         → Full page views (Home, Login, Dashboard, etc.)
├── services/      → API calls (bookService.js, authService.js, etc.)
├── hooks/         → Custom React hooks (useAuth, useForm, etc.)
├── context/       → Global state (AuthContext, ThemeContext, etc.)
├── utils/         → Helper functions and constants
└── assets/        → Images, icons, fonts
```

### Server (Backend)

```
server/
├── models/        → Database schemas (Book.js, User.js, etc.)
├── controllers/   → Business logic functions
├── routes/        → API endpoint definitions
├── middleware/    → Auth, validation, error handling
├── config/        → Database connection, configs
└── utils/         → Helper functions
```

---

## 🔐 Environment Variables

### `.env` (Root/Server)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/book-house
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

### `client/.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🛠️ Basic Workflow

1. **Create your database model** in `server/models/`
2. **Add controller functions** in `server/controllers/`
3. **Define API routes** in `server/routes/`
4. **Connect to backend** from `client/src/services/`
5. **Build UI components** in `client/src/components/`
6. **Create pages** in `client/src/pages/`

---

## 🐛 Common Issues

**MongoDB not connecting?**

- Check if MongoDB is running: `mongod`
- Verify `MONGODB_URI` in `.env`

**Port already in use?**

- Change `PORT` in `.env` file

**Client can't reach server?**

- Make sure both servers are running
- Check `VITE_API_URL` in `client/.env`

---

**Need more details?** Check the full [README.md](README.md)

4. **Register Routes** (`server/routes/index.js`)
   ```javascript
   import yourRoutes from './yourRoutes.js';
   router.use('/your-resource', yourRoutes);
   ```

### Adding a New Page

1. **Create Page Component** (`client/src/pages/YourPage.jsx`)

   ```jsx
   function YourPage() {
     return <div>Your Page Content</div>;
   }
   export default YourPage;
   ```

2. **Add Route** (`client/src/App.jsx`)
   ```jsx
   import YourPage from './pages/YourPage';
   <Route path="/your-path" element={<YourPage />} />;
   ```

### Adding a New Service

Create service file (`client/src/services/yourService.js`)

```javascript
import api from './api';

export const getYourData = async () => {
  const response = await api.get('/your-endpoint');
  return response.data;
};
```

## 🐛 Troubleshooting

### Port Already in Use

- Frontend: Change port in `client/vite.config.js`
- Backend: Change `PORT` in `.env`

### MongoDB Connection Error

- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- Verify network access (for Atlas)

### CORS Errors

- Check `CLIENT_URL` in server `.env`
- Verify CORS configuration in `server/server.js`

### Module Not Found

- Run `npm install` in the appropriate directory
- Check import paths (use relative paths)

## 📦 Dependencies

### Already Installed

**Frontend:**

- react, react-dom - UI library
- react-router-dom - Routing
- axios - HTTP client
- vite - Build tool

**Backend:**

- express - Web framework
- mongoose - MongoDB ODM
- cors - CORS middleware
- dotenv - Environment variables
- bcryptjs - Password hashing
- jsonwebtoken - JWT authentication

### Commonly Added

**Frontend:**

```bash
cd client
npm install @tanstack/react-query    # Data fetching
npm install formik yup               # Form handling
npm install react-icons              # Icons
npm install react-toastify           # Notifications
npm install date-fns                 # Date utilities
```

**Backend:**

```bash
cd server
npm install express-validator        # Input validation
npm install multer                   # File uploads
npm install compression              # Response compression
npm install helmet                   # Security headers
npm install morgan                   # HTTP logging
```

## 🔐 Authentication Flow

1. User submits login credentials
2. Server validates and returns JWT token
3. Client stores token in localStorage
4. Token sent in Authorization header for protected routes
5. Server middleware verifies token

See `client/src/context/AuthContext.jsx` for implementation.

## 🌐 API Testing

Use these tools to test your API:

- **Postman** - http://localhost:5000/api
- **curl**: `curl http://localhost:5000/api/books`
- **Browser**: Navigate to endpoints

Example Postman request:

```
GET http://localhost:5000/api/books
POST http://localhost:5000/api/books
Body: { "title": "Book Title", "author": "Author Name", ... }
```

## 📚 Next Steps

1. ✅ Set up your development environment
2. ✅ Start both servers
3. 🔲 Create your database models
4. 🔲 Build your API endpoints
5. 🔲 Create frontend components
6. 🔲 Connect frontend to backend
7. 🔲 Add authentication
8. 🔲 Test your application
9. 🔲 Deploy to production

Happy coding! 🎉
