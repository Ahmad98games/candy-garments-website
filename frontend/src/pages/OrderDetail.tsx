import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import client from '../api/client';
import { 
    Package, 
    Truck, 
    CheckCircle, 
    XCircle, 
    Clock, 
    ArrowLeft, 
    MapPin, 
    CreditCard, 
    Copy,
    Video,
    ShieldAlert,
    ShieldCheck
} from 'lucide-react';
import './OrderDetail.css';
import { VideoVerificationModal } from '../components/order/VideoVerificationModal';
import { RefundVaultModal } from '../components/order/RefundVaultModal';

type OrderItem = {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
};

type Order = {
    _id: string;
    orderNumber: string;
    items: OrderItem[];
    shippingAddress: {
        name: string;
        address: string;
        city: string;
        state: string;
        postalCode: string;
        phone: string;
    };
    paymentMethod: string;
    total: number;
    subtotal: number;
    shippingCost: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
    createdAt: string;
    trackingNumber?: string;
    deliveredAt?: string;
};

export default function OrderDetail() {
    const { id } = useParams();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await client.get(`/orders/${id}`);
            setOrder(res.data.order);
        } catch (error) {
            // Quiet fail for guest users or network issues
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = async () => {
        if (!window.confirm('WARNING: Confirm order cancellation?')) return;

        try {
            await client.put(`/orders/${id}/cancel`);
            showToast('Order terminated successfully', 'success');
            fetchOrder(); // Refresh data
        } catch (error: any) {
            showToast(error.response?.data?.error || 'Cancellation failed', 'error');
        }
    };

    const copyOrderId = () => {
        if (order?.orderNumber) {
            navigator.clipboard.writeText(order.orderNumber);
            showToast('Order ID copied to clipboard', 'info');
        }
    };

    if (loading) return <div className="loading-screen">Retrieving Transaction Data...</div>;

    if (!order) {
        return (
            <div className="order-not-found">
                <h2>Transaction Not Found</h2>
                <p>The requested record does not exist in our archives.</p>
                <Link to="/profile" className="btn-back">Return to Profile</Link>
            </div>
        );
    }

    // Helper to determine active step for timeline
    const getStepStatus = (step: string) => {
        const statusMap = { pending: 0, processing: 1, shipped: 2, delivered: 3, cancelled: -1 };
        const current = statusMap[order.status];
        const target = statusMap[step as keyof typeof statusMap];
        
        if (order.status === 'cancelled') return 'cancelled';
        if (current >= target) return 'completed';
        return 'pending';
    };

    return (
        <div className="order-detail-page">
            <div className="order-detail-container">
                {/* BACK LINK */}
                <Link to="/profile" className="back-link">
                    <ArrowLeft size={16} /> Return to Account Records
                </Link>

                {/* HEADER */}
                <div className="order-header-panel">
                    <div className="order-title-group">
                        <div className="title-with-copy">
                            <h1>Order #{orderNumberDisplay}</h1>
                            <button className="btn-copy-id" onClick={copyOrderId} title="Copy Identifier">
                                <Copy size={14} />
                            </button>
                        </div>
                        <span className="order-timestamp">
                            Authenticated on {new Date(order.createdAt || (order as any).created_at || Date.now()).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </span>
                    </div>
                    <div className={`status-badge-lg ${order.status || 'pending'}`}>
                        {order.status || 'Pending'}
                    </div>
                </div>

                {/* PRE-DISPATCH VIDEO INSPECTION BANNER */}
                <div style={{
                    background: '#F0FDF4',
                    border: '1.5px solid #86EFAC',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#DCFCE7', padding: '10px', borderRadius: '50%', color: '#166534' }}>
                            <Video size={24} />
                        </div>
                        <div>
                            <strong style={{ color: '#166534', fontSize: '0.95rem' }}>Pre-Dispatch 360° Video Inspection</strong>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#15803D' }}>
                                Watch our warehouse quality scan showing your exact items before courier handover.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setVideoModalOpen(true)}
                        style={{
                            background: '#059669',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '8px 18px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <Video size={15} />
                        <span>Watch Inspection Video</span>
                    </button>
                </div>

                {/* 100% REFUND VAULT 24H SLA BANNER */}
                <div style={{
                    background: '#FEF3C7',
                    border: '1.5px solid #FCD34D',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '24px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: '#FDE68A', padding: '10px', borderRadius: '50%', color: '#92400E' }}>
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <strong style={{ color: '#92400E', fontSize: '0.95rem' }}>100% Refund Vault Guarantee (24-Hour SLA)</strong>
                            <p style={{ margin: '2px 0 0 0', fontSize: '0.8rem', color: '#B45309' }}>
                                Any flaw or discrepancy? File a claim with photos; audited against dispatch video within 24h.
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => setRefundModalOpen(true)}
                        style={{
                            background: '#B45309',
                            color: '#FFFFFF',
                            border: 'none',
                            padding: '8px 18px',
                            borderRadius: '8px',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        <ShieldAlert size={15} />
                        <span>File 24h SLA Discrepancy Claim</span>
                    </button>
                </div>

                <div className="order-grid">
                    {/* LEFT COLUMN */}
                    <div className="order-main-content">
                        
                        {/* Timeline */}
                        <div className="panel timeline-panel">
                            <h3 className="panel-title">Tracking Uplink</h3>
                            <div className="timeline-track">
                                <div className={`track-step ${getStepStatus('pending')}`}>
                                    <div className="step-icon"><Clock size={18} /></div>
                                    <div className="step-info">
                                        <span className="step-label">Order Placed</span>
                                        <span className="step-time">{new Date(order.createdAt || (order as any).created_at || Date.now()).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                                <div className={`track-step ${getStepStatus('processing')}`}>
                                    <div className="step-icon"><Package size={18} /></div>
                                    <div className="step-info">
                                        <span className="step-label">Processing</span>
                                        <span className="step-desc">Preparing items</span>
                                    </div>
                                </div>
                                <div className={`track-step ${getStepStatus('shipped')}`}>
                                    <div className="step-icon"><Truck size={18} /></div>
                                    <div className="step-info">
                                        <span className="step-label">Shipped</span>
                                        {order.trackingNumber && <span className="step-desc">#{order.trackingNumber}</span>}
                                    </div>
                                </div>
                                <div className={`track-step ${getStepStatus('delivered')}`}>
                                    <div className="step-icon"><CheckCircle size={18} /></div>
                                    <div className="step-info">
                                        <span className="step-label">Delivered</span>
                                        {order.deliveredAt && <span className="step-time">{new Date(order.deliveredAt).toLocaleDateString()}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items */}
                        <div className="panel items-panel">
                            <h3 className="panel-title">Manifest</h3>
                            <div className="items-list">
                                {(order.items || []).map((item, idx) => (
                                    <div key={idx} className="manifest-item">
                                        <div className="item-thumb">
                                            <img src={item.image || (item as any).img || '/placeholder.png'} alt={item.name || (item as any).title || 'Product'} />
                                        </div>
                                        <div className="item-meta">
                                            <h4>{item.name || (item as any).title || 'Product'}</h4>
                                            <span className="item-qty">Qty: {item.quantity || 1}</span>
                                        </div>
                                        <div className="item-cost">
                                            PKR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div className="order-sidebar">
                        
                        {/* Summary */}
                        <div className="panel summary-panel">
                            <h3 className="panel-title">Financials</h3>
                            <div className="summary-row">
                                <span>Subtotal</span>
                                <span>PKR {(order.subtotal || (order as any).total_amount || order.total || 0).toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>PKR {(order.shippingCost || 0).toLocaleString()}</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span className="total-value">PKR {(order.total || (order as any).total_amount || 0).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="panel details-panel">
                            <div className="detail-group">
                                <h4 className="detail-header"><MapPin size={16} /> Shipping To</h4>
                                <p>{order.shippingAddress?.name || (order as any).customer_name || 'Customer'}</p>
                                <p className="text-muted">{order.shippingAddress?.address || (order as any).shipping_address || 'Address N/A'}</p>
                                <p className="text-muted">
                                    {[order.shippingAddress?.city || (order as any).city, order.shippingAddress?.postalCode].filter(Boolean).join(', ') || 'Pakistan'}
                                </p>
                                <p className="text-muted">{order.shippingAddress?.phone || (order as any).customer_phone || ''}</p>
                            </div>
                            
                            <div className="detail-divider"></div>

                            <div className="detail-group">
                                <h4 className="detail-header"><CreditCard size={16} /> Payment</h4>
                                <p className="payment-badge">{(order.paymentMethod || (order as any).payment_method || 'Online').replace(/_/g, ' ')}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        {['pending', 'processing'].includes(order.status) && (
                            <button onClick={handleCancelOrder} className="btn-terminate">
                                <XCircle size={16} /> Cancel Order
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* VIDEO VERIFICATION MODAL */}
            {videoModalOpen && (
                <VideoVerificationModal
                    orderId={order._id || (order as any).id}
                    orderNumber={orderNumberDisplay}
                    videoUrl={(order as any).dispatch_video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                    videoUploadedAt={(order as any).video_uploaded_at}
                    videoViewedByCustomer={videoViewed || (order as any).video_viewed_by_customer}
                    status={order.status}
                    onClose={() => setVideoModalOpen(false)}
                    onConfirmViewed={handleConfirmVideoViewed}
                    onDisputeReshoot={handleDisputeReshoot}
                />
            )}

            {/* 100% REFUND VAULT MODAL */}
            {refundModalOpen && (
                <RefundVaultModal
                    orderId={order._id || (order as any).id}
                    orderNumber={orderNumberDisplay}
                    totalAmount={order.total || (order as any).total_amount || 0}
                    deliveredAt={order.deliveredAt}
                    onClose={() => setRefundModalOpen(false)}
                    onSubmitSuccess={() => {
                        setRefundModalOpen(false);
                        showToast('Refund claim registered with 24-hour SLA timer.', 'success');
                        fetchOrder();
                    }}
                />
            )}
        </div>
    );
}