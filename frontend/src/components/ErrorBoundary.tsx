import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import { logError } from '../utils/logger';
import './ErrorBoundary.css';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        logError(error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary-container">
                    <div className="error-content">
                        
                        {/* Animated Error Icon */}
                        <div className="error-icon-wrapper">
                            <AlertTriangle size={64} strokeWidth={1.5} />
                        </div>

                        <h1>System Malfunction</h1>
                        
                        <p className="error-message">
                            An unexpected anomaly has occurred within the Candy interface.
                            <br />
                            Engineered by Omnora-Ahmad Mahboob.
                        </p>

                        <div className="error-actions">
                            <button 
                                onClick={() => window.location.reload()} 
                                className="error-btn primary"
                            >
                                <RotateCcw size={18} />
                                <span>Reboot System</span>
                            </button>

                            <button 
                                onClick={() => window.location.href = '/'} 
                                className="error-btn secondary"
                            >
                                <Home size={18} />
                                <span>Return to Base</span>
                            </button>
                        </div>

                        {/* Developer Debug Terminal */}
                        {(import.meta.env?.DEV || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'development')) && this.state.error && (
                            <div className="debug-terminal">
                                <div className="terminal-header">
                                    <span>DEBUG_LOG.txt</span>
                                </div>
                                <pre>
                                    {this.state.error.toString()}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;