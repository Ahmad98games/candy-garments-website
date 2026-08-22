import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard, Package, ShoppingBag, Users,
    LogOut, ExternalLink, Menu, X, ShieldCheck, Palette, Share2
} from 'lucide-react';
import { useState } from 'react';
import './AdminLayout.css';

export default function AdminLayout() {
    const { logout } = useAuth();
    const { isDraftModified } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    // FIXED: Added ': string' to satisfy TypeScript
    const isActive = (path: string) => location.pathname.includes(path) ? 'active' : '';

    const closeSidebar = () => setSidebarOpen(false);

    return (
        <div className="admin-layout">
            {/* Sidebar Overlay (Mobile) */}
            <div
                className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`}
                onClick={closeSidebar}
            />

            {/* Sidebar */}
            <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <div className="brand-badge">
                        <img src="/images/candy.jpg" alt="Candy Admin" style={{ height: '24px', width: '24px', borderRadius: '4px', objectFit: 'cover' }} />
                        <div>
                            <h2 style={{ fontSize: '14px', margin: 0, fontWeight: 800, letterSpacing: '0.05em' }}>CANDY <span className="admin-tag">ADMIN</span></h2>
                            <div style={{ fontSize: '9px', color: '#9CA3AF', fontWeight: 600 }}>Engineered by Omnora-Ahmad Mahboob</div>
                        </div>
                    </div>
                    <button className="close-btn mobile-only" onClick={closeSidebar}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    <div className="nav-group-label">MANAGEMENT</div>

                    <Link to="/admin/dashboard" className={`nav-item ${isActive('dashboard')}`} onClick={closeSidebar}>
                        <LayoutDashboard size={18} />
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/theme" className={`nav-item ${isActive('theme')}`} onClick={closeSidebar}>
                        <Palette size={18} />
                        <span>Theme Engine</span>
                    </Link>
                    <Link to="/admin/social" className={`nav-item ${isActive('social')}`} onClick={closeSidebar}>
                        <Share2 size={18} />
                        <span>Social & Links</span>
                    </Link>
                    <div className="nav-group-label">COLLECTIONS & INVENTORY</div>

                    <Link to="/admin/ladies-collection" className={`nav-item ${isActive('ladies-collection')}`} onClick={closeSidebar}>
                        <Package size={18} />
                        <span>Ladies Wear Admin</span>
                    </Link>
                    <Link to="/admin/kids-collection" className={`nav-item ${isActive('kids-collection')}`} onClick={closeSidebar}>
                        <Package size={18} />
                        <span>Kids Wear Admin</span>
                    </Link>
                    <Link to="/admin/products" className={`nav-item ${isActive('products') && !location.pathname.includes('ladies-collection') && !location.pathname.includes('kids-collection') ? 'active' : ''}`} onClick={closeSidebar}>
                        <Package size={18} />
                        <span>All Inventory</span>
                    </Link>
                    <Link to="/admin/orders" className={`nav-item ${isActive('orders')}`} onClick={closeSidebar}>
                        <ShoppingBag size={18} />
                        <span>Orders</span>
                    </Link>
                    <Link to="/admin/users" className={`nav-item ${isActive('users')}`} onClick={closeSidebar}>
                        <Users size={18} />
                        <span>Customers</span>
                    </Link>
                    <Link to="/admin/personnel" className={`nav-item ${isActive('personnel') || isActive('karigars')}`} onClick={closeSidebar}>
                        <Users size={18} />
                        <span>Karigars & Personnel</span>
                    </Link>
                </nav>

                <div className="sidebar-footer">
                    <Link to="/" className="nav-item view-site" target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={18} />
                        <span>Live Store</span>
                    </Link>
                    <button onClick={handleLogout} className="nav-item logout-btn">
                        <LogOut size={18} />
                        <span>Terminate Session</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="admin-main">
                <header className="admin-header">
                    <button className="menu-btn mobile-only" onClick={() => setSidebarOpen(true)}>
                        <Menu size={24} />
                    </button>
                    <div className="header-title" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h1>System Overview</h1>
                        <span className="status-indicator">
                            <span className="blink-dot"></span> Online
                        </span>
                        {isDraftModified ? (
                            <span className="theme-status-pill draft" title="Theme has unpublished draft edits">
                                <span className="pill-dot amber"></span> Draft — unpublished changes
                            </span>
                        ) : (
                            <span className="theme-status-pill live" title="Live store theme is in sync">
                                <span className="pill-dot emerald"></span> Live
                            </span>
                        )}
                    </div>
                </header>

                <div className="admin-content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}