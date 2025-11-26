import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!user) {
    // Redirect to login but save the location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin()) {
    // Redirect non-admin users away from admin routes
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;

