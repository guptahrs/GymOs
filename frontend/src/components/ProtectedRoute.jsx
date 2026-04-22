import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// Example: check localStorage for a token or user info
function isAuthenticated() {
  // Adjust this logic to your actual auth implementation
  return Boolean(localStorage.getItem("token"));
}

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
