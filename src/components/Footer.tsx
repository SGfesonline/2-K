import React from 'react';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';

interface FooterProps {
  isAdminMode: boolean;
  onOpenAdminAuth: () => void;
  onExitAdminMode: () => void;
  isFirebaseConnected: boolean;
  onResetData: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  isAdminMode,
  onOpenAdminAuth,
  onExitAdminMode,
  isFirebaseConnected,
  onResetData,
}) => {
  return (
    <footer className="w-full bg-[#030612]/90 border-t border-cyan-500/20 mt-16 text-slate-400 text-xs backdrop-blur-md relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-slate-300">
            <span className="font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" />
              今日、迷子になりました。～惑星朝日編～
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="text-pink-300 font-mono text-[11px] font-bold">
              2年K組 クラス企画
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isFirebaseConnected ? 'bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse' : 'bg-amber-400'}`}></span>
              {isFirebaseConnected ? '衛星クラウド同期中' : '端末ローカル稼働中'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isAdminMode ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onResetData}
                  className="px-2.5 py-1 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-500/30 transition text-[11px] cursor-pointer"
                  title="整理券データをすべて消去"
                >
                  データ全消去
                </button>
                <button
                  type="button"
                  onClick={onExitAdminMode}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 transition cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                  <span>来場者（搭乗者）画面へ戻る</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenAdminAuth}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/80 border border-slate-700/80 transition cursor-pointer"
                title="運営関係者（2年K組スタッフ）専用画面への移行"
              >
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>運営スタッフ管理</span>
              </button>
            )}
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-4 text-center">
          <p className="text-[11px] text-slate-400 tracking-wide font-normal font-mono">
            © 2026 2-K PLANET ASAHI EXPEDITION. Cultural Festival Attraction System.
          </p>
        </div>
      </div>
    </footer>
  );
};
