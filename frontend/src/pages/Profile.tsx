import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import client from '../api/client';
import {
    User,
    Package,
    MapPin,
    Key,
    LogOut,
    ChevronRight,
    Clock,
    Loader2
} from 'lucide-react';
import './Profile.css';

type Order = {
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    createdAt: string;
    items: any[];
};

export default function Profile() {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState('account');
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);

    // Form States
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        }
    }, [activeTab]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await client.get('/orders');
            setOrders(res.data);
        } catch (error) {
            console.error('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await client.put('/users/profile', formData);
            showToast('Profile data updated', 'success');
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Update failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Password mismatch', 'error');
            return;
        }
        setLoading(true);
        try {
            await client.put('/users/password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            showToast('Security protocols updated', 'success');
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Password update failed', 'error');
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => name.substring(0, 2).toUpperCase();

    return (
        <div className="profile-page">
            <div className="noise-layer" />

            <div className="container">
                <div className="profile-layout">

                    {/* SIDEBAR NAVIGATION */}
                    <aside className="profile-sidebar">
                        <div className="user-card">
                            <div className="avatar-circle">
                                {getInitials(user?.name || 'User')}
                            </div>
                            <div className="user-details">
                                <h3>{user?.name}</h3>
                                <span className="user-role">{(user as any)?.isAdmin ? 'Wellness Admin' : 'Community Member'}</span>
                            </div>
                        </div>

                        <nav className="sidebar-nav">
                            <button
                                className={`nav-btn ${activeTab === 'account' ? 'active' : ''}`}
                                onClick={() => setActiveTab('account')}
                            >
                                <User size={18} /> Wellness Profile
                            </button>
                            <button
                                className={`nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
                                onClick={() => setActiveTab('orders')}
                            >
                                <Package size={18} /> Your Rituals
                            </button>
                            <button
                                className={`nav-btn ${activeTab === 'addresses' ? 'active' : ''}`}
                                onClick={() => setActiveTab('addresses')}
                            >
                                <MapPin size={18} /> Delivery Addresses
                            </button>
                            <button
                                className={`nav-btn ${activeTab === 'password' ? 'active' : ''}`}
                                onClick={() => setActiveTab('password')}
                            >
                                <Key size={18} /> Account Security
                            </button>
                        </nav>

                        <button onClick={logout} className="logout-btn">
                            <LogOut size={18} /> Sign Out
                        </button>
                    </aside>

                    {/* MAIN CONTENT AREA */}
                    <main className="profile-content">

                        {/* ACCOUNT TAB */}
                        {activeTab === 'account' && (
                            <div className="panel-animate">
                                <div className="panel-header">
                                    <h2>Personal Details</h2>
                                    <p>Manage your account information and preferences.</p>
                                </div>
                                <form onSubmit={handleUpdateProfile} className="profile-form">
                                    <div className="form-group">
                                        <label>Full Name</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="glass-input"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email Address</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="glass-input"
                                            disabled
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? 'Saving...' : 'Update Profile'}
                                    </button>
                                </form>
                            </div>
                        )}

                        {/* ORDERS TAB */}
                        {activeTab === 'orders' && (
                            <div className="panel-animate">
                                <div className="panel-header">
                                    <h2>Order History</h2>
                                    <p>A log of your previous wellness purchases.</p>
                                </div>

                                {loading ? (
                                    <div className="loading-state"><Loader2 className="animate-spin" /> Fetching your rituals...</div>
                                ) : orders.length === 0 ? (
                                    <div className="empty-state">
                                        <Package size={48} />
                                        <p>You haven't placed any couture orders yet.</p>
                                        <Link to="/collection" className="btn-secondary">Explore Couture</Link>
                                    </div>
                                ) : (
                                    <div className="orders-grid">
                                        {orders.map((order) => (
                                            <div key={order._id} className="order-ticket">
                                                <div className="ticket-header">
                                                    <span className="order-id">#{order.orderNumber || order._id.slice(-6)}</span>
                                                    <span className={`status-badge ${order.status.toLowerCase()}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <div className="ticket-body">
                                                    <div className="ticket-row">
                                                        <Clock size={14} />
                                                        {new Date(order.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="ticket-row highlight">
                                                        PKR {order.total.toLocaleString()}
                                                    </div>
                                                </div>
                                                <Link to={`/orders/${order._id}`} className="ticket-action">
                                                    Order Details <ChevronRight size={16} />
                                                </Link>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ADDRESSES TAB */}
                        {activeTab === 'addresses' && (
                            <div className="panel-animate">
                                <div className="panel-header">
                                    <h2>Saved Addresses</h2>
                                    <p>Manage your delivery locations.</p>
                                </div>
                                <div className="empty-state">
                                    <MapPin size={48} />
                                    <p>Address management will be available in the next update.</p>
                                </div>
                            </div>
                        )}

                        {/* PASSWORD TAB */}
                        {activeTab === 'password' && (
                            <div className="panel-animate">
                                <div className="panel-header">
                                    <h2>Update Password</h2>
                                    <p>Ensure your account remains secure.</p>
                                </div>
                                <form onSubmit={handleChangePassword} className="profile-form">
                                    <div className="form-group">
                                        <label>Current Key</label>
                                        <input
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className="glass-input"
                                            required
                                        />
                                    </div>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>New Key</label>
                                            <input
                                                type="password"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                className="glass-input"
                                                required
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Confirm Key</label>
                                            <input
                                                type="password"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                className="glass-input"
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? 'Encrypting...' : 'Update Password'}
                                    </button>
                                </form>
                            </div>
                        )}

                    </main>
                </div>
            </div>
        </div>
    );
}