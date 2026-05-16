import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function AuthorRoute({ children }) {
  const { isAuthenticated, isAuthor, isAdmin, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (!isAuthor && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
