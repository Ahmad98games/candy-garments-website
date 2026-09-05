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
    <div style={{ padding: '24px', color: '#F9FAFB', minHeight: '100%' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#FFFFFF', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingBag size={24} style={{ color: '#F59E0B' }} /> Purchased Articles & Customer Orders
          </h1>
          <p style={{ color: '#9CA3AF', fontSize: '13px', marginTop: '4px', margin: 0 }}>
            Live record of exact articles, quantities, and customer shipping details from Supabase.
          </p>
        </div>

        <button
          onClick={loadOrders}
          className="btn btn-outline"
          style={{ height: '36px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1F2937', color: '#F9FAFB', borderColor: '#4B5563' }}
        >
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh List
        </button>
      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: '#9CA3AF' }}>
          <RefreshCw size={24} className="spin" style={{ color: '#F59E0B' }} />
          <p style={{ fontSize: '13px', marginTop: '12px', fontWeight: 600 }}>Fetching live orders from Supabase...</p>
        </div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #374151' }}>
          <Package size={40} style={{ color: '#9CA3AF', marginBottom: '12px' }} />
          <h3 style={{ fontSize: '18px', color: '#F9FAFB', margin: '0 0 6px 0', fontWeight: 700 }}>No Customer Orders Found</h3>
          <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>Customer purchases from Checkout and WhatsApp will automatically appear here with full article details.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {orders.map((order) => {
            const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.Pending;
            const StatusIcon = statusConfig.icon;
            const whatsappPhone = order.customer_phone.replace(/[^0-9]/g, '');
            const firstArticleNo = order.items?.[0]?.article_no || 'N/A';
            const firstTitle = order.items?.[0]?.title || 'Articles';
            const customerMsg = `Assalamu Alaikum ${order.customer_name}! Regarding your Candy Garments order #${order.id} for Article ${firstArticleNo} (${firstTitle}) - Total PKR ${order.total_amount.toLocaleString()}. We are processing your dispatch!`;
            const waChatUrl = `https://wa.me/${whatsappPhone.startsWith('92') ? whatsappPhone : '92' + whatsappPhone.replace(/^0/, '')}?text=${encodeURIComponent(customerMsg)}`;

            return (
              <div key={order.id} style={{ backgroundColor: '#111827', borderRadius: '12px', border: '1px solid #374151', padding: '18px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)' }}>
                
                {/* TOP BAR */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #1F2937', flexWrap: 'wrap', gap: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'block' }}>Order Reference</span>
                    <span className="font-mono" style={{ fontSize: '15px', fontWeight: 800, color: '#F59E0B' }}>#{order.id}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ background: 'rgba(37, 211, 102, 0.15)', color: '#25D366', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(37, 211, 102, 0.3)' }}>
                      {order.payment_method || 'WhatsApp / Bank Transfer'}
                    </span>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: statusConfig.colorClass === 'status-green' ? '#10B981' : statusConfig.colorClass === 'status-purple' ? '#A78BFA' : '#F59E0B', backgroundColor: '#1F2937', padding: '4px 10px', borderRadius: '6px', border: '1px solid #374151' }}>
                      <StatusIcon size={14} /> {statusConfig.label}
                    </div>
                  </div>
                </div>

                {/* CUSTOMER & SHIPPING DETAILS */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '16px', backgroundColor: '#1F2937', padding: '14px', borderRadius: '8px', border: '1px solid #374151' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Customer Name</span>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>{order.customer_name}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Phone / WhatsApp</span>
                    <a href={waChatUrl} target="_blank" rel="noopener noreferrer" className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: '#25D366', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', backgroundColor: 'rgba(37, 211, 102, 0.1)', padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(37, 211, 102, 0.3)' }}>
                      <Smartphone size={13} /> {order.customer_phone} <MessageSquare size={12} />
                    </a>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>City & Delivery Address</span>
                    <span style={{ fontSize: '12px', color: '#E5E7EB', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <MapPin size={13} style={{ color: '#F59E0B' }} /> {order.city} — {order.shipping_address}
                    </span>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase', fontWeight: 600, display: 'block', marginBottom: '2px' }}>Total Amount</span>
                    <span className="font-mono" style={{ fontSize: '16px', fontWeight: 900, color: '#10B981' }}>
                      PKR {order.total_amount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* PURCHASED ARTICLES TABLE BREAKDOWN */}
                <div style={{ backgroundColor: '#1F2937', borderRadius: '8px', border: '1px solid #374151', padding: '14px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShoppingBag size={14} /> Purchased Articles Breakdown ({order.items?.length || 0} Items)
                  </div>

                  {order.items && order.items.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {order.items.map((item, idx) => (
                        <div key={item.id || idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#111827', padding: '10px 12px', borderRadius: '8px', border: '1px solid #374151', flexWrap: 'wrap' }}>
                          
                          {/* Image Thumbnail */}
                          <div style={{ width: '42px', height: '56px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#374151', flexShrink: 0, border: '1px solid #4B5563' }}>
                            <img
                              src={item.image || 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'}
                              alt={item.title}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          </div>

                          {/* Article Info */}
                          <div style={{ flex: 1, minWidth: '180px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                              <span className="font-mono" style={{ backgroundColor: '#374151', color: '#F9FAFB', fontSize: '11px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', border: '1px solid #4B5563' }}>
                                Article: {item.article_no || 'N/A'}
                              </span>
                              {item.color && (
                                <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                                  Color: {item.color}
                                </span>
                              )}
                              {item.size && (
                                <span style={{ backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#F59E0B', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                  Size: {item.size}
                                </span>
                              )}
                            </div>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', display: 'block' }}>
                              {item.title}
                            </span>
                          </div>

                          {/* Quantity & Line Total */}
                          <div style={{ textAlign: 'right', minWidth: '100px' }}>
                            <span style={{ fontSize: '12px', color: '#9CA3AF', display: 'block' }}>
                              Qty: <strong style={{ color: '#FFFFFF' }}>{item.quantity}</strong> × PKR {item.price.toLocaleString()}
                            </span>
                            <span className="font-mono" style={{ fontSize: '13px', fontWeight: 800, color: '#10B981' }}>
                              PKR {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>

                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>No detailed article breakdown available.</span>
                  )}
                </div>

                {/* STATUS ACTIONS */}
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', borderTop: '1px solid #1F2937', paddingTop: '12px', flexWrap: 'wrap' }}>
                  <a
                    href={waChatUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn"
                    style={{ height: '32px', fontSize: '12px', backgroundColor: '#0F9D58', color: '#FFFFFF', border: 'none', padding: '0 12px', borderRadius: '6px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <MessageSquare size={14} /> Message Customer on WhatsApp
                  </a>

                  {order.status !== 'Dispatched' && order.status !== 'Delivered' && (
                    <button
                      onClick={() => handleStatusChange(order.id!, 'Dispatched')}
                      disabled={processingId === order.id}
                      className="btn btn-outline"
                      style={{ height: '32px', fontSize: '12px', color: '#38BDF8', borderColor: 'rgba(56, 189, 248, 0.4)', backgroundColor: '#1F2937' }}
                    >
                      <Truck size={14} /> Mark Dispatched
                    </button>
                  )}

                  {order.status !== 'Delivered' && (
                    <button
                      onClick={() => handleStatusChange(order.id!, 'Delivered')}
                      disabled={processingId === order.id}
                      className="btn"
                      style={{ height: '32px', fontSize: '12px', backgroundColor: '#10B981', color: '#FFFFFF', border: 'none', padding: '0 12px', borderRadius: '6px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <CheckCircle size={14} /> Mark Delivered
                    </button>
                  )}

                  {order.status !== 'Cancelled' && (
                    <button
                      onClick={() => handleStatusChange(order.id!, 'Cancelled')}
                      disabled={processingId === order.id}
                      style={{ height: '32px', fontSize: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '0 12px', fontWeight: 700 }}
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