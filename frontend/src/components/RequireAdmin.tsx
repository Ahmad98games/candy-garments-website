import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RequireAdminProps {
    children: React.ReactNode;
}

export default function RequireAdmin({ children }: RequireAdminProps) {
    const { user, loading, isAdmin } = useAuth();
    const location = useLocation();

    // 1. Loading State
    if (loading) {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#0A0908', color: '#D4AF37', fontFamily: 'Outfit, sans-serif' }}>
                Verifying Atelier Admin Clearance...
            </div>
        );
    }

    // 2. Strict Private Admin Access Control (NO bypass, only authenticated admin)
    if (!user || user.role !== 'admin' || !isAdmin) {
        console.warn('Unauthorized Admin Access Attempt - Redirecting to Login');
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // 3. Access Granted
    return <>{children}</>;
}
