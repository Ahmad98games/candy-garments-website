import React, { useState, useEffect } from 'react';
import {
  ShieldAlert, Clock, AlertTriangle, CheckCircle2, XCircle,
  Video, Image, DollarSign, RefreshCw, Send, FileText, Check
} from 'lucide-react';
import './AdminRefunds.css';

export interface AdminRefundRequest {
  id: string;
  orderId: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  reason: string;
  evidenceUrls: string[];
  dispatchVideoUrl?: string;
  status: 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'PAID_OUT';
  slaDeadline: string; // ISO string
  createdAt: string;
  reviewNotes?: string;
  payoutRef?: string;
}

export default function AdminRefunds() {
  const [requests, setRequests] = useState<AdminRefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<AdminRefundRequest | null>(null);

  // Review Action Modal state
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | 'PAYOUT' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [payoutRef, setPayoutRef] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/refunds');
      if (res.ok) {
        const data = await res.json();
        setRequests(data.refunds || []);
      } else {
        setRequests(generateMockRefunds());
      }
    } catch {
      setRequests(generateMockRefunds());
    } finally {
      setLoading(false);
    }
  };

  const generateMockRefunds = (): AdminRefundRequest[] => {
    const now = Date.now();
    return [
      {
        id: 'ref_001',
        orderId: 'ord_101',
        orderNumber: 1042,
        customerName: 'Fatima Tariq',
        customerPhone: '0300 8472910',
        totalAmount: 18500,
        reason: 'Sleeve cuff embroidery thread loose and 1.5 inch measurement variance on chest.',
        evidenceUrls: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600'],
        dispatchVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        status: 'UNDER_REVIEW',
        slaDeadline: new Date(now + 1.5 * 3600000).toISOString(), // 1.5 hours left -> ESCALATION ALERT!
        createdAt: new Date(now - 22.5 * 3600000).toISOString(),
      },
      {
        id: 'ref_002',
        orderId: 'ord_099',
        orderNumber: 1035,
        customerName: 'Sana Farooq',
        customerPhone: '0334 1122334',
        totalAmount: 22000,
        reason: 'Color tone mismatch: ordered emerald green, received olive shade.',
        evidenceUrls: ['https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600'],
        dispatchVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        status: 'REQUESTED',
        slaDeadline: new Date(now + 14 * 3600000).toISOString(), // 14 hours left
        createdAt: new Date(now - 10 * 3600000).toISOString(),
      },
      {
        id: 'ref_003',
        orderId: 'ord_088',
        orderNumber: 1020,
        customerName: 'Nadia Khan',
        customerPhone: '0322 7788990',
        totalAmount: 15400,
        reason: 'Minor sequin detached on dupatta border.',
        evidenceUrls: ['https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600'],
        dispatchVideoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        status: 'APPROVED',
        reviewNotes: 'Discrepancy verified against video. Refund approved pending Raast payout.',
        slaDeadline: new Date(now - 4 * 3600000).toISOString(),
        createdAt: new Date(now - 28 * 3600000).toISOString(),
      },
    ];
  };

  // Check if claim is within 2 hours of SLA deadline
  const isUrgentEscalation = (deadlineStr: string, status: string) => {
    if (status === 'APPROVED' || status === 'REJECTED' || status === 'PAID_OUT') return false;
    const diffMs = new Date(deadlineStr).getTime() - Date.now();
    return diffMs > 0 && diffMs <= 2 * 3600000;
  };

  const getRemainingTimeText = (deadlineStr: string) => {
    const diffMs = new Date(deadlineStr).getTime() - Date.now();
    if (diffMs <= 0) return 'SLA EXPIRED';
    const hours = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    return `${hours}h ${mins}m left`;
  };

  // Sort queue by slaDeadline ascending (most urgent first)
  const sortedRequests = [...requests].sort(
    (a, b) => new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime()
  );

  const handleExecuteAction = async () => {
    if (!selectedClaim || !actionType) return;
    if ((actionType === 'REJECT' || actionType === 'APPROVE') && !reviewNotes.trim()) {
      alert('Review notes are mandatory for auditing purposes.');
      return;
    }
    if (actionType === 'PAYOUT' && !payoutRef.trim()) {
      alert('Please input the Raast/Safepay payout reference ID.');
      return;
    }

    setIsProcessing(true);
    try {
      let newStatus: AdminRefundRequest['status'] = selectedClaim.status;
      if (actionType === 'APPROVE') newStatus = 'APPROVED';
      if (actionType === 'REJECT') newStatus = 'REJECTED';
      if (actionType === 'PAYOUT') newStatus = 'PAID_OUT';

      await fetch(`/api/admin/refunds/${selectedClaim.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          reviewNotes,
          payoutRef: actionType === 'PAYOUT' ? payoutRef : undefined,
        }),
      });

      // Update local state
      setRequests((prev) =>
        prev.map((r) =>
          r.id === selectedClaim.id
            ? {
                ...r,
                status: newStatus,
                reviewNotes: reviewNotes || r.reviewNotes,
                payoutRef: payoutRef || r.payoutRef,
              }
            : r
        )
      );

      setActionType(null);
      setSelectedClaim(null);
      setReviewNotes('');
      setPayoutRef('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="admin-refunds-page">
      {/* HEADER */}
      <div className="refunds-page-header">
        <div>
          <h2>100% Refund Vault Operations Queue</h2>
          <p>
            Strict 24-hour SLA promise queue sorted by deadline urgency. Compare customer evidence with warehouse dispatch video.
          </p>
        </div>
        <button type="button" className="refresh-btn" onClick={fetchRefunds}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Claims</span>
        </button>
      </div>

      {/* 2-HOUR ESCALATION ALERT BANNER */}
      {sortedRequests.some((r) => isUrgentEscalation(r.slaDeadline, r.status)) && (
        <div className="escalation-alert-bar animate-pulse-subtle">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
          <div className="bar-text">
            <strong>CRITICAL SLA ESCALATION TRIGGERED:</strong> One or more claims have &lt; 2 hours remaining on the 24-hour customer resolution guarantee. Immediate review required to prevent SLA breach.
          </div>
        </div>
      )}

      {/* REFUND REQUESTS QUEUE TABLE */}
      <div className="refunds-table-container">
        <table className="refunds-table">
          <thead>
            <tr>
              <th>SLA Urgency</th>
              <th>Order #</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedRequests.map((claim) => {
              const urgent = isUrgentEscalation(claim.slaDeadline, claim.status);
              return (
                <tr key={claim.id} className={urgent ? 'urgent-row' : ''}>
                  <td>
                    <div className={`sla-pill ${urgent ? 'critical' : ''}`}>
                      <Clock size={13} />
                      <span>{getRemainingTimeText(claim.slaDeadline)}</span>
                    </div>
                  </td>
                  <td>
                    <strong>#{claim.orderNumber}</strong>
                  </td>
                  <td>
                    <div className="customer-cell">
                      <span>{claim.customerName}</span>
                      <small>{claim.customerPhone}</small>
                    </div>
                  </td>
                  <td>
                    <strong className="amount-text">Rs. {claim.totalAmount.toLocaleString()}</strong>
                  </td>
                  <td>
                    <div className="reason-cell" title={claim.reason}>
                      {claim.reason}
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge status-${claim.status.toLowerCase()}`}>
                      {claim.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="inspect-btn"
                      onClick={() => setSelectedClaim(claim)}
                    >
                      Compare & Review
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* SIDE-BY-SIDE VIDEO VS EVIDENCE COMPARISON MODAL */}
      {selectedClaim && (
        <div className="comparison-modal-backdrop" onClick={() => setSelectedClaim(null)}>
          <div className="comparison-modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="modal-top">
              <div className="top-title">
                <ShieldAlert size={20} className="text-amber-500" />
                <h3>Side-by-Side Audit: Order #{selectedClaim.orderNumber}</h3>
              </div>
              <button type="button" className="close-btn" onClick={() => setSelectedClaim(null)}>
                ✕
              </button>
            </div>

            <div className="claim-reason-banner">
              <strong>Customer Discrepancy Statement:</strong>
              <p>"{selectedClaim.reason}"</p>
            </div>

            {/* SIDE BY SIDE COMPARISON VIEWPORT */}
            <div className="side-by-side-grid">
              {/* LEFT: WAREHOUSE DISPATCH VIDEO */}
              <div className="comparison-panel">
                <div className="panel-header">
                  <Video size={16} />
                  <span>Warehouse Pre-Dispatch Video</span>
                </div>
                <div className="media-container">
                  <video
                    src={selectedClaim.dispatchVideoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'}
                    controls
                    className="comparison-video"
                  />
                </div>
                <div className="panel-footer-note">Official sealed inspection footage</div>
              </div>

              {/* RIGHT: CUSTOMER EVIDENCE */}
              <div className="comparison-panel">
                <div className="panel-header">
                  <Image size={16} />
                  <span>Customer Discrepancy Evidence</span>
                </div>
                <div className="media-container">
                  {selectedClaim.evidenceUrls[0] ? (
                    <img
                      src={selectedClaim.evidenceUrls[0]}
                      alt="Customer evidence"
                      className="comparison-img"
                    />
                  ) : (
                    <div className="no-evidence-box">No photo available</div>
                  )}
                </div>
                <div className="panel-footer-note">Provided by customer via Refund Vault form</div>
              </div>
            </div>

            {/* REVIEW DECISION BAR */}
            <div className="modal-bottom-actions">
              <div className="left-info">
                <span>Refund Amount:</span>
                <strong>Rs. {selectedClaim.totalAmount.toLocaleString()}</strong>
              </div>

              <div className="right-actions">
                {selectedClaim.status === 'UNDER_REVIEW' || selectedClaim.status === 'REQUESTED' ? (
                  <>
                    <button
                      type="button"
                      className="btn-reject"
                      onClick={() => setActionType('REJECT')}
                    >
                      <XCircle size={15} />
                      <span>Reject Claim</span>
                    </button>
                    <button
                      type="button"
                      className="btn-approve"
                      onClick={() => setActionType('APPROVE')}
                    >
                      <CheckCircle2 size={15} />
                      <span>Approve Claim</span>
                    </button>
                  </>
                ) : selectedClaim.status === 'APPROVED' ? (
                  <button
                    type="button"
                    className="btn-payout"
                    onClick={() => setActionType('PAYOUT')}
                  >
                    <DollarSign size={15} />
                    <span>Issue Gateway Payout (Mark PAID_OUT)</span>
                  </button>
                ) : (
                  <div className="resolved-tag">
                    <Check size={16} />
                    <span>Resolved ({selectedClaim.status})</span>
                  </div>
                )}
              </div>
            </div>

            {/* ACTION CONFIRMATION SUB-FORM */}
            {actionType && (
              <div className="action-subform animate-fade-in">
                <h4>
                  {actionType === 'APPROVE' && 'Approve Claim for Refund'}
                  {actionType === 'REJECT' && 'Reject Discrepancy Claim'}
                  {actionType === 'PAYOUT' && 'Record Payout Transaction ID'}
                </h4>

                {actionType === 'PAYOUT' ? (
                  <div className="form-field">
                    <label>Raast / Safepay Transaction Ref ID *</label>
                    <input
                      type="text"
                      placeholder="e.g. RAAST-TX-84920492"
                      value={payoutRef}
                      onChange={(e) => setPayoutRef(e.target.value)}
                      required
                      className="input-text"
                    />
                  </div>
                ) : (
                  <div className="form-field">
                    <label>Audit & Review Notes (Mandatory) *</label>
                    <textarea
                      placeholder="Explain your inspection findings for the audit log..."
                      rows={2}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      required
                      className="input-textarea"
                    />
                  </div>
                )}

                <div className="subform-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={() => setActionType(null)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="btn-confirm-action"
                    onClick={handleExecuteAction}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Recording...' : 'Confirm Decision'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
