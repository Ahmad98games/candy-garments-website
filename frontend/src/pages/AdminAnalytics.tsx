import React, { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import { Search, Activity, Terminal, Clock, Filter } from 'lucide-react';
import './AdminAnalytics.css';

// 1. Strict Typing
interface AnalyticsEvent {
    _id: string;
    type: string;
    sessionId: string;
    path: string;
    payload: Record<string, any>; // Flexible object for payload
    createdAt: string;
}

interface FilterState {
    type: string;
    sessionId: string;
}

const AdminAnalytics: React.FC = () => {
    const [events, setEvents] = useState<AnalyticsEvent[]>([]);
    const [loading, setLoading] = useState(true);

    // Grouping filters makes state management cleaner
    const [filters, setFilters] = useState<FilterState>({ type: '', sessionId: '' });

    // 2. Debouncing State: We only fetch when this changes
    const [debouncedFilters, setDebouncedFilters] = useState<FilterState>(filters);

    // Debounce Logic: Wait 500ms after user stops typing before updating the "real" filters
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedFilters(filters);
        }, 500);

        return () => clearTimeout(handler);
    }, [filters]);

    // Fetch data based on DEBOUNCED filters
    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await client.get('/events', {
                params: {
                    type: debouncedFilters.type || undefined,
                    sessionId: debouncedFilters.sessionId || undefined,
                    limit: 100 // Reduced limit slightly for better UI performance
                }
            });
            // Safe navigation in case data structure differs
            setEvents(data?.events || []);
        } catch (error) {
            console.error("Analytics fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [debouncedFilters]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    // Helper to color-code event types for quick scanning
    const getEventTypeColor = (type: string) => {
        if (type.includes('error') || type.includes('fail')) return 'badge-red';
        if (type.includes('click') || type.includes('submit')) return 'badge-green';
        if (type.includes('view') || type.includes('load')) return 'badge-blue';
        return 'badge-gray';
    };

    return (
        <div className="admin-analytics animate-fade-in">
            <div className="page-header">
                <h2>
                    <Activity className="header-icon" />
                    System Analytics
                </h2>
                <div className="header-meta">
                    <span className="live-indicator">● Live</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-input-wrapper">
                    <Filter size={16} className="input-icon" />
                    <input
                        name="type"
                        placeholder="Filter by Type (e.g. page_view)"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="glass-input"
                    />
                </div>
                <div className="search-input-wrapper">
                    <Search size={16} className="input-icon" />
                    <input
                        name="sessionId"
                        placeholder="Search Session ID..."
                        value={filters.sessionId}
                        onChange={handleFilterChange}
                        className="glass-input"
                    />
                </div>
            </div>

            {/* Data Table */}
            <div className="analytics-table-container">
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <span>Syncing Event Data...</span>
                    </div>
                ) : (
                    <table className="analytics-table">
                        <thead>
                            <tr>
                                <th>Event Type</th>
                                <th>Session / Path</th>
                                <th>Payload Data</th>
                                <th>Timestamp</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(ev => (
                                <tr key={ev._id}>
                                    <td className="col-type">
                                        <span className={`event-badge ${getEventTypeColor(ev.type)}`}>
                                            {ev.type}
                                        </span>
                                    </td>
                                    <td className="col-context">
                                        <div className="session-id" title={ev.sessionId}>
                                            ID: {ev.sessionId.substring(0, 8)}...
                                        </div>
                                        <div className="path-text">{ev.path}</div>
                                    </td>
                                    <td className="col-payload">
                                        <div className="code-snippet">
                                            <Terminal size={12} className="terminal-icon" />
                                            <code>{JSON.stringify(ev.payload)}</code>
                                        </div>
                                    </td>
                                    <td className="col-time">
                                        <div className="time-display">
                                            <Clock size={14} />
                                            {new Date(ev.createdAt).toLocaleTimeString()}
                                        </div>
                                        <div className="date-sub">
                                            {new Date(ev.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {events.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="empty-state">
                                        No events found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default AdminAnalytics;