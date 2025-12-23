import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) =>
  isLoggedIn() ? children : <Navigate to="/login" />;

export default ProtectedRoute;
