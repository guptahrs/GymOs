import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));
  const user_type = user?.user_type;

  // 🔒 Not logged in
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🔥 ROLE CHECK (IMPORTANT)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user_type)) {
    
    // redirect based on role
    if (user_type === "super_admin") {
      return <Navigate to="/super-admin" replace />;
    }

    if (user_type === "gym_owner") {
      return <Navigate to="/gym-admin" replace />;
    }

    return <Navigate to="/login" replace />;
  }

  return children;
}