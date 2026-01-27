import { Navigate, Outlet } from 'react-router-dom';
import { getUserRole } from '../utils/helpers';

const ProtectedRoute = ({ allowedRoles, children }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles) {
        const userRole = getUserRole();
        if (!allowedRoles.includes(userRole)) {
            // Role not authorized, redirect to dashboard or show error
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children ? children : <Outlet />;
};

export default ProtectedRoute;
