'use client';

import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-[var(--card-border)] bg-[var(--surface)]/95 p-4 shadow-2xl backdrop-blur-xl lg:left-auto lg:right-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--gold)]/15 text-[var(--gold-light)]">
          <Download className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-semibold text-[var(--foreground)]">Install AZM</p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Add to your home screen for quick access and offline use.
          </p>
          <div className="mt-3 flex gap-2">
            <button onClick={handleInstall} className="btn-gold rounded-lg px-4 py-2 text-sm">
              Install
            </button>
            <button
              onClick={() => setVisible(false)}
              className="rounded-lg px-4 py-2 text-sm text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
