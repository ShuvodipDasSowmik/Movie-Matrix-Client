import { Navigate } from 'react-router-dom';

// This component checks if a user is logged in and redirects them
// from auth pages (signin/signup) to their dashboard if they are
const ProtectedRoute = ({ element, authRequired = false }) => {
  // Check if user is authenticated - replace this with your actual auth check
  // This could be checking a token in localStorage, context, etc.
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  // For auth pages (signin/signup), redirect to dashboard if already authenticated
  if (!authRequired && isAuthenticated) {
    // Assuming we know the username, otherwise might need to fetch from context or API
    const username = localStorage.getItem('username') || 'user';
    return <Navigate to={`/profile/${username}`} replace />;
  }

  // For protected pages, redirect to login if not authenticated
  if (authRequired && !isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // If all checks pass, render the requested component
  return element;
};

export default ProtectedRoute;
