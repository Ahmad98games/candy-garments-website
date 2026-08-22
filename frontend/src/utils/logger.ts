// Persistent Client Logger for Error Tracking and System Stability Audit

export interface ErrorLogEntry {
    timestamp: string;
    message: string;
    stack?: string;
    source?: string;
    line?: number;
    column?: number;
    path: string;
    userAgent: string;
}

const STORAGE_KEY = 'omnora_error_logs';
const MAX_LOGS = 50;

export function logError(error: Error | string, errorInfo?: any) {
    const timestamp = new Date().toISOString();
    const message = typeof error === 'string' ? error : error.message || 'Unknown Error';
    const stack = typeof error === 'object' && error.stack ? error.stack : errorInfo?.componentStack || undefined;

    const entry: ErrorLogEntry = {
        timestamp,
        message,
        stack,
        source: errorInfo?.source || 'React Boundary / Global Handler',
        line: errorInfo?.line,
        column: errorInfo?.column,
        path: typeof window !== 'undefined' ? window.location.pathname : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
    };

    console.error('🚨 [OMNORA SYSTEM AUDIT LOG]:', entry);

    if (typeof window !== 'undefined' && window.localStorage) {
        try {
            const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            existing.unshift(entry);
            if (existing.length > MAX_LOGS) {
                existing.length = MAX_LOGS;
            }
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
        } catch (e) {
            console.warn('Could not persist error log to localStorage:', e);
        }
    }
}

export function getErrorLogs(): ErrorLogEntry[] {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch {
        return [];
    }
}

export function clearErrorLogs() {
    if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(STORAGE_KEY);
    }
}
