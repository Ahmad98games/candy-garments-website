import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
    const { isAuthenticated, isAdmin, loading, user } = useAuth();
    const location = useLocation();

    // 1. SECURITY SCAN (Loading State)
    if (loading) {
        return (
            <div className="security-gate">
                <div className="scanner-ui">
                    <div className="scanner-icon">
                        <Loader2 size={40} className="animate-spin" style={{ color: '#D4AF37' }} />
                    </div>
                    <div className="scanner-status">
                        <span className="blink-text" style={{ color: '#D4AF37' }}>VERIFYING CREDENTIALS</span>
                        <div className="scanner-bar"></div>
                    </div>
                </div>
            </div>
        );
    }

    // 2. ACCESS DENIED (Not Logged In)
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. INSUFFICIENT CLEARANCE (Not Admin)
    if (requireAdmin && (user.role !== 'admin' || !isAdmin)) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 4. ACCESS GRANTED
    return <>{children}</>;
}