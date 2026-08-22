import React, { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { useToast } from '../context/ToastContext';
import { Users, Search, Shield, ShieldAlert, Trash2, Mail, Calendar, UserCheck, ShieldCheck } from 'lucide-react';
import './AdminUsers.css';

interface User {
    _id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    createdAt: string;
}

const AdminUsers: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const { showToast } = useToast();

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await client.get('/users');
            const rawList = Array.isArray(data) ? data : data.users || [];

            // Safe Data Mapping (Backend 'firstName' -> Frontend 'name', etc.)
            const sanitizedUsers: User[] = rawList.map((u: any) => ({
                _id: u._id,
                name: u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Unknown Personnel',
                email: u.email || 'No Contact',
                isAdmin: u.isAdmin === true || u.role === 'admin',
                createdAt: u.createdAt || new Date().toISOString()
            })).filter((u: User) => u._id); // Filter invalid objects

            setUsers(sanitizedUsers);
        } catch (error) {
            showToast('Failed to load personnel database', 'error');
            console.error('Fetch Error:', error);
        } finally {
            setLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async (id: string) => {
        if (!window.confirm('CRITICAL: Confirm termination of user account?')) return;
        try {
            await client.delete(`/users/${id}`);
            showToast('User record purged', 'success');
            setUsers(prev => prev.filter(u => u._id !== id));
        } catch (error) {
            showToast('Termination failed', 'error');
        }
    };

    const toggleAdminStatus = async (user: User) => {
        const newStatus = !user.isAdmin;
        const confirmMsg = newStatus
            ? `Grant COMMAND ACCESS to ${user.name}?`
            : `Revoke COMMAND ACCESS from ${user.name}?`;

        if (!window.confirm(confirmMsg)) return;

        try {
            await client.put(`/users/${user._id}`, { isAdmin: newStatus });
            showToast(`Clearance level updated: ${newStatus ? 'COMMANDER' : 'CIVILIAN'}`, 'success');
            setUsers(prev => prev.map(u => u._id === user._id ? { ...u, isAdmin: newStatus } : u));
        } catch (error) {
            showToast('Clearance update failed', 'error');
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getInitials = (name?: string) => {
        if (!name) return '??';
        return name.slice(0, 2).toUpperCase();
    };

    if (loading) return <div className="loading-container">Scanning Personnel Database...</div>;

    return (
        <div className="admin-users animate-fade-in">
            <div className="page-header">
                <h2>PERSONNEL DATABASE</h2>
                <div className="user-count-badge">
                    <UserCheck size={14} />
                    {users.length} ACTIVE RECORDS
                </div>
            </div>

            <div className="controls-bar">
                <div className="search-wrapper">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="SEARCH BY IDENTITY OR EMAIL..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="glass-input"
                    />
                </div>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>PROFILE</th>
                            <th>CLEARANCE</th>
                            <th>REGISTRY DATE</th>
                            <th className="text-right">PROTOCOL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user._id} className={user.isAdmin ? 'row-admin' : ''}>
                                <td>
                                    <div className="user-profile-cell">
                                        <div className={`avatar-circle ${user.isAdmin ? 'admin-glow' : ''}`}>
                                            {getInitials(user.name)}
                                        </div>
                                        <div className="user-info">
                                            <span className="user-name">{user.name || 'Unknown User'}</span>
                                            <span className="user-email">
                                                <Mail size={10} /> {user.email}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td>
                                    <button
                                        className={`role-badge ${user.isAdmin ? 'role-admin' : 'role-user'}`}
                                        onClick={() => toggleAdminStatus(user)}
                                        title="Modify Clearance Level"
                                    >
                                        {user.isAdmin ? <ShieldCheck size={12} /> : <Shield size={12} />}
                                        {user.isAdmin ? 'COMMAND' : 'CIVILIAN'}
                                    </button>
                                </td>
                                <td>
                                    <div className="date-cell">
                                        <Calendar size={12} />
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="icon-btn delete-btn"
                                            onClick={() => handleDelete(user._id)}
                                            title="Terminate Record"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="empty-state">
                                    NO MATCHING RECORDS FOUND
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsers;