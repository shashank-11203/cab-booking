import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoutes({ allowedRoles }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                Loading....
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}