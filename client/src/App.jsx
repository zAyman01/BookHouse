import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/library" element={<h1>Library Page</h1>} />
        <Route path="/favorites" element={<h1>Favorites Page</h1>} />
        <Route path="/orders" element={<h1>Orders Page</h1>} />
        <Route path="/account" element={<h1>Account Page</h1>} />
        <Route path="/book" element={<h1>Book Page</h1>} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Routes>
    </Router>
  );
}

export default App;
