import { useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { CheckCircle, MessageCircle, Copy, Check, ArrowLeft, ShieldCheck, Building2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { Order } from '../lib/supabase';
import './OrderConfirmation.css';

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { showToast } = useToast();

  const [order] = useState<Order | null>(location.state?.order || null);
  const [copiedAcc1, setCopiedAcc1] = useState(false);
  const [copiedAcc2, setCopiedAcc2] = useState(false);

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

  const copyOrderId = () => {
    const targetId = order?.id || id || '';
    navigator.clipboard.writeText(targetId);
    showToast('Order Reference ID copied to clipboard', 'success');
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

  const openWhatsAppConfirmation = () => {
    const refId = order?.id || id || 'N/A';
    const name = order?.customer_name || 'Customer';
    const amount = order?.total_amount ? `PKR ${order.total_amount.toLocaleString()}` : '';
    
    let itemsText = '';
    if (order?.items && order.items.length > 0) {
      itemsText = '%0AItems:%0A' + order.items.map(i => `- ${i.title} (${i.article_no || 'N/A'}) [Color: ${i.color || 'Standard'}, Size: ${i.size || 'N/A'}] x ${i.quantity}`).join('%0A');
    }

    const text = `Assalamu Alaikum Candy Kids! I have completed advance bank transfer for Order #${refId} (${name}). Total: ${amount}.${itemsText}%0AAttached is my payment transfer receipt/screenshot for TCS dispatch confirmation.`;
    const url = `https://wa.me/923311498773?text=${text}`;
    window.open(url, '_blank');
  };

  const displayId = order?.id || id || 'CONFIRMED';
  const displayTotal = order?.total_amount || 0;

  return (
    <div className="confirmation-page" style={{ backgroundColor: 'var(--bg-canvas)', color: 'var(--text-primary)', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* HERO HEADER - Matches Cart & Checkout Pages */}
      <header className="cart-hero">
        <div className="cart-hero-content animate-fade-in-up">
          <h1 className="cart-title">Order Recorded Successfully</h1>
          <p className="cart-subtitle">
            Ref #{displayId} • Transfer Advance Bank Payment to Confirm TCS Dispatch
          </p>
        </div>
      </header>

      <div className="cart-container" style={{ maxWidth: '640px' }}>
        <div className="industrial-card" style={{ background: 'var(--bg-card)', padding: '28px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
          
          {/* SUCCESS HEADER */}
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ width: '56px', height: '56px', background: 'rgba(15, 157, 88, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px auto', color: 'var(--accent-emerald)', border: '1px solid rgba(15, 157, 88, 0.3)' }}>
              <CheckCircle size={32} strokeWidth={2.5} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>Order Reference Registered</h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Kindly transfer the total amount to either Faysal Bank account below and send receipt on WhatsApp.
            </p>
          </div>

          {/* ORDER DETAILS GRID */}
          <div style={{ background: 'var(--bg-surface)', padding: '16px', borderRadius: 'var(--radius-md)', marginBottom: '20px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Order Reference</span>
              <div onClick={copyOrderId} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: 700, color: 'var(--text-primary)' }}>
                <span className="font-mono" style={{ fontSize: '13px' }}>{displayId}</span>
                <Copy size={13} style={{ color: 'var(--accent-emerald)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Amount Payable</span>
              <span className="font-mono" style={{ fontSize: '18px', fontWeight: 900, color: 'var(--accent-red)' }}>
                PKR {displayTotal.toLocaleString()}
              </span>
            </div>
          </div>

          {/* FAYSAL BANK ACCOUNTS SECTION */}
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Building2 size={16} style={{ color: 'var(--accent-emerald)' }} />
              Official Faysal Bank Payment Accounts
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              
              {/* ACC 1 */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderLeft: '4px solid var(--accent-emerald)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '4px' }}>
                  <span>Faysal Bank • Account 1</span>
                  <span>Official Business</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {BANK_ACCOUNT_1.accountTitle}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-muted)' }}>
                  <span className="font-mono" style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{BANK_ACCOUNT_1.accountNumber}</span>
                  <button
                    onClick={() => handleCopyAcc(BANK_ACCOUNT_1.accountNumber, 1)}
                    style={{ background: 'var(--accent-emerald)', color: '#FFF', border: 'none', borderRadius: 'var(--radius-sm)', padding: '4px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedAcc1 ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
              </div>

              {/* ACC 2 */}
              <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderLeft: '4px solid var(--accent-emerald)', borderRadius: 'var(--radius-md)', padding: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '4px' }}>
                  <span>Faysal Bank • Account 2</span>
                  <span>Verified Personal</span>
                </div>
                <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  {BANK_ACCOUNT_2.accountTitle}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-subtle)', padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: '1px dashed var(--border-muted)' }}>
                  <span className="font-mono" style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{BANK_ACCOUNT_2.accountNumber}</span>
                  <button
                    onClick={() => handleCopyAcc(BANK_ACCOUNT_2.accountNumber, 2)}
                    style={{ background: 'var(--accent-emerald)', color: '#FFF', border: 'none', borderRadius: 'var(--radius-sm)', padding: '4px 10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    {copiedAcc2 ? <><Check size={12} /> Copied!</> : <><Copy size={12} /> Copy</>}
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* INSTRUCTION & WHATSAPP ACTION */}
          <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 'var(--radius-md)', padding: '14px', marginBottom: '20px', fontSize: '13px', color: '#1E40AF', lineHeight: 1.6 }}>
            📌 <strong>Instructions:</strong> Kindly transfer the total order amount to either of the official accounts above and share the payment receipt / screenshot via WhatsApp to confirm your TCS Express Courier dispatch.
          </div>

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <button
              onClick={openWhatsAppConfirmation}
              className="btn btn-whatsapp"
              style={{
                width: '100%',
                height: '48px',
                background: '#25D366',
                borderColor: '#25D366',
                fontSize: '14px',
                fontWeight: 700,
              }}
            >
              <MessageCircle size={18} />
              <span>Send Payment Receipt on WhatsApp</span>
            </button>
          </div>

          {/* SECURITY BADGE */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            <ShieldCheck size={14} />
            <span>Real-Time Bank Transfer Verification Protocol</span>
          </div>

          {/* BACK TO HOME */}
          <div style={{ textAlign: 'center' }}>
            <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '13px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <ArrowLeft size={14} /> Return to Storefront
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}