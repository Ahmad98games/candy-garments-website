import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertOctagon, Info, AlertTriangle, X } from 'lucide-react';
import './Toast.css';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);

        // Auto-remove after 4 seconds
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    // Icon Mapping
    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success': return <CheckCircle size={20} />;
            case 'error': return <AlertOctagon size={20} />;
            case 'warning': return <AlertTriangle size={20} />;
            case 'info': return <Info size={20} />;
        }
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="toast-viewport">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`omnora-toast ${toast.type}`}
                        onClick={() => removeToast(toast.id)}
                    >
                        <div className="toast-icon-box">
                            {getIcon(toast.type)}
                        </div>
                        
                        <div className="toast-content">
                            <span className="toast-title">{toast.type.toUpperCase()}</span>
                            <span className="toast-message">{toast.message}</span>
                        </div>

                        <button className="toast-close" onClick={(e) => {
                            e.stopPropagation();
                            removeToast(toast.id);
                        }}>
                            <X size={14} />
                        </button>

                        {/* Visual Timer Bar */}
                        <div className="toast-progress"></div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (context === undefined) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}