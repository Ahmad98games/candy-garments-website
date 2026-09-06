import { useState, useEffect, useCallback } from 'react';
import { fetchOrders, updateOrderStatus, Order } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { Package, Truck, CheckCircle, XCircle, Clock, RefreshCw, Smartphone, MapPin, ShoppingBag, MessageSquare } from 'lucide-react';
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
    <div style={{ padding: '24px', color: '#0F172A', minHeight: '100%' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={24} style={{ color: '#4F46E5' }} /> Purchased Articles & Customer Orders
          </h1>
          <p style={{ color: '#64748B', fontSize: '13px', marginTop: '4px', margin: 0, fontWeight: 500 }}>
            Live record of exact articles, quantities, and customer shipping details from Supabase.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="btn btn-outline"
          style={{ height: '38px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#FFFFFF', color: '#0F172A', borderColor: '#CBD5E1', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh List
        </button>
      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#64748B' }}>
          <RefreshCw size={24} className="spin" style={{ color: '#4F46E5' }} />
          <p style={{ fontSize: '13px', marginTop: '12px', fontWeight: 600 }}>Fetching live orders from Supabase...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <Package size={40} style={{ color: '#64748B', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', color: '#0F172A', margin: '0 0 6px 0', fontWeight: 700 }}>No Customer Orders Found</h3>
          <p style={{ fontSize: '13px', color: '#64748B', margin: 0 }}>Customer purchases from Checkout and WhatsApp will automatically appear here with full article details.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
            const StatusIcon = statusConfig.icon;
            const rawPhone = order.customer_phone || '';
            const whatsappPhone = rawPhone.replace(/[^0-9]/g, '');
            const firstArticleNo = order.items?.[0]?.article_no || 'N/A';
            const firstTitle = order.items?.[0]?.title || 'Articles';
            const customerMsg = `Assalamu Alaikum ${order.customer_name || 'Customer'}! Regarding your Candy Garments order #${order.id} for Article ${firstArticleNo} (${firstTitle}) - Total PKR ${(order.total_amount || 0).toLocaleString()}. We are processing your dispatch!`;
            const waChatUrl = `https://wa.me/${whatsappPhone.startsWith('92') ? whatsappPhone : '92' + whatsappPhone.replace(/^0/, '')}?text=${encodeURIComponent(customerMsg)}`;

            return (
              <div key={order.id} style={{ backgroundColor: '#FFFFFF', borderRadius: '12px', border: '1px solid #E2E8F0', padding: '20px', boxShadow: '0 2px 8px rgba(15, 23, 42, 0.04)' }}>
                
                {/* TOP BAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700, display: 'block' }}>Order Reference</span>
                    <span className="font-mono" style={{ fontSize: '15px', fontWeight: 800, color: '#4F46E5' }}>#{order.id}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: '#ECFDF5', color: '#047857', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                      {order.payment_method || 'WhatsApp / Bank Transfer'}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: order.status === 'Delivered' ? '#047857' : order.status === 'Dispatched' ? '#0369A1' : order.status === 'Cancelled' ? '#B91C1C' : '#B45309', backgroundColor: order.status === 'Delivered' ? '#ECFDF5' : order.status === 'Dispatched' ? '#E0F2FE' : order.status === 'Cancelled' ? '#FEF2F2' : '#FFFBEB', padding: '4px 10px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                      <StatusIcon size={14} /> {statusConfig.label}
                    </div>
                  </div>
                </div>

                {/* CUSTOMER & SHIPPING DETAILS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px', backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Customer Name</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>{order.customer_name || 'Valued Client'}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Phone / WhatsApp</span>
                    <a href={waChatUrl} target="_blank" rel="noopener noreferrer" className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: '#059669', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: '#ECFDF5', padding: '3px 8px', borderRadius: '4px', border: '1px solid #A7F3D0' }}>
                      <Smartphone size={13} /> {order.customer_phone || 'N/A'} <MessageSquare size={12} />
                    </a>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '2px' }}>City & Delivery Address</span>
                    <span style={{ fontSize: '12px', color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <MapPin size={13} style={{ color: '#4F46E5' }} /> {order.city || 'N/A'} — {order.shipping_address || 'Address N/A'}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '2px' }}>Total Amount</span>
                    <span className="font-mono" style={{ fontSize: '16px', fontWeight: 900, color: '#059669' }}>
                      PKR {(order.total_amount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* PURCHASED ARTICLES TABLE BREAKDOWN */}
                <div style={{ backgroundColor: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0', padding: '14px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShoppingBag size={14} /> Purchased Articles Breakdown ({order.items?.length || 0} Items)
                  </div>

                  {order.items && order.items.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {order.items.map((item, idx) => (
                        <div key={item.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#FFFFFF', padding: '10px 12px', borderRadius: '8px', border: '1px solid #E2E8F0', flexWrap: 'wrap' }}>
                          
                          {/* Image Thumbnail */}
                          <div style={{ width: '42px', height: '56px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#F1F5F9', flexShrink: 0, border: '1px solid #CBD5E1' }}>
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'}
                              alt={item.title || 'Article'}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>

                          {/* Article Info */}
                          <div style={{ flex: 1, minWidth: '180px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                              <span className="font-mono" style={{ backgroundColor: '#F1F5F9', color: '#0F172A', fontSize: '11px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', border: '1px solid #CBD5E1' }}>
                                Article: {item.article_no || 'N/A'}
                              </span>
                              {item.color && (
                                <span style={{ backgroundColor: '#E0F2FE', color: '#0369A1', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', border: '1px solid #BAE6FD' }}>
                                  Color: {item.color}
                                </span>
                              )}
                              {item.size && (
                                <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', border: '1px solid #FDE68A' }}>
                                  Size: {item.size}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#0F172A', display: 'block' }}>
                              {item.title || 'Product'}
                            </span>
                          </div>

                          {/* Quantity & Line Total */}
                          <div style={{ textAlign: 'right', minWidth: '100px' }}>
                            <span style={{ fontSize: '12px', color: '#64748B', display: 'block' }}>
                              Qty: <strong style={{ color: '#0F172A' }}>{item.quantity || 1}</strong> × PKR {(item.price || 0).toLocaleString()}
                            </span>
                            <span className="font-mono" style={{ fontSize: '13px', fontWeight: 800, color: '#059669' }}>
                              PKR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                            </span>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#64748B' }}>No detailed article breakdown available.</span>
                  )}
                </div>

                {/* STATUS ACTIONS */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #F1F5F9', paddingTop: '12px', flexWrap: 'wrap' }}>
                  <a
                    href={waChatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ height: '34px', fontSize: '12px', backgroundColor: '#059669', color: '#FFFFFF', border: 'none', padding: '0 14px', borderRadius: '6px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <MessageSquare size={14} /> Message Customer on WhatsApp
                  </a>

                  {order.status !== 'Dispatched' && order.status !== 'Delivered' && (
                    <button
                      onClick={() => handleStatusChange(order.id!, 'Dispatched')}
                      disabled={processingId === order.id}
                      className="btn btn-outline"
                      style={{ height: '34px', fontSize: '12px', color: '#0284C7', borderColor: '#BAE6FD', backgroundColor: '#E0F2FE', borderRadius: '6px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Truck size={14} /> Mark Dispatched
                    </button>
                  )}

                  {order.status !== 'Delivered' && (
                    <button
                      onClick={() => handleStatusChange(order.id!, 'Delivered')}
                      disabled={processingId === order.id}
                      className="btn"
                      style={{ height: '34px', fontSize: '12px', backgroundColor: '#4F46E5', color: '#FFFFFF', border: 'none', padding: '0 14px', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <CheckCircle size={14} /> Mark Delivered
                    </button>
                  )}

                  {order.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleStatusChange(order.id!, 'Cancelled')}
                      disabled={processingId === order.id}
                      style={{ height: '34px', fontSize: '12px', background: '#FEF2F2', color: '#DC2626', border: '1px solid #FCA5A5', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0 12px', fontWeight: 700 }}
                    >
                      <XCircle size={14} /> Cancel
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