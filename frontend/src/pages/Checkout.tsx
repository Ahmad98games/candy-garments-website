import { useEffect, useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createOrder, Order } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import { useScrollReveal } from '../hooks/useScrollReveal';
import { ShoppingBag, Copy, Check, AlertTriangle, Building2, Send, Truck, ArrowLeft } from 'lucide-react';
import './Checkout.css';
import { calculateOrderTotal } from '../utils/currencyEngine';
import { FALLBACK_IMAGE } from '../constants';

type CartItem = { id: string; name: string; price: number; image?: string; quantity: number; articleNo?: string; size?: string };

export default function Checkout() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const contentRef = useScrollReveal();

  const [items, setItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [copiedAcc1, setCopiedAcc1] = useState(false);
  const [copiedAcc2, setCopiedAcc2] = useState(false);

  const [form, setForm] = useState({
    customerName: '',
    customerPhone: '',
    city: '',
    shippingAddress: '',
  });

  const BANK_ACCOUNT_1 = {
    bankName: 'Faysal Bank',
    accountTitle: 'Candy Kids Collection',
    accountNumber: '3431301000002051',
  };

  const BANK_ACCOUNT_2 = {
    bankName: 'Faysal Bank',
    accountTitle: 'FAKHAR Ahmad Ali Bukhari',
    accountNumber: '3431301000006022',
  };

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('cart') || '[]') as CartItem[];
    setItems(data);
    if (data.length === 0) {
      navigate('/cart');
    }
  }, [navigate]);

  const orderCalculations = useMemo(() => {
    return calculateOrderTotal({
      items: items.map(i => ({ price: i.price, quantity: i.quantity })),
      deliveryFee: 250,
    });
  }, [items]);

  const subtotal = orderCalculations.subtotal;
  const shippingCost = orderCalculations.deliveryFee;
  const totalAmount = orderCalculations.grandTotal;
  const totalItems = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCopyAcc = (accountNum: string, accIndex: 1 | 2) => {
    navigator.clipboard.writeText(accountNum);
    if (accIndex === 1) {
      setCopiedAcc1(true);
      setTimeout(() => setCopiedAcc1(false), 2500);
    } else {
      setCopiedAcc2(true);
      setTimeout(() => setCopiedAcc2(false), 2500);
    }
    showToast('Account Number Copied!', 'success');
  };

  const validateForm = () => {
    if (!form.customerName.trim()) return 'Customer Name is required';
    if (!form.customerPhone.trim()) return 'Phone Number is required';
    if (!/^[0-9+\s-]{10,15}$/.test(form.customerPhone.trim())) return 'Please enter a valid Pakistani phone number';
    if (!form.city.trim()) return 'City is required';
    if (!form.shippingAddress.trim()) return 'Shipping Address is required';
    return null;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const error = validateForm();
    if (error) {
      showToast(error, 'error');
      return;
    }

    setSubmitting(true);

    try {
      const orderPayload: Omit<Order, 'id' | 'created_at'> = {
        customer_name: form.customerName,
        customer_phone: form.customerPhone,
        shipping_address: form.shippingAddress,
        city: form.city,
        items: items.map((i) => ({
          id: i.id,
          title: i.name,
          article_no: i.articleNo || 'N/A',
          quantity: i.quantity,
          price: i.price,
          image: i.image,
        })),
        total_amount: totalAmount,
        payment_method: 'WhatsApp (Advance Bank Transfer)',
        status: 'Pending',
      };

      const result = await createOrder(orderPayload);

      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cart-updated'));
      showToast('Order recorded! Transfer payment & send screenshot on WhatsApp...', 'success');

      navigate(`/order-confirmation/${result?.id || 'SUCCESS'}`, {
        state: { order: result },
      });
    } catch (err) {
      console.error('Checkout error:', err);
      showToast('Order placement failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = FALLBACK_IMAGE;
    e.currentTarget.onerror = null;
  };

  return (
    <div className="checkout-page">
      {/* HERO HEADER - Matches Home, OmnoraCollection, & Product Page Aesthetic */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', paddingTop: '10px' }}>
        <span style={{ backgroundColor: '#FEF2F2', color: '#E52535', fontSize: '0.75rem', fontWeight: 800, padding: '5px 16px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.15em', display: 'inline-block', marginBottom: '0.75rem', boxShadow: '0 2px 8px rgba(229,37,53,0.1)' }}>
          ORDER CHECKOUT
        </span>
        <h1 style={{ fontFamily: "'Outfit', 'Inter', sans-serif", fontSize: 'clamp(2rem, 5vw, 2.75rem)', fontWeight: 900, color: '#111827', margin: '0 0 0.5rem 0', letterSpacing: '-0.02em' }}>
          Checkout
        </h1>
        <p style={{ fontSize: '0.95rem', color: '#6B7280', fontWeight: 600 }}>
          100% Advance Bank Transfer • Nationwide Dispatch via TCS Express Courier
        </p>
      </div>

      <div className="checkout-container" ref={contentRef}>
        {/* FIXED PRICE & TCS ADVANCE POLICY BANNER - Matches Cart Policy Banner */}
        <div className="checkout-policy-banner">
          <AlertTriangle className="checkout-policy-banner-icon" size={22} />
          <div className="checkout-policy-banner-content">
            <span className="checkout-policy-banner-title">⚠️ Strict Advance Payment & Fixed-Price Policy</span>
            <strong>No Cash on Delivery (COD) available.</strong> All articles are sold at firm, fixed factory rates. Orders are strictly dispatched nationwide exclusively via <strong>TCS Express Courier</strong> upon receipt of 100% advance bank payment to our official Faysal Bank accounts.
          </div>
        </div>

        <div className="checkout-content">
          {/* CHECKOUT FORM CARD */}
          <div className="checkout-card animate-fade-in-up">
            <h2 className="section-heading">
              1. Customer & Delivery Address
            </h2>

            <form onSubmit={handlePlaceOrder}>
              <div className="form-field">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={form.customerName}
                  onChange={handleInputChange}
                  placeholder="e.g. Ahmad Mahboob"
                  required
                  className="form-input-text"
                />
              </div>

              <div className="form-field">
                <label className="form-label">Phone / WhatsApp Number (Required) *</label>
                <input
                  type="tel"
                  name="customerPhone"
                  value={form.customerPhone}
                  onChange={handleInputChange}
                  placeholder="e.g. 0300 1234567"
                  required
                  className="form-input-text font-mono"
                />
              </div>

              <div className="form-field">
                <label className="form-label">City *</label>
                <input
                  type="text"
                  name="city"
                  value={form.city}
                  onChange={handleInputChange}
                  placeholder="e.g. Lahore, Karachi, Islamabad"
                  required
                  className="form-input-text"
                />
              </div>

              <div className="form-field" style={{ marginBottom: '24px' }}>
                <label className="form-label">Full Delivery Address (TCS Parcel Courier) *</label>
                <textarea
                  name="shippingAddress"
                  value={form.shippingAddress}
                  onChange={handleInputChange}
                  placeholder="House/Plot No, Street, Sector/Area..."
                  rows={3}
                  required
                  className="form-input-text"
                />
              </div>

              {/* TCS DELIVERY NOTICE */}
              <div className="tcs-delivery-box">
                <Truck className="tcs-delivery-box-icon" size={22} />
                <div className="tcs-delivery-box-text">
                  <span className="tcs-delivery-box-title">🚚 Nationwide Dispatch via TCS Express Courier</span>
                  Your parcel will be dispatched via <strong>TCS Express Courier</strong> immediately after 100% advance bank payment verification. Delivery takes 2–3 working days across Pakistan.
                </div>
              </div>

              <h2 className="section-heading" style={{ paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                <Building2 size={20} style={{ color: 'var(--accent-emerald)' }} />
                2. Official Faysal Bank Accounts (Advance Payment Only)
              </h2>

              {/* DUAL VERIFIED FAYSAL BANK ACCOUNTS */}
              <div className="bank-accounts-container">
                {/* ACCOUNT 1 CARD */}
                <div className="bank-account-card">
                  <div className="bank-card-header">
                    <span className="bank-name-badge">Faysal Bank • Account 1</span>
                    <span className="account-title-label">Official Business</span>
                  </div>
                  <div className="account-title-value">{BANK_ACCOUNT_1.accountTitle}</div>
                  <div className="account-number-row">
                    <span className="account-number-text">{BANK_ACCOUNT_1.accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyAcc(BANK_ACCOUNT_1.accountNumber, 1)}
                      className={`copy-btn ${copiedAcc1 ? 'copied' : ''}`}
                    >
                      {copiedAcc1 ? (
                        <>
                          <Check size={14} /> Account Number Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy Number
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* ACCOUNT 2 CARD */}
                <div className="bank-account-card">
                  <div className="bank-card-header">
                    <span className="bank-name-badge">Faysal Bank • Account 2</span>
                    <span className="account-title-label">Verified Personal</span>
                  </div>
                  <div className="account-title-value">{BANK_ACCOUNT_2.accountTitle}</div>
                  <div className="account-number-row">
                    <span className="account-number-text">{BANK_ACCOUNT_2.accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopyAcc(BANK_ACCOUNT_2.accountNumber, 2)}
                      className={`copy-btn ${copiedAcc2 ? 'copied' : ''}`}
                    >
                      {copiedAcc2 ? (
                        <>
                          <Check size={14} /> Account Number Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={14} /> Copy Number
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* INSTRUCTIONS */}
              <div className="transfer-instructions-box">
                <p>
                  📌 <strong>Instructions:</strong> Kindly transfer the total order amount (<strong>PKR {totalAmount.toLocaleString()}</strong>) to either of the official accounts above and share the payment receipt / screenshot via WhatsApp to confirm your TCS dispatch.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary submit-order-btn"
              >
                <Send size={18} />
                {submitting ? 'Recording Order...' : 'Confirm Order & Send Payment Receipt on WhatsApp'}
              </button>
            </form>
          </div>

          {/* ORDER SUMMARY STICKY SIDEBAR CARD - Matches Cart Order Summary */}
          <div className="checkout-summary-card animate-fade-in-up">
            <h2 className="section-heading">
              <ShoppingBag size={20} />
              Order Summary ({totalItems} {totalItems === 1 ? 'Item' : 'Items'})
            </h2>

            <div className="summary-items-list">
              {items.map((item) => (
                <div key={item.id} className="summary-item-row">
                  <img
                    src={item.image || FALLBACK_IMAGE}
                    alt={item.name}
                    onError={handleImageError}
                    className="summary-item-img"
                  />
                  <div className="summary-item-info">
                    <div className="summary-item-title">{item.name}</div>
                    <div className="summary-item-meta">
                      Art: {item.articleNo || 'CK-01'} {item.size ? `• Size: ${item.size}` : ''} • Qty: {item.quantity}
                    </div>
                  </div>
                  <div className="summary-item-price">
                    PKR {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>PKR {subtotal.toLocaleString()}</span>
            </div>

            <div className="summary-row">
              <span>Nationwide TCS Shipping</span>
              <span>PKR {shippingCost.toLocaleString()}</span>
            </div>

            <div className="summary-total">
              <span>Total Payable</span>
              <span>PKR {totalAmount.toLocaleString()}</span>
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <Link
                to="/cart"
                style={{
                  color: 'var(--text-muted)',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <ArrowLeft size={14} /> Return to Shopping Bag
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}