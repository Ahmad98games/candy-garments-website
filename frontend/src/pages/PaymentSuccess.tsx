import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShoppingBag, Eye } from 'lucide-react';
import './PaymentSuccess.css';

export default function PaymentSuccess() {
    const [searchParams] = useSearchParams();
    const orderNumber = searchParams.get('order') || 'UNKNOWN';

    useEffect(() => {
        // Clear cart logic remains the same
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cart-updated'));
    }, []);

    return (
        <div className="payment-success-page">
            <div className="noise-layer" />
            
            <div className="success-container animate-scale-up">
                
                {/* Success Icon Animation */}
                <div className="success-icon-wrapper">
                    <div className="pulse-ring"></div>
                    <CheckCircle size={48} className="success-icon" strokeWidth={2.5} />
                </div>

                <h1 className="success-title">Transaction Verified</h1>
                <p className="success-message">
                    Your acquisition has been secured. <br />
                    Welcome to the sanctuary.
                </p>

                {/* Ticket / Order Info */}
                <div className="order-ticket">
                    <div className="ticket-row">
                        <span className="ticket-label">Order Reference</span>
                        <span className="ticket-value mono-text">#{orderNumber}</span>
                    </div>
                    <div className="ticket-divider"></div>
                    <div className="ticket-row">
                        <span className="ticket-label">Status</span>
                        <span className="status-badge-success">PROCESSING</span>
                    </div>
                </div>

                <p className="email-note">
                    A digital receipt has been transmitted to your inbox.
                </p>

                <div className="action-buttons">
                    <Link to={`/orders/${orderNumber}`} className="btn-primary-glow">
                        <Eye size={18} /> View Order Details
                    </Link>
                    <Link to="/collection" className="btn-ghost">
                        <ShoppingBag size={18} /> Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    );
}