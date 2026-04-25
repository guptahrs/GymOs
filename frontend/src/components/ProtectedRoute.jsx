import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthenticated } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const user_type = JSON.parse(localStorage.getItem("user"))?.user_type || null;
  if (!isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  else
    if (user_type === 'super_admin' && !location.pathname.startsWith('/super-admin')) {
      return <Navigate to="/super-admin" replace />;
    }
    else if (user_type === 'gym_owner' && !location.pathname.startsWith('/gym-admin')) {
      return <Navigate to="/gym-admin" replace />;
    }
      else
        return children;
}
