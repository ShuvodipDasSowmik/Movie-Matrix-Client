import { Navigate } from 'react-router-dom';

// This component checks if a user is logged in and redirects appropriately
const ProtectedRoute = ({ element, authRequired = false }) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('token') !== null;
  const loggedInUsername = localStorage.getItem('username');
  
  // For auth pages (signin/signup), redirect to dashboard if already authenticated
  if (!authRequired && isAuthenticated) {
    // Use the stored username for the redirect
    return <Navigate to={`/profile/${loggedInUsername}`} replace />;
  }

  // For protected pages, redirect to login if not authenticated
  if (authRequired && !isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }
  
  // Let the backend handle authorization for specific resources
  // If all checks pass, render the requested component
  return element;
};

export default ProtectedRoute;
