import React, { useState, useEffect } from 'react';
import { ShieldCheck, Zap, Truck, Check, AlertTriangle, CreditCard, ArrowRight, Info, Copy } from 'lucide-react';
import './PaymentMethodSelector.css';

export interface DiscountRuleData {
  id: string;
  code: string;
  label: string;
  percentOff?: number | null;
  flatAmountOff?: number | null;
  appliesTo: string[];
  isActive: boolean;
}

interface PaymentMethodSelectorProps {
  subtotal: number;
  baseShippingFee?: number;
  trustTier: 'UNVERIFIED' | 'STANDARD' | 'TRUSTED' | 'RESTRICTED';
  onPaymentMethodChange: (data: {
    paymentType: 'PREPAID_RAAST' | 'PREPAID_WALLET' | 'PREPAID_CARD' | 'COD_WITH_DEPOSIT';
    discountRuleId?: string;
    discountApplied: number;
    shippingFee: number;
    depositPaid: number;
    finalTotal: number;
  }) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  subtotal,
  baseShippingFee = 250,
  trustTier,
  onPaymentMethodChange,
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'PREPAID' | 'COD'>('PREPAID');
  const [prepaidChannel, setPrepaidChannel] = useState<'RAAST' | 'CARD' | 'BANK'>('RAAST');
  const [discountRule, setDiscountRule] = useState<DiscountRuleData>({
    id: 'dr_prepaid_auto',
    code: 'PREPAID_AUTO',
    label: 'Instant Payment Discount',
    percentOff: 10,
    appliesTo: ['PREPAID_RAAST', 'PREPAID_WALLET', 'PREPAID_CARD'],
    isActive: true,
  });

  const [copiedAcc, setCopiedAcc] = useState<string | null>(null);

  // Fetch active discount rule from API if available
  useEffect(() => {
    async function fetchRules() {
      try {
        const res = await fetch('/api/discount-rules/active');
        if (res.ok) {
          const data = await res.json();
          if (data?.rule) {
            setDiscountRule(data.rule);
          }
        }
      } catch {
        // Fallback to 10% default
      }
    }
    fetchRules();
  }, []);

  // Compute calculations dynamically from DiscountRule
  const prepaidDiscount = React.useMemo(() => {
    if (!discountRule || !discountRule.isActive) return 0;
    if (discountRule.percentOff) {
      return Math.round((subtotal * discountRule.percentOff) / 100);
    }
    if (discountRule.flatAmountOff) {
      return discountRule.flatAmountOff;
    }
    return Math.round(subtotal * 0.1);
  }, [subtotal, discountRule]);

  // Shipping fee is 0 on Prepaid as incentive, standard on COD
  const prepaidShipping = 0;
  const codShipping = baseShippingFee;
  const codDepositRequired = 500; // Rs. 500 commitment deposit to deter fake orders

  const prepaidTotal = Math.max(0, subtotal - prepaidDiscount + prepaidShipping);
  const codTotal = subtotal + codShipping;
  const netSavings = prepaidDiscount + codShipping;

  // Propagate state upwards
  useEffect(() => {
    if (selectedMethod === 'PREPAID') {
      const type = prepaidChannel === 'CARD' 
        ? 'PREPAID_CARD' 
        : prepaidChannel === 'RAAST' 
        ? 'PREPAID_RAAST' 
        : 'PREPAID_WALLET';

      onPaymentMethodChange({
        paymentType: type,
        discountRuleId: discountRule.id,
        discountApplied: prepaidDiscount,
        shippingFee: prepaidShipping,
        depositPaid: 0,
        finalTotal: prepaidTotal,
      });
    } else {
      onPaymentMethodChange({
        paymentType: 'COD_WITH_DEPOSIT',
        discountRuleId: undefined,
        discountApplied: 0,
        shippingFee: codShipping,
        depositPaid: codDepositRequired,
        finalTotal: codTotal,
      });
    }
  }, [selectedMethod, prepaidChannel, prepaidDiscount, prepaidTotal, codTotal, discountRule]);

