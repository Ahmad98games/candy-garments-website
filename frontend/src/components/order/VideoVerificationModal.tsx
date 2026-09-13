import React, { useState } from 'react';
import { Video, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw, X, MessageSquare, Clock } from 'lucide-react';
import './VideoVerificationModal.css';

interface VideoVerificationModalProps {
  orderId: string;
  orderNumber: number | string;
  videoUrl?: string;
  videoUploadedAt?: string;
  videoViewedByCustomer: boolean;
  status: string;
  onClose: () => void;
  onConfirmViewed: () => void;
  onDisputeReshoot: (reason: string) => Promise<void>;
}

export const VideoVerificationModal: React.FC<VideoVerificationModalProps> = ({
  orderId,
  orderNumber,
  videoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
  videoUploadedAt,
  videoViewedByCustomer,
  status,
  onClose,
  onConfirmViewed,
  onDisputeReshoot,
}) => {
  const [showDisputeForm, setShowDisputeForm] = useState(false);
  const [disputeReason, setDisputeReason] = useState('');
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false);
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  const handleDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim()) return;
    setIsSubmittingDispute(true);
    try {
      await onDisputeReshoot(disputeReason);
      setDisputeSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingDispute(false);
    }
  };

  return (
    <div className="video-modal-backdrop" onClick={onClose}>
      <div className="video-modal-card animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* MODAL HEADER */}
        <div className="video-modal-header">
          <div className="header-left">
            <div className="video-badge">
              <Video size={16} />
              <span>PRE-DISPATCH INSPECTION VIDEO</span>
            </div>
            <h3>Order #{orderNumber} Verification</h3>
            <span className="timestamp-note">
              Recorded at warehouse on {videoUploadedAt ? new Date(videoUploadedAt).toLocaleString() : 'Today'}
            </span>
          </div>
          <button type="button" className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* NOTICE: WHATSAPP TEMPLATE COMPLIANCE & 90-DAY RETENTION */}
        <div className="whatsapp-compliance-banner">
          <MessageSquare size={16} className="text-green-600 flex-shrink-0" />
          <div className="banner-text">
            <span>
              <strong>Meta WhatsApp Business Compliance:</strong> Delivered via registered utility template <code>candy_predispatch_inspection_v1</code>.
              Video will be securely archived after 90 days per data lifecycle policy.
            </span>
          </div>
        </div>

        {/* VIDEO PLAYER */}
        <div className="video-player-frame">
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="warehouse-video"
            onPlay={onConfirmViewed}
          />
        </div>

        {/* ACTIONS / RESHOOT FLOW */}
        {!showDisputeForm && !disputeSubmitted ? (
          <div className="video-modal-actions">
            <div className="viewed-status">
              {videoViewedByCustomer ? (
                <span className="viewed-badge seen">
                  <CheckCircle2 size={14} /> Video Confirmed by You
                </span>
              ) : (
                <span className="viewed-badge pending">
                  <Clock size={14} /> Awaiting Your Review
                </span>
              )}
            </div>

            <div className="btn-group">
              <button
                type="button"
                className="dispute-reshoot-btn"
                onClick={() => setShowDisputeForm(true)}
              >
                <AlertTriangle size={15} />
                <span>This doesn't look right (Request Reshoot)</span>
              </button>

              <button
                type="button"
                className="confirm-pack-btn"
                onClick={() => {
                  onConfirmViewed();
                  onClose();
                }}
              >
                <CheckCircle2 size={16} />
                <span>Looks Perfect! Ready for Dispatch</span>
              </button>
            </div>
          </div>
        ) : disputeSubmitted ? (
          <div className="dispute-success-state animate-fade-in">
            <CheckCircle2 size={32} className="text-emerald-500" />
            <h4>Reshoot Request Sent to Warehouse</h4>
            <p>
              Your order has been reverted to <strong>VIDEO_INSPECTION_PENDING</strong>. Our packaging supervisor will inspect the garment, record a fresh video, and notify you via WhatsApp before any courier handover.
            </p>
            <button type="button" className="close-dispute-btn" onClick={onClose}>
              Done
            </button>
          </div>
        ) : (
          /* DISPUTE RESHOOT FORM */
          <form className="dispute-reshoot-form animate-fade-in" onSubmit={handleDispute}>
            <h4>Report Discrepancy & Request Fresh Inspection</h4>
            <p>
              Please describe what is incorrect (e.g. wrong size tag, fabric flaw, mismatch color). The warehouse will halt dispatch immediately.
            </p>
            <textarea
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              placeholder="e.g. The embroidery on the neckline seems to differ from the catalog picture..."
              rows={3}
              required
              className="dispute-textarea"
            />
            <div className="form-buttons">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setShowDisputeForm(false)}
                disabled={isSubmittingDispute}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-dispute-btn"
                disabled={isSubmittingDispute}
              >
                {isSubmittingDispute ? (
                  <>
                    <RefreshCw size={15} className="animate-spin" />
                    <span>Halting Dispatch...</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={15} />
                    <span>Halt Dispatch & Request Reshoot</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
