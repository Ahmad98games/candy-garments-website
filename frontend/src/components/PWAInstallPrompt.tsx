import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, CheckCircle2 } from 'lucide-react';
import './PWAInstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(false);
  const [installed, setInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setInstalled(true);
      return;
    }

    // iOS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Check if user dismissed prompt previously in this session
      const dismissed = sessionStorage.getItem('candy_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    // Auto-show for iOS if not dismissed
    if (isIosDevice && !sessionStorage.getItem('candy_pwa_dismissed')) {
      setShowPrompt(true);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      setInstalled(true);
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('candy_pwa_dismissed', 'true');
  };

  if (installed || !showPrompt) return null;

  return (
    <div className="pwa-install-banner animate-fade-in" role="banner" aria-label="Install Candy Kids App">
      <div className="pwa-install-card">
        <button 
          className="pwa-close-btn" 
          onClick={handleDismiss} 
          aria-label="Dismiss App Install Banner"
        >
          <X size={16} />
        </button>

        <div className="pwa-content">
          <div className="pwa-logo-wrapper">
            <img 
              src="/images/candy.jpg" 
              alt="Candy Kids Logo" 
              className="pwa-app-logo" 
              onError={(e) => {
                // Fallback to root candy.jpg if images/ prefix fails
                (e.target as HTMLImageElement).src = '/candy.jpg';
              }}
            />
            <span className="pwa-badge"><Sparkles size={10} /> App</span>
          </div>

          <div className="pwa-text">
            <h4 className="pwa-title">Install Candy Kids App</h4>
            <p className="pwa-desc">
              Fast, offline-ready luxury shopping experience right on your home screen!
            </p>
          </div>
        </div>

        <div className="pwa-actions">
          {deferredPrompt ? (
            <button className="pwa-install-btn" onClick={handleInstallClick}>
              <Download size={16} />
              <span>Install App</span>
            </button>
          ) : isIOS ? (
            <div className="pwa-ios-instructions">
              <Smartphone size={16} />
              <span>Tap Share &amp; select <strong>Add to Home Screen</strong></span>
            </div>
          ) : (
            <button className="pwa-install-btn secondary" onClick={handleDismiss}>
              <CheckCircle2 size={16} />
              <span>PWA Ready</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
