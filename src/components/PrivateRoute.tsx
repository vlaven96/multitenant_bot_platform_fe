import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: JSX.Element;
  isAuthenticated: boolean;
  isAdmin?: boolean;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, isAuthenticated, isAdmin }) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (isAdmin !== undefined && !isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
};

export default PrivateRoute; 