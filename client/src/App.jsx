import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import AuthorDashboard from './pages/AuthorDashboard';
import BookDetails from './pages/Book-Detail';
import Library from './pages/Library';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<AuthorDashboard />} />
        <Route path="/library" element={<Library />} />
        <Route path="/favorites" element={<h1>Favorites Page</h1>} />
        <Route path="/orders" element={<h1>Orders Page</h1>} />
        <Route path="/account" element={<h1>Account Page</h1>} />
        <Route path="/book" element={<h1>Book Page</h1>} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/book-detail" element={<BookDetails />} />
      </Routes>
    </Router>
  );
}

export default App;
