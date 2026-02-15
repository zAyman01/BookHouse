# Book House - MERN Stack Project

## 📁 Project Structure

```
book-house/
├── client/                 # React frontend (Vite)
│   ├── public/            # Static files (favicon, images, etc.)
│   ├── src/
│   │   ├── assets/        # Images, fonts, icons
│   │   ├── components/    # Reusable React components
│   │   ├── context/       # React Context API providers
│   │   ├── hooks/         # Custom React hooks
│   │   ├── pages/         # Page components (routes)
│   │   ├── services/      # API service functions
│   │   ├── utils/         # Utility/helper functions
│   │   ├── App.jsx        # Main App component
│   │   ├── App.css        # App styles
│   │   ├── main.jsx       # React entry point
│   │   └── index.css      # Global styles
│   ├── .env.example       # Example environment variables
│   ├── index.html         # HTML template
│   ├── package.json       # Client dependencies
│   ├── vite.config.js     # Vite configuration
│   └── eslint.config.js   # ESLint configuration
│
├── server/                # Express backend
│   ├── config/           # Configuration files (database, etc.)
│   ├── controllers/      # Request handlers (business logic)
│   ├── middleware/       # Custom middleware (auth, validation, etc.)
│   ├── models/           # Mongoose models (database schemas)
│   ├── routes/           # API routes (endpoints)
│   ├── utils/            # Utility/helper functions
│   ├── server.js         # Server entry point
│   └── package.json      # Server dependencies
│
├── .env.example          # Example environment variables
├── .gitignore           # Git ignore rules
├── .prettierrc          # Prettier configuration
├── package.json         # Root package.json for scripts
└── README.md            # This file
```

├── package.json # Root package.json for running both
└── README.md # This file

````

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (v6 or higher) - Local or MongoDB Atlas
- **npm** or **yarn**

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm run install-all
````

This installs all dependencies for the root, client, and server.

2. **Configure Environment Variables**

   Copy the example files and update them with your configuration:

   ```bash
   # Root level
   copy .env.example .env

   # Client
   cd client
   copy .env.example .env
   cd ..
   ```

   **Server `.env`:**

   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/book-house
   JWT_SECRET=your_secret_key_here
   CLIENT_URL=http://localhost:5173
   ```

   **Client `.env`:**

   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

3. **Start MongoDB**

   ```bash
   # Local MongoDB
   mongod

   # Or use MongoDB Atlas connection string in .env
   ```

4. **Start Development Servers**

   ```bash
   npm run dev
   ```

   This starts both:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 📝 Available Scripts

### Root Level

- `npm run dev` - Run both client and server concurrently
- `npm run client` - Run only the frontend
- `npm run server` - Run only the backend
- `npm run install-all` - Install all dependencies
- `npm run build` - Build client for production

### Client (`cd client`)

- `npm run dev` - Start Vite dev server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Server (`cd server`)

- `npm run dev` - Start with nodemon (auto-reload)
- `npm start` - Start in production mode

## 🛠️ Tech Stack

**Frontend:**

- React 19 + Vite
- React Router
- Axios
- ESLint

**Backend:**

- Node.js + Express
- MongoDB + Mongoose
- JWT + bcryptjs
- CORS + dotenv

## 📂 Folder Guide

### Client Structure

- **`components/`** - Reusable UI components (Button, Card, Modal, etc.)
- **`pages/`** - Page components that map to routes (Home, Login, BookDetails, etc.)
- **`services/`** - API integration functions (bookService.js, authService.js, etc.)
- **`hooks/`** - Custom React hooks (useAuth, useForm, useApi, etc.)
- **`context/`** - React Context providers (AuthContext, ThemeContext, etc.)
- **`utils/`** - Helper functions, constants, validators
- **`assets/`** - Static files (images, icons, fonts)

### Server Structure

- **`config/`** - Configuration files (database connection, etc.)
- **`controllers/`** - Business logic and request handlers
- **`models/`** - Mongoose schemas (Book, User, Order, etc.)
- **`routes/`** - API endpoint definitions
- **`middleware/`** - Custom middleware (authentication, validation, error handling)
- **`utils/`** - Helper functions, utilities

## 💡 Development Tips

1. **Start Small**: Begin with one feature at a time
2. **Test as You Go**: Test each component/route before moving on
3. **Follow the Structure**: Keep files organized in their respective folders
4. **Use Environment Variables**: Never hardcode sensitive data
5. **Consistent Naming**: Use clear, descriptive names for files and functions

## 📚 Next Steps

1. ✅ Set up your database models in `server/models/`
2. ✅ Create API routes in `server/routes/`
3. ✅ Build your UI components in `client/src/components/`
4. ✅ Create page layouts in `client/src/pages/`
5. ✅ Connect frontend to backend using services in `client/src/services/`

## 🐛 Troubleshooting

**Port already in use?**

- Change the `PORT` in `.env` file

**MongoDB connection failed?**

- Check if MongoDB is running
- Verify your `MONGODB_URI` in `.env`

**Client can't connect to server?**

- Ensure both servers are running
- Check CORS configuration
- Verify `VITE_API_URL` in `client/.env`

## 📄 License

ISC License

---

**Happy Coding! 🚀**
