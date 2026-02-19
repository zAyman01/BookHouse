import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Favorites from './pages/Favorites';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<h1>Library Page</h1>} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/orders" element={<h1>Orders Page</h1>} />
        <Route path="/account" element={<h1>Account Page</h1>} />
        <Route path="/book" element={<h1>Book Page</h1>} />
        <Route path="/signin" element={<h1>Sign In Page</h1>} />
        <Route path="/signup" element={<h1>Sign Up Page</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
