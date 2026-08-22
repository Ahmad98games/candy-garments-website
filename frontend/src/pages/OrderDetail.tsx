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
    Copy 
} from 'lucide-react';
import './OrderDetail.css';

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
            <div className="noise-layer" />
            
            <div className="container">
                {/* Header */}
                <div className="order-header-magnum">
                    <div className="header-left">
                        <Link to="/profile" className="back-link">
                            <ArrowLeft size={16} /> Back
                        </Link>
                        <div className="order-id-group" onClick={copyOrderId} title="Click to Copy">
                            <h1>#{order.orderNumber || order._id.slice(-6).toUpperCase()}</h1>
                            <Copy size={16} className="copy-icon" />
                        </div>
                        <span className="order-date">
                            {new Date(order.createdAt).toLocaleDateString(undefined, { 
                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                        </span>
                    </div>
                    <div className={`status-badge-lg ${order.status}`}>
                        {order.status}
                    </div>
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
                                        <span className="step-time">{new Date(order.createdAt).toLocaleTimeString()}</span>
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
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="manifest-item">
                                        <div className="item-thumb">
                                            <img src={item.image || '/placeholder.png'} alt={item.name} />
                                        </div>
                                        <div className="item-meta">
                                            <h4>{item.name}</h4>
                                            <span className="item-qty">Qty: {item.quantity}</span>
                                        </div>
                                        <div className="item-cost">
                                            PKR {(item.price * item.quantity).toLocaleString()}
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
                                <span>PKR {order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="summary-row">
                                <span>Shipping</span>
                                <span>PKR {order.shippingCost.toLocaleString()}</span>
                            </div>
                            <div className="summary-divider"></div>
                            <div className="summary-row total">
                                <span>Total</span>
                                <span className="total-value">PKR {order.total.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="panel details-panel">
                            <div className="detail-group">
                                <h4 className="detail-header"><MapPin size={16} /> Shipping To</h4>
                                <p>{order.shippingAddress.name}</p>
                                <p className="text-muted">{order.shippingAddress.address}</p>
                                <p className="text-muted">
                                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                                </p>
                                <p className="text-muted">{order.shippingAddress.phone}</p>
                            </div>
                            
                            <div className="detail-divider"></div>

                            <div className="detail-group">
                                <h4 className="detail-header"><CreditCard size={16} /> Payment</h4>
                                <p className="payment-badge">{order.paymentMethod.replace(/_/g, ' ')}</p>
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
        </div>
    );
}