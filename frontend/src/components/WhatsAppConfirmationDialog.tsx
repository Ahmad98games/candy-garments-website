import React, { useEffect } from 'react';
import { MessageCircle, AlertTriangle, X, CheckCircle } from 'lucide-react';
import './WhatsAppConfirmationDialog.css';

interface WhatsAppConfirmationDialogProps {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    orderNumber: string;
}

export default function WhatsAppConfirmationDialog({
    isOpen,
    onConfirm,
    onCancel,
    orderNumber
}: WhatsAppConfirmationDialogProps) {
    
    // Lock body scroll when dialog is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="whatsapp-dialog-overlay" onClick={onCancel}>
            <div className="whatsapp-dialog" onClick={(e) => e.stopPropagation()}>
                
                {/* Header */}
                <div className="whatsapp-dialog-header">
                    <div className="header-badge">
                        <MessageCircle size={24} color="#25D366" />
                        <span>SECURE CHANNEL</span>
                    </div>
                    <button className="close-btn" onClick={onCancel}>
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="whatsapp-dialog-content">
                    <h2 className="dialog-title">Initiate Order Protocol</h2>
                    
                    <p className="dialog-desc">
                        To finalize Order <strong>#{orderNumber}</strong>, a secure message packet must be transmitted via WhatsApp.
                    </p>

                    <div className="dialog-alert">
                        <AlertTriangle size={20} className="alert-icon" />
                        <div className="alert-text">
                            <strong>ACTION REQUIRED</strong>
                            <span>Order is PENDING until the message is sent.</span>
                        </div>
                    </div>

                    <div className="steps-list">
                        <div className="step-item">
                            <span className="step-num">01</span>
                            <span>Click "Transmit via WhatsApp" below.</span>
                        </div>
                        <div className="step-item">
                            <span className="step-num">02</span>
                            <span>Send the pre-filled message instantly.</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="whatsapp-dialog-actions">
                    <button
                        className="whatsapp-dialog-btn whatsapp-dialog-btn-cancel"
                        onClick={onCancel}
                    >
                        Abort
                    </button>
                    <button
                        className="whatsapp-dialog-btn whatsapp-dialog-btn-confirm"
                        onClick={onConfirm}
                    >
                        <MessageCircle size={18} fill="white" />
                        <span>Transmit via WhatsApp</span>
                    </button>
                </div>
            </div>
        </div>
    );
}