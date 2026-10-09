'use client';

import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { useMounted } from '@/hooks/use-mounted';
import { Download, Smartphone, X, Share2, PlusSquare } from 'lucide-react';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const mounted = useMounted();

  if (!mounted || isInstalled) {
    return null;
  }

  // Android / Chromium / Desktop prompt
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-lg bg-[#d4b26f] font-bold text-black shadow-md hover:bg-[#e2c487] active:scale-95 transition-all ${
          compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'
        }`}
        title="Install Osama The Best to your phone home screen"
      >
        <Download className="w-3.5 h-3.5 stroke-[2.5]" />
        <span>Install</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-lg border border-[#d4b26f]/30 bg-[#16161c] font-medium text-[#eed891] hover:bg-[#d4b26f]/10 active:scale-95 transition-all ${
            compact ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'
          }`}
          title="Install to iPhone / iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#d4b26f]" />
          <span>Add App</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#14141a] p-5 shadow-2xl text-zinc-100">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#d4b26f]/15 flex items-center justify-center text-[#d4b26f]">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Install on iPhone</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-lg p-1.5 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3.5 space-y-2.5 text-xs text-zinc-300">
                <div className="flex items-start gap-2.5 rounded-xl bg-zinc-900/80 p-2.5 border border-white/5">
                  <div className="rounded-lg bg-[#d4b26f]/15 p-1.5 text-[#d4b26f] shrink-0">
                    <Share2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Step 1:</span> Tap the <strong>Share</strong> button at bottom of Safari.
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl bg-zinc-900/80 p-2.5 border border-white/5">
                  <div className="rounded-lg bg-[#d4b26f]/15 p-1.5 text-[#d4b26f] shrink-0">
                    <PlusSquare className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-white">Step 2:</span> Scroll down and tap <strong>Add to Home Screen</strong>.
                  </div>
                </div>

                <p className="text-[11px] text-zinc-400 pt-0.5">
                  Once installed, Osama The Best runs full screen like a native App Store application with 100% offline support.
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-zinc-800 py-2.5 text-xs font-bold text-white hover:bg-zinc-700 transition"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
