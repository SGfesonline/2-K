import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle2 } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [, setJustInstalled] = useState(false);

  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-mono">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        PWA インストール済
      </span>
    );
  }

  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        type="button"
        onClick={async () => {
          const ok = await install();
          if (ok) setJustInstalled(true);
        }}
        className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-pink-600/30 hover:bg-pink-500 active:scale-95 transition cursor-pointer"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span>アプリをインストール (PWA)</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          id="pwa-ios-install-btn"
          type="button"
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-pink-500/40 bg-pink-950/60 px-3 py-1.5 text-xs font-bold text-pink-300 hover:bg-pink-900/60 transition cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-pink-400" />
          <span>iOSホーム画面に追加</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#040817]/85 p-4 backdrop-blur-md">
            <div className="w-full max-w-sm rounded-3xl bg-[#09112d] border border-pink-500/40 p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-cosmic-title">
                  <Smartphone className="w-5 h-5 text-pink-400" />
                  iPhone / iPad への追加手順
                </h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-pink-600 text-white font-bold text-[10px]">1</span>
                  <p>Safariの画面下部にある<strong>共有アイコン (四角から矢印)</strong> をタップします。</p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-pink-600 text-white font-bold text-[10px]">2</span>
                  <p>メニューをスクロールし、<strong>「ホーム画面に追加」</strong>を選択します。</p>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="shrink-0 flex items-center justify-center w-5 h-5 rounded-full bg-pink-600 text-white font-bold text-[10px]">3</span>
                  <p>右上の<strong>「追加」</strong>をタップすると、アプリとして起動し呼出通知を受信できます。</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSGuide(false)}
                className="w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition cursor-pointer"
              >
                閉じる
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <button
      id="pwa-generic-guide-btn"
      type="button"
      onClick={() => setShowIOSGuide(true)}
      className="inline-flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-slate-900 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-slate-800 transition cursor-pointer"
      title="PWAとしてホーム画面にインストール"
    >
      <Download className="w-3.5 h-3.5 text-cyan-400" />
      <span>PWA設定</span>
    </button>
  );
};
