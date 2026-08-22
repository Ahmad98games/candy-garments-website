import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, CheckCircle2, Monitor } from 'lucide-react';
import './PWAInstallPrompt.css';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState<boolean>(true);
  const [installed, setInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  useEffect(() => {
    // Check if running as standalone PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setInstalled(true);
      setShowPrompt(false);
      return;
    }

    // Check if user dismissed prompt previously in this session
    const dismissed = sessionStorage.getItem('candy_pwa_dismissed');
    if (dismissed === 'true') {
      setShowPrompt(false);
    }

    // iOS detection
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Listen for install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!sessionStorage.getItem('candy_pwa_dismissed')) {
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

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setInstalled(true);
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    } else {
      // Toggle guide if native prompt event not captured yet
      setShowGuide((prev) => !prev);
    }
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
                (e.target as HTMLImageElement).src = '/candy.jpg';
              }}
            />
            <span className="pwa-badge"><Sparkles size={10} /> App</span>
          </div>

          <div className="pwa-text">
            <h4 className="pwa-title">Install Candy Kids App</h4>
            <p className="pwa-desc">
              Fast, offline luxury kids apparel shopping experience on your device!
            </p>
          </div>
        </div>

        {showGuide && (
          <div className="pwa-guide-box">
            {isIOS ? (
              <p><Smartphone size={14} className="inline-icon" /> Tap the <strong>Share button</strong> in Safari, then select <strong>"Add to Home Screen"</strong>.</p>
            ) : (
              <p><Monitor size={14} className="inline-icon" /> Click the <strong>Install icon</strong> in your browser address bar (top right) or open menu and select <strong>"Install Candy Kids App"</strong>.</p>
            )}
          </div>
        )}

        <div className="pwa-actions">
          <button className="pwa-install-btn" onClick={handleInstallClick}>
            <Download size={16} />
            <span>{deferredPrompt ? 'Install App' : 'How to Install'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
