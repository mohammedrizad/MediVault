import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Spinner, Flex } from "@chakra-ui/react";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Flex justify="center" align="center" height="100vh">
        <Spinner size="xl" color="blue.500" />
      </Flex>
    );
  }

  if (!isAuthenticated) {
    // Redirect to appropriate login page based on required role
    const loginPath = `/${requiredRole}/login`;
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // User is authenticated but doesn't have the required role
    // Redirect to their correct dashboard
    const userDashboard = `/${userRole}/dashboard`;
    return <Navigate to={userDashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
