import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../common/Spinner';

export default function VendorRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return <PageSpinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isApprovedVendor = user?.role === 'vendor' && user?.vendorProfile?.isApproved;
  const isAdmin = user?.role === 'admin';

  if (!isApprovedVendor && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
