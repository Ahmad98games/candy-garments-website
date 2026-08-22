import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Sparkles, Monitor, ArrowRight } from 'lucide-react';
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
  const [showModal, setShowModal] = useState<boolean>(false);

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

    // Listen for install prompt event from Chrome/Edge
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
      setShowModal(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        if (choiceResult.outcome === 'accepted') {
          setInstalled(true);
          setShowPrompt(false);
        }
        setDeferredPrompt(null);
      } catch (err) {
        console.warn('Install prompt trigger:', err);
        setShowModal(true);
      }
    } else {
      // If native event is pending browser audit, display modal guide
      setShowModal(true);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('candy_pwa_dismissed', 'true');
  };

  if (installed || !showPrompt) return null;

  return (
    <>
      {/* FLOATING INSTALL BANNER */}
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
                Fast, offline luxury kids apparel shopping experience on your home screen!
              </p>
            </div>
          </div>

          <div className="pwa-actions">
            <button className="pwa-install-btn" onClick={handleInstallClick} type="button">
              <Download size={16} />
              <span>Install App</span>
            </button>
          </div>
        </div>
      </div>

      {/* DETAILED INSTALLATION MODAL GUIDANCE */}
      {showModal && (
        <div className="pwa-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="pwa-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="pwa-modal-header">
              <div className="pwa-modal-title">
                <img src="/images/candy.jpg" alt="Candy Kids" className="pwa-modal-icon" />
                <div>
                  <h3>Install Candy Kids App</h3>
                  <p>Candy Garments PWA Experience</p>
                </div>
              </div>
              <button className="pwa-modal-close" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="pwa-modal-body">
              {isIOS ? (
                <div className="pwa-step-item">
                  <div className="pwa-step-badge">1</div>
                  <div className="pwa-step-content">
                    <strong>Safari Share Menu</strong>
                    <p>Tap the <Smartphone size={14} className="inline-icon" /> <strong>Share</strong> icon in Safari at the bottom of your screen.</p>
                  </div>
                </div>
              ) : (
                <div className="pwa-step-item">
                  <div className="pwa-step-badge">1</div>
                  <div className="pwa-step-content">
                    <strong>Browser Address Bar / Menu</strong>
                    <p>Click the <Monitor size={14} className="inline-icon" /> <strong>Install App icon</strong> in the top-right of your URL address bar or browser menu.</p>
                  </div>
                </div>
              )}

              <div className="pwa-step-item">
                <div className="pwa-step-badge">2</div>
                <div className="pwa-step-content">
                  <strong>Add to Home Screen</strong>
                  <p>Select <strong>"Add to Home Screen"</strong> or <strong>"Install Candy Kids"</strong> to confirm installation.</p>
                </div>
              </div>
            </div>

            <div className="pwa-modal-footer">
              <button className="pwa-modal-action-btn" onClick={() => setShowModal(false)}>
                <span>Got It!</span> <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PWAInstallPrompt;
