import { Navigate } from "react-router-dom";
import { isLoggedIn } from "../utils/auth";

const ProtectedRoute = ({ children }: { children: JSX.Element }) =>
  isLoggedIn() ? children : <Navigate to="/login" />;

export default ProtectedRoute;
