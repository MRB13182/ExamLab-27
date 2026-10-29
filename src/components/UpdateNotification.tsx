import React, { useEffect, useState } from "react";
import { Download, X, Sparkles } from "lucide-react";

interface UpdateInfo {
  version: string;
  releaseDate: string;
  summary: string;
  apkUrl: string;
}

const DISMISSED_VERSION_KEY = "hsc_2027_dismissed_update_version";

export const UpdateNotification: React.FC = () => {
  const [updateAvailable, setUpdateAvailable] = useState<UpdateInfo | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let dismissTimer: number | undefined;

    const checkUpdate = async () => {
      try {
        const currentVersion =
          document.querySelector('meta[name="app-version"]')?.getAttribute("content") || "2026.10.29.3";

        const res = await fetch("/api/version");
        if (!res.ok) return;
        const data: UpdateInfo = await res.json();

        // Check if remote version is strictly newer
        if (data?.version && data.version > currentVersion) {
          const dismissedVersion = localStorage.getItem(DISMISSED_VERSION_KEY);
          if (dismissedVersion === data.version) {
            // User already acknowledged or dismissed this version
            return;
          }

          setUpdateAvailable(data);
          setVisible(true);

          // Automatically dismiss after 5 seconds
          dismissTimer = window.setTimeout(() => {
            setVisible(false);
          }, 5000);
        }
      } catch (err) {
        // Silently ignore if offline or endpoint unavailable
      }
    };

    checkUpdate();

    return () => {
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, []);

  const handleDismiss = () => {
    if (updateAvailable) {
      localStorage.setItem(DISMISSED_VERSION_KEY, updateAvailable.version);
    }
    setVisible(false);
  };

  const handleDownload = () => {
    if (updateAvailable) {
      localStorage.setItem(DISMISSED_VERSION_KEY, updateAvailable.version);
      window.location.href = updateAvailable.apkUrl;
    }
    setVisible(false);
  };

  if (!visible || !updateAvailable) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-lg rounded-2xl bg-slate-900/95 text-white shadow-2xl p-4 border border-blue-500/40 backdrop-blur-md animate-fadeIn"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-300 border border-blue-400/30 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-extrabold text-sm text-white">নতুন আপডেট উপলব্ধ!</p>
              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                v{updateAvailable.version}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {updateAvailable.summary}
            </p>
          </div>
        </div>

        <button
          type="button"
          aria-label="বন্ধ করুন"
          onClick={handleDismiss}
          className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-end gap-2.5 mt-3 pt-3 border-t border-slate-800">
        <button
          type="button"
          onClick={handleDismiss}
          className="px-3 py-1.5 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          পরে মনে করিয়ে দাও
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>APK ডাউনলোড করুন</span>
        </button>
      </div>
    </div>
  );
};
