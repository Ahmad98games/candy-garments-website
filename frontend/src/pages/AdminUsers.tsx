import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  fetchCustomerTrustProfiles, 
  saveCustomerTrustOverride, 
  CustomerTrustRecord,
  Order 
} from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { 
  Users, 
  Search, 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle,
  RefreshCw, 
  Phone, 
  MessageCircle, 
  ShoppingBag, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MapPin, 
  Sparkles,
  Award,
  Filter
} from 'lucide-react';
import './AdminUsers.css';

const AdminUsers: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerTrustRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [expandedCustomerId, setExpandedCustomerId] = useState<string | null>(null);

  // Manual Override State
  const [overrideCustomer, setOverrideCustomer] = useState<CustomerTrustRecord | null>(null);
  const [overrideTier, setOverrideTier] = useState<'STANDARD' | 'TRUSTED' | 'RESTRICTED' | 'UNVERIFIED'>('STANDARD');
  const [overrideReason, setOverrideReason] = useState('');
  const [isSavingOverride, setIsSavingOverride] = useState(false);

  const { showToast } = useToast();

  const loadCustomerData = useCallback(async (showLoadingSpinner = true) => {
    if (showLoadingSpinner) setLoading(true);
    setIsRefreshing(true);
    try {
      const data = await fetchCustomerTrustProfiles();
      setCustomers(data);
    } catch (error) {
      console.error('Failed to load customers from database:', error);
      showToast('Error loading live customer database', 'error');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCustomerData(true);
  }, [loadCustomerData]);

  // Filtered customers based on search and tier selector
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const query = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !query ||
        c.name.toLowerCase().includes(query) ||
        c.phone.toLowerCase().includes(query) ||
        c.city.toLowerCase().includes(query) ||
        c.orders.some((o) => o.id?.toLowerCase().includes(query));

      const matchesTier =
        selectedTier === 'ALL' ||
        c.trustTier.toUpperCase() === selectedTier.toUpperCase();

      return matchesSearch && matchesTier;
    });
  }, [customers, searchTerm, selectedTier]);

  // Overall Statistics calculated directly from real database records
  const stats = useMemo(() => {
    const total = customers.length;
    const trusted = customers.filter((c) => c.trustTier === 'TRUSTED').length;
    const standard = customers.filter((c) => c.trustTier === 'STANDARD').length;
    const restricted = customers.filter((c) => c.trustTier === 'RESTRICTED').length;
    const unverified = customers.filter((c) => c.trustTier === 'UNVERIFIED').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
    const totalOrders = customers.reduce((sum, c) => sum + (c.totalOrders || 0), 0);
    return { total, trusted, standard, restricted, unverified, totalRevenue, totalOrders };
  }, [customers]);

  const getInitials = (name: string) => {
    if (!name) return 'CU';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const formatPKR = (amount: number) => {
    return `Rs ${Number(amount || 0).toLocaleString('en-PK')}`;
  };

  const handleOpenOverride = (customer: CustomerTrustRecord) => {
    setOverrideCustomer(customer);
    setOverrideTier(customer.trustTier === 'RESTRICTED' ? 'STANDARD' : 'RESTRICTED');
    setOverrideReason(customer.overrideReason || '');
  };

  const handleConfirmOverride = async () => {
    if (!overrideCustomer) return;
    if (!overrideReason.trim()) {
      showToast('Audit justification note is required for manual trust tier override', 'error');
      return;
    }

    setIsSavingOverride(true);
    try {
      await saveCustomerTrustOverride(
        overrideCustomer.phone || overrideCustomer.id,
        overrideTier,
        overrideReason.trim()
      );

      showToast(`Trust tier updated to ${overrideTier} for ${overrideCustomer.name}`, 'success');

      // Update state locally
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === overrideCustomer.id
            ? {
                ...c,
                trustTier: overrideTier,
                isOverridden: true,
                overrideReason: overrideReason.trim(),
                codRefusalCount: overrideTier === 'STANDARD' || overrideTier === 'TRUSTED' ? 0 : c.codRefusalCount,
              }
            : c
        )
      );

      setOverrideCustomer(null);
      setOverrideReason('');
    } catch (err) {
      console.error('Failed to save override:', err);
      showToast('Failed to save trust override', 'error');
    } finally {
      setIsSavingOverride(false);
    }
  };

  const toggleAccordion = (customerId: string) => {
    setExpandedCustomerId((prev) => (prev === customerId ? null : customerId));
  };

  const getCleanWhatsAppLink = (phone: string, name: string) => {
    const cleanDigits = phone.replace(/[^\d]/g, '');
    let fullNumber = cleanDigits;
    if (cleanDigits.startsWith('03')) {
      fullNumber = '92' + cleanDigits.substring(1);
    } else if (cleanDigits.startsWith('3')) {
      fullNumber = '92' + cleanDigits;
    }
    const message = encodeURIComponent(`Assalam-o-Alaikum ${name}, this is Candy Garments / Omnora customer support regarding your order.`);
    return `https://wa.me/${fullNumber}?text=${message}`;
  };

  const presetReasons = [
    'Courier logistics/rider delivery failure; customer is genuine',
    'Customer provided advance bank transfer/Raast deposit',
    'Multiple bogus/cancelled COD orders flagged by operations',
    'Customer cancelled prior to dispatch; polite buyer',
  ];

  if (loading) {
    return (
      <div className="admin-users-loading">
        <div className="loading-spinner-box">
          <RefreshCw size={32} className="spin-icon" style={{ color: '#E52535' }} />
          <h3>Connecting to Live Supabase Database...</h3>
          <p>Analyzing customer order histories and calculating authentic trust tiers</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users animate-fade-in">
      {/* PAGE HEADER */}
      <div className="page-header">
        <div className="header-titles">
          <div className="title-row">
            <h2>CUSTOMER TRUST & FRAUD MANAGEMENT</h2>
            <span className="live-db-pill">
              <span className="live-dot" />
              LIVE SUPABASE DATABASE
            </span>
          </div>
          <p className="header-subtitle">
            Authentic customer risk profiles, order histories, and COD gating derived directly from live database orders.
          </p>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="refresh-db-btn"
            onClick={() => loadCustomerData(false)}
            disabled={isRefreshing}
            title="Refresh database records"
          >
            <RefreshCw size={15} className={isRefreshing ? 'spin-icon' : ''} />
            {isRefreshing ? 'Syncing...' : 'Sync Database'}
          </button>
        </div>
      </div>

      {/* KPI METRICS OVERVIEW */}
      <div className="trust-kpi-grid">
        <div className="kpi-card kpi-total">
          <div className="kpi-icon-wrapper">
            <Users size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">TOTAL CUSTOMERS</span>
            <strong className="kpi-value">{stats.total}</strong>
            <span className="kpi-sub">{stats.totalOrders} total orders placed</span>
          </div>
        </div>

        <div className="kpi-card kpi-trusted">
          <div className="kpi-icon-wrapper">
            <ShieldCheck size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">TRUSTED (VIP)</span>
            <strong className="kpi-value">{stats.trusted}</strong>
            <span className="kpi-sub">Priority courier dispatch</span>
          </div>
        </div>

        <div className="kpi-card kpi-standard">
          <div className="kpi-icon-wrapper">
            <Shield size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">STANDARD BUYERS</span>
            <strong className="kpi-value">{stats.standard}</strong>
            <span className="kpi-sub">Eligible for COD & Prepaid</span>
          </div>
        </div>

        <div className="kpi-card kpi-restricted">
          <div className="kpi-icon-wrapper">
            <ShieldAlert size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">RESTRICTED (COD GATED)</span>
            <strong className="kpi-value">{stats.restricted}</strong>
            <span className="kpi-sub">High RTO risk · Prepaid only</span>
          </div>
        </div>

        <div className="kpi-card kpi-revenue">
          <div className="kpi-icon-wrapper">
            <Sparkles size={20} />
          </div>
          <div className="kpi-info">
            <span className="kpi-label">TOTAL RECORDED SPEND</span>
            <strong className="kpi-value">{formatPKR(stats.totalRevenue)}</strong>
            <span className="kpi-sub">Lifetime customer volume</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="controls-container">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by customer name, phone number, city, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              type="button" 
              className="clear-search-btn"
              onClick={() => setSearchTerm('')}
            >
              ×
            </button>
          )}
        </div>

        <div className="tier-filter-pills">
          <button
            type="button"
            className={`filter-pill ${selectedTier === 'ALL' ? 'active' : ''}`}
            onClick={() => setSelectedTier('ALL')}
          >
            All Customers ({customers.length})
          </button>
          <button
            type="button"
            className={`filter-pill pill-trusted ${selectedTier === 'TRUSTED' ? 'active' : ''}`}
            onClick={() => setSelectedTier('TRUSTED')}
          >
            <ShieldCheck size={13} /> Trusted ({stats.trusted})
          </button>
          <button
            type="button"
            className={`filter-pill pill-standard ${selectedTier === 'STANDARD' ? 'active' : ''}`}
            onClick={() => setSelectedTier('STANDARD')}
          >
            <Shield size={13} /> Standard ({stats.standard})
          </button>
          <button
            type="button"
            className={`filter-pill pill-restricted ${selectedTier === 'RESTRICTED' ? 'active' : ''}`}
            onClick={() => setSelectedTier('RESTRICTED')}
          >
            <ShieldAlert size={13} /> Restricted ({stats.restricted})
          </button>
          <button
            type="button"
            className={`filter-pill pill-unverified ${selectedTier === 'UNVERIFIED' ? 'active' : ''}`}
            onClick={() => setSelectedTier('UNVERIFIED')}
          >
            Unverified ({stats.unverified})
          </button>
        </div>
      </div>

      {/* TABLE OR AUTHENTIC EMPTY STATE */}
      {filteredCustomers.length === 0 ? (
        <div className="authentic-empty-state">
          <div className="empty-icon-box">
            <Users size={48} style={{ color: '#94A3B8' }} />
          </div>
          <h3>
            {customers.length === 0
              ? 'No Customer Orders Recorded in Database Yet'
              : 'No Customers Matched Your Search'}
          </h3>
          <p>
            {customers.length === 0
              ? 'Real customer profiles and their trust metrics will appear here automatically as soon as orders are placed in the database.'
              : `No customer records matched "${searchTerm}". Try searching by phone number, name, or city.`}
          </p>
          {searchTerm && (
            <button
              type="button"
              className="reset-search-btn"
              onClick={() => {
                setSearchTerm('');
                setSelectedTier('ALL');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>CUSTOMER & CONTACT</th>
                <th>CITY & ADDRESS</th>
                <th>TRUST TIER</th>
                <th>COD REFUSALS</th>
                <th>COMPLETED ORDERS</th>
                <th>TOTAL SPEND</th>
                <th className="text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => {
                const tier = customer.trustTier;
                const isExpanded = expandedCustomerId === customer.id;
                const hasHighRefusals = (customer.codRefusalCount || 0) >= 2;

                return (
                  <React.Fragment key={customer.id}>
                    <tr className={`customer-row ${tier === 'RESTRICTED' ? 'row-restricted' : ''} ${isExpanded ? 'row-expanded' : ''}`}>
                      {/* Customer & Contact */}
                      <td>
                        <div className="user-profile-cell">
                          <div className={`avatar-circle tier-border-${tier.toLowerCase()}`}>
                            {getInitials(customer.name)}
                          </div>
                          <div className="user-info">
                            <span className="user-name">{customer.name}</span>
                            <div className="contact-links">
                              <a
                                href={`tel:${customer.phone}`}
                                className="phone-link"
                                title="Click to call customer"
                              >
                                <Phone size={11} />
                                {customer.phone}
                              </a>
                              <a
                                href={getCleanWhatsAppLink(customer.phone, customer.name)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="whatsapp-link"
                                title="Chat on WhatsApp"
                              >
                                <MessageCircle size={11} />
                                WhatsApp
                              </a>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* City & Address */}
                      <td>
                        <div className="address-cell">
                          <span className="city-name">
                            <MapPin size={12} style={{ color: '#E52535' }} />
                            {customer.city || 'Pakistan'}
                          </span>
                          <span className="shipping-sub" title={customer.shippingAddress}>
                            {customer.shippingAddress || 'No address stored'}
                          </span>
                        </div>
                      </td>

                      {/* Trust Tier */}
                      <td>
                        <div className="tier-badge-container">
                          <span className={`tier-badge tier-${tier.toLowerCase()}`}>
                            {tier === 'TRUSTED' && <Award size={12} />}
                            {tier === 'RESTRICTED' && <ShieldAlert size={12} />}
                            {tier === 'STANDARD' && <ShieldCheck size={12} />}
                            {tier === 'UNVERIFIED' && <Shield size={12} />}
                            {tier}
                          </span>
                          {customer.isOverridden && (
                            <span className="override-indicator" title={`Admin Override: ${customer.overrideReason || 'Manual'}`}>
                              MANUAL OVERRIDE
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Refusals */}
                      <td>
                        <div className="metric-cell">
                          <strong className={hasHighRefusals ? 'text-danger' : 'text-neutral'}>
                            {customer.codRefusalCount || 0} Refusals
                          </strong>
                          {hasHighRefusals && (
                            <span className="warning-pill">
                              <AlertTriangle size={10} /> COD Disabled
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Completed */}
                      <td>
                        <div className="metric-cell">
                          <strong className="text-success">
                            {customer.completedOrders || 0} Delivered
                          </strong>
                          <span className="order-ratio">
                            of {customer.totalOrders} placed
                          </span>
                        </div>
                      </td>

                      {/* Total Spend */}
                      <td>
                        <strong className="total-spent-val">
                          {formatPKR(customer.totalSpent)}
                        </strong>
                      </td>

                      {/* Actions */}
                      <td className="text-right">
                        <div className="action-buttons-group">
                          <button
                            type="button"
                            onClick={() => toggleAccordion(customer.id)}
                            className="btn-inspect-orders"
                            title="View order history"
                          >
                            <ShoppingBag size={13} />
                            {customer.orders.length} {customer.orders.length === 1 ? 'Order' : 'Orders'}
                            {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenOverride(customer)}
                            className="btn-trust-override"
                            title="Manually override trust tier"
                          >
                            Override
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDABLE ORDER HISTORY ACCORDION ROW */}
                    {isExpanded && (
                      <tr className="accordion-row">
                        <td colSpan={7} className="accordion-cell">
                          <div className="orders-drawer-content">
                            <div className="drawer-header">
                              <h4>
                                <ShoppingBag size={16} /> Authentic Order History for {customer.name}
                              </h4>
                              <span className="drawer-sub">
                                Phone: {customer.phone} · Shipping City: {customer.city}
                              </span>
                            </div>

                            {customer.orders.length === 0 ? (
                              <p className="no-orders-note">No individual orders found for this customer profile.</p>
                            ) : (
                              <div className="drawer-orders-grid">
                                {customer.orders.map((ord: Order, idx: number) => {
                                  const status = ord.status || 'Pending';
                                  const items = Array.isArray(ord.items) ? ord.items : [];

                                  return (
                                    <div key={ord.id || idx} className="drawer-order-card">
                                      <div className="order-card-top">
                                        <div>
                                          <span className="order-card-id">ORDER #{ord.id?.substring(0, 8)}...</span>
                                          <div className="order-card-date">
                                            <Clock size={11} />
                                            {ord.created_at ? new Date(ord.created_at).toLocaleString() : 'Recent'}
                                          </div>
                                        </div>
                                        <span className={`order-status-pill status-${status.toLowerCase()}`}>
                                          {status === 'Delivered' && <CheckCircle2 size={11} />}
                                          {status === 'Cancelled' && <XCircle size={11} />}
                                          {status}
                                        </span>
                                      </div>

                                      <div className="order-card-amount">
                                        <span>Total:</span>
                                        <strong>{formatPKR(Number(ord.total_amount) || 0)}</strong>
                                      </div>

                                      <div className="order-card-method">
                                        💳 {ord.payment_method || 'WhatsApp / Bank Transfer'}
                                      </div>

                                      {items.length > 0 && (
                                        <div className="order-items-list">
                                          <span className="items-title">Articles ({items.length}):</span>
                                          {items.map((it: any, itemIdx: number) => (
                                            <div key={itemIdx} className="item-row">
                                              <span className="item-name">• {it.title || it.name || 'Candy Garments Article'}</span>
                                              <span className="item-qty">x{it.quantity || 1}</span>
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* MANUAL TRUST OVERRIDE MODAL */}
      {overrideCustomer && (
        <div className="override-modal-backdrop" onClick={() => setOverrideCustomer(null)}>
          <div className="override-modal-window" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div>
                <h3 className="modal-title">
                  <Shield size={20} style={{ color: '#E52535' }} />
                  Override Trust Tier: {overrideCustomer.name}
                </h3>
                <p className="modal-subtitle">
                  Phone: <strong>{overrideCustomer.phone}</strong> · Refusals: <strong>{overrideCustomer.codRefusalCount || 0}</strong> · Completed: <strong>{overrideCustomer.completedOrders || 0}</strong>
                </p>
              </div>
              <button
                type="button"
                className="close-modal-btn"
                onClick={() => setOverrideCustomer(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">
                  Select New Trust Tier:
                </label>
                <select
                  value={overrideTier}
                  onChange={(e: any) => setOverrideTier(e.target.value)}
                  className="tier-select-dropdown"
                >
                  <option value="STANDARD">STANDARD — Allow Cash on Delivery (COD) and Prepaid</option>
                  <option value="TRUSTED">TRUSTED (VIP) — VIP status & priority courier clearance</option>
                  <option value="RESTRICTED">RESTRICTED — High RTO risk; Hide/Disable COD option (Prepaid only)</option>
                  <option value="UNVERIFIED">UNVERIFIED — Require phone verification on next order</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Audit Justification / Note (Required) *:
                </label>
                <textarea
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  placeholder="e.g. Courier rider failed to deliver due to city roadblock; buyer is legitimate and paid advance."
                  rows={3}
                  className="reason-textarea"
                />
              </div>

              {/* QUICK SUGGESTION PRESETS */}
              <div className="presets-wrapper">
                <span className="presets-label">Quick Suggestions:</span>
                <div className="presets-chips">
                  {presetReasons.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className="preset-chip"
                      onClick={() => setOverrideReason(preset)}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                onClick={() => setOverrideCustomer(null)}
                className="btn-modal-cancel"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOverride}
                disabled={isSavingOverride}
                className="btn-modal-confirm"
              >
                {isSavingOverride ? 'Saving Override...' : 'Confirm & Save Override'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;