  const handleCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedAcc(label);
    setTimeout(() => setCopiedAcc(null), 2500);
  };

  const isCodRestricted = trustTier === 'RESTRICTED';

  return (
    <div className="payment-selector-wrapper">
      <div className="payment-selector-header">
        <h3 className="section-title">2. Select Payment Method</h3>
        <p className="section-desc">
          Choose an instant payment method to lock in factory rates, zero shipping fee, and priority TCS courier dispatch.
        </p>
      </div>

      {/* REAL-TIME SAVINGS BADGE */}
      {selectedMethod === 'PREPAID' && (
        <div className="savings-highlight-badge animate-bounce-subtle">
          <Zap size={16} className="text-amber-500" />
          <span>
            You are saving <strong>Rs. {netSavings.toLocaleString()}</strong> ({discountRule.percentOff || 10}% Instant Discount + Free Express TCS Shipping)!
          </span>
        </div>
      )}

      {/* PAYMENT CARDS GRID */}
      <div className="payment-cards-grid">
        {/* CARD 1: PREPAID (RECOMMENDED) */}
        <div
          className={`payment-choice-card ${selectedMethod === 'PREPAID' ? 'selected' : ''}`}
          onClick={() => setSelectedMethod('PREPAID')}
        >
          <div className="card-top-tag">
            <span className="pill-recommended">MOST POPULAR • 10% OFF</span>
          </div>

          <div className="card-header-row">
            <div className="radio-circle">
              {selectedMethod === 'PREPAID' && <div className="radio-inner" />}
            </div>
            <div className="method-headline">
              <h4>Instant Payment (Raast / Bank / Card)</h4>
              <span className="price-tag">Rs. {prepaidTotal.toLocaleString()}</span>
            </div>
          </div>

          <p className="card-subtext">
            100% verified order clearance. Direct bank transfer, Raast P2M QR, or Safepay/PayFast hosted card tokenization.
          </p>

          <div className="card-features-list">
            <div className="feature-item positive">
              <Check size={14} />
              <span>{discountRule.label || '10% Instant Order Discount'} (-Rs. {prepaidDiscount.toLocaleString()})</span>
            </div>
            <div className="feature-item positive">
              <Check size={14} />
              <span>FREE TCS Express Courier Shipping (Rs. 0 vs Rs. {baseShippingFee})</span>
            </div>
            <div className="feature-item positive">
              <Check size={14} />
              <span>Pre-Dispatch Video Inspection recorded and sent via WhatsApp</span>
            </div>
          </div>

          {selectedMethod === 'PREPAID' && (
            <div className="prepaid-channels-subselector" onClick={(e) => e.stopPropagation()}>
              <span className="channel-label">Select Instant Gateway:</span>
              <div className="channel-tabs">
                <button
                  type="button"
                  className={`channel-tab ${prepaidChannel === 'RAAST' ? 'active' : ''}`}
                  onClick={() => setPrepaidChannel('RAAST')}
                >
                  Raast Instant
                </button>
                <button
                  type="button"
                  className={`channel-tab ${prepaidChannel === 'BANK' ? 'active' : ''}`}
                  onClick={() => setPrepaidChannel('BANK')}
                >
                  Direct Bank
                </button>
                <button
                  type="button"
                  className={`channel-tab ${prepaidChannel === 'CARD' ? 'active' : ''}`}
                  onClick={() => setPrepaidChannel('CARD')}
                >
                  Card (Safepay)
                </button>
              </div>

              {/* RAAST DETAILS */}
              {prepaidChannel === 'RAAST' && (
                <div className="gateway-details-box animate-fade-in">
                  <div className="box-row">
                    <span>Raast IBAN:</span>
                    <code>PK53FAYS3431301000002051</code>
                    <button type="button" onClick={() => handleCopy('PK53FAYS3431301000002051', 'raast')} className="copy-btn">
                      {copiedAcc === 'raast' ? 'Copied!' : <Copy size={13} />}
                    </button>
                  </div>
                  <div className="box-row">
                    <span>Account Title:</span>
                    <strong>Candy Kids Collection</strong>
                  </div>
                </div>
              )}

              {/* BANK DETAILS */}
              {prepaidChannel === 'BANK' && (
                <div className="gateway-details-box animate-fade-in">
                  <div className="box-row">
                    <span>Bank:</span>
                    <strong>Faysal Bank Limited</strong>
                  </div>
                  <div className="box-row">
                    <span>A/C Number:</span>
                    <code>3431301000002051</code>
                    <button type="button" onClick={() => handleCopy('3431301000002051', 'bank')} className="copy-btn">
                      {copiedAcc === 'bank' ? 'Copied!' : <Copy size={13} />}
                    </button>
                  </div>
                  <div className="box-row">
                    <span>Title:</span>
                    <strong>Candy Kids Collection</strong>
                  </div>
                </div>
              )}

              {/* CARD TOKENIZED IFRAME NOTICE */}
              {prepaidChannel === 'CARD' && (
                <div className="gateway-details-box animate-fade-in">
                  <div className="card-pci-notice">
                    <CreditCard size={18} className="text-emerald-600" />
                    <div>
                      <strong>PCI-DSS Compliant Hosted Checkout:</strong>
                      <p>Card credentials are processed directly via Safepay / PayFast tokenized gateway. Sensitive card data never touches Omnora servers.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CARD 2: COD WITH DEPOSIT (OR RESTRICTED NOTICE) */}
        {!isCodRestricted ? (
          <div
            className={`payment-choice-card ${selectedMethod === 'COD' ? 'selected' : ''}`}
            onClick={() => setSelectedMethod('COD')}
          >
            <div className="card-top-tag">
              <span className="pill-standard">STANDARD • ADVANCE DEPOSIT</span>
            </div>

            <div className="card-header-row">
              <div className="radio-circle">
                {selectedMethod === 'COD' && <div className="radio-inner" />}
              </div>
              <div className="method-headline">
                <h4>Cash on Delivery (With Deposit)</h4>
                <span className="price-tag">Rs. {codTotal.toLocaleString()}</span>
              </div>
            </div>

            <p className="card-subtext">
              Requires a Rs. {codDepositRequired} advance courier confirmation deposit via Raast/EasyPaisa to prevent fake bookings. The remainder is paid to the TCS rider upon delivery.
            </p>

            <div className="card-features-list">
              <div className="feature-item negative">
                <span className="dash-icon">—</span>
                <span>No instant 10% discount applied</span>
              </div>
              <div className="feature-item negative">
                <span className="dash-icon">—</span>
                <span>Standard TCS shipping fee: Rs. {codShipping}</span>
              </div>
              <div className="feature-item info">
                <Info size={14} />
                <span>Rs. {codDepositRequired} deposit credited towards final balance</span>
              </div>
            </div>
          </div>
        ) : (
          /* RESTRICTED ACCOUNT NOTICE: COD IS COMPLETELY ABSENT */
          <div className="payment-restricted-card">
            <div className="restricted-content">
              <AlertTriangle size={24} className="text-amber-600" />
              <div>
                <h5>Cash on Delivery Unavailable</h5>
                <p>
                  Cash on Delivery isn't available for this account due to previous delivery refusals — instant payment options remain available with the same 10% discount.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SUMMARY BAR */}
      <div className="payment-summary-footer">
        <div className="summary-left">
          <span>Final Payable Amount:</span>
          <strong>Rs. {(selectedMethod === 'PREPAID' ? prepaidTotal : codTotal).toLocaleString()}</strong>
        </div>
        <div className="summary-right">
          <ShieldCheck size={16} className="text-emerald-500" />
          <span>Idempotent Webhook Guarded • 100% Refund SLA</span>
        </div>
      </div>
    </div>
  );
};
