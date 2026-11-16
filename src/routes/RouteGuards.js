import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export function RequireAdmin() {
  const { token, role } = useAuth();
  const location = useLocation();

  if (!token || role !== "admin") {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export function PublicOnly() {
  const { token, role } = useAuth();

  if (token && role === "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
