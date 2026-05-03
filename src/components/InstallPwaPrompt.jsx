import { useEffect, useState } from 'react';

/**
 * Android/Chrome: `beforeinstallprompt` → native Install button.
 * iOS Safari: no API — show instructions to use Share → Add to Home Screen.
 */
export default function InstallPwaPrompt() {
  const [deferred, setDeferred] = useState(null);
  const [showChromeInstall, setShowChromeInstall] = useState(false);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('pwa-install-dismissed') === '1');

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isIos = /iPad|iPhone|iPod/.test(ua);
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    if (!standalone && isIos && sessionStorage.getItem('pwa-install-dismissed') !== '1') {
      setShowIosHint(true);
    }

    const onPrompt = (e) => {
      e.preventDefault();
      setDeferred(e);
      setShowChromeInstall(true);
      setShowIosHint(false);
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const install = async () => {
    if (!deferred) return;
    deferred.prompt();
    await deferred.userChoice.catch(() => {});
    setDeferred(null);
    setShowChromeInstall(false);
  };

  const dismiss = () => {
    sessionStorage.setItem('pwa-install-dismissed', '1');
    setDismissed(true);
    setShowChromeInstall(false);
    setShowIosHint(false);
    setDeferred(null);
  };

  if (dismissed) return null;

  if (showChromeInstall && deferred) {
    return (
      <div className="pwa-install-banner" role="dialog" aria-label="Install app">
        <div className="pwa-install-inner">
          <p className="pwa-install-text">Install LeaseTogether on your device for quick access and offline support.</p>
          <div className="pwa-install-actions">
            <button type="button" className="btn btn-primary btn-sm" onClick={install}>
              Install
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={dismiss}>
              Not now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showIosHint) {
    return (
      <div className="pwa-install-banner" role="dialog" aria-label="Add to Home Screen">
        <div className="pwa-install-inner">
          <p className="pwa-install-text">
            To install on iPhone or iPad: tap the Share button <span aria-hidden="true">□↑</span>, then &quot;Add to Home
            Screen&quot;. Open the app from your home screen for full-screen mode.
          </p>
          <div className="pwa-install-actions">
            <button type="button" className="btn btn-secondary btn-sm" onClick={dismiss}>
              Dismiss
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
