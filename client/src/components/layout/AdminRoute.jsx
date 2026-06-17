import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../common/Spinner';

export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <PageSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
