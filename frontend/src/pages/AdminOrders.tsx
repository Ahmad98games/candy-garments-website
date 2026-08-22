import { useState, useEffect, useCallback } from 'react';
import { fetchOrders, updateOrderStatus, Order } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { Package, Truck, CheckCircle, XCircle, Clock, RefreshCw, Smartphone, MapPin } from 'lucide-react';
import './AdminOrders.css';

const STATUS_CONFIG: Record<Order['status'], { label: string; colorClass: string; icon: any }> = {
  Pending: { label: 'Pending Dispatch', colorClass: 'status-yellow', icon: Clock },
  Dispatched: { label: 'Dispatched', colorClass: 'status-purple', icon: Truck },
  Delivered: { label: 'Delivered', colorClass: 'status-green', icon: CheckCircle },
  Cancelled: { label: 'Cancelled', colorClass: 'status-red', icon: XCircle },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { showToast } = useToast();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data);
    } catch (err) {
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleStatusChange = async (orderId: string, newStatus: Order['status']) => {
    if (!orderId) return;
    setProcessingId(orderId);
    try {
      const success = await updateOrderStatus(orderId, newStatus);
      if (success) {
        showToast(`Order status updated to ${newStatus}`, 'success');
        setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));
      } else {
        showToast('Status update failed', 'error');
      }
    } catch (err) {
      showToast('Error updating order status', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Customer Orders Dashboard
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '2px' }}>
            Live record of customer purchases from Supabase <code className="font-mono" style={{ background: 'var(--bg-surface)', padding: '2px 6px', borderRadius: '4px' }}>orders</code> table.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="btn btn-outline"
          style={{ height: '34px', fontSize: '12px' }}
        >
          <RefreshCw size={13} /> Refresh List
        </button>
      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          <RefreshCw size={20} className="spin" />
          <p style={{ fontSize: '13px', marginTop: '8px' }}>Fetching orders from Supabase...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="industrial-card" style={{ textAlign: 'center', padding: '48px', background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
          <Package size={36} style={{ color: 'var(--text-muted)', marginBottom: '8px' }} />
          <h3 style={{ fontSize: '16px', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>No Customer Orders Yet</h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Orders submitted via Advance Bank Transfer / WhatsApp will appear here in real-time.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
            const StatusIcon = statusConfig.icon;

            return (
              <div key={order.id} className="industrial-card" style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '16px' }}>
                
                {/* TOP BAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Order Reference</span>
                    <span className="font-mono" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>#{order.id}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: order.payment_method === 'WhatsApp' ? 'rgba(37, 211, 102, 0.15)' : 'rgba(245, 158, 11, 0.15)', color: order.payment_method === 'WhatsApp' ? '#25D366' : 'var(--accent-amber)', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: 'var(--radius-sm)', border: `1px solid ${order.payment_method === 'WhatsApp' ? 'rgba(37, 211, 102, 0.3)' : 'rgba(245, 158, 11, 0.3)'}` }}>
                      {order.payment_method}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <StatusIcon size={14} /> {statusConfig.label}
                    </div>
                  </div>
                </div>

                {/* CUSTOMER & SHIPPING DETAILS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Customer Name</span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>{order.customer_name}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Phone / WhatsApp</span>
                    <a href={`https://wa.me/${order.customer_phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="font-mono" style={{ fontSize: '13px', fontWeight: 600, color: '#25D366', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Smartphone size={13} /> {order.customer_phone}
                    </a>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>City & Delivery Address</span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={13} /> {order.city} — {order.shipping_address}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block' }}>Total Amount</span>
                    <span className="font-mono" style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      PKR {order.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* ORDER ITEMS */}
                {order.items && order.items.length > 0 && (
                  <div style={{ background: 'var(--bg-surface)', padding: '10px', borderRadius: 'var(--radius-md)', marginBottom: '12px', border: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Purchased Items:</span>
                    <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                      {order.items.map((item, idx) => (
                        <div key={item.id || item.article_no || idx} style={{ fontSize: '12px', color: 'var(--text-primary)' }}>
                          • <strong>{item.title}</strong> <span className="font-mono" style={{ color: 'var(--text-muted)' }}>(Art: {item.article_no || 'N/A'})</span> x {item.quantity} — <span className="font-mono" style={{ color: 'var(--accent-emerald)' }}>PKR {(item.price * item.quantity).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* STATUS ACTIONS */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  {order.status !== 'Dispatched' && order.status !== 'Delivered' && (
                    <button
                      onClick={() => handleStatusChange(order.id!, 'Dispatched')}
                      disabled={processingId === order.id}
                      className="btn btn-outline"
                      style={{ height: '30px', fontSize: '11px', color: 'var(--accent-cyan)', borderColor: 'var(--accent-cyan)' }}
                    >
                      <Truck size={13} /> Mark Dispatched
                    </button>
                  )}

                  {order.status !== 'Delivered' && (
                    <button
                      onClick={() => handleStatusChange(order.id!, 'Delivered')}
                      disabled={processingId === order.id}
                      className="btn btn-emerald"
                      style={{ height: '30px', fontSize: '11px' }}
                    >
                      <CheckCircle size={13} /> Mark Delivered
                    </button>
                  )}

                  {order.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleStatusChange(order.id!, 'Cancelled')}
                      disabled={processingId === order.id}
                      style={{ height: '30px', fontSize: '11px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-crimson)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0 10px', fontWeight: 600 }}
                    >
                      <XCircle size={13} /> Cancel
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}