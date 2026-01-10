import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import Login from "./Login";

export default function CorporateLogin() {
  const { user } = useAuth();

  if (!user) return <Login role="corporate" />;

  if (user.role !== "corporate") return <Navigate to="/corporate-request" />;

  return <Navigate to="/profile" />;
}