import React from 'react';
import { Loader2, Rocket } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
  subMessage?: string;
  onSkip?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'ミッションデータを読み込んでいます...',
  subMessage = '衛星通信より最新の整理券・待機状況を取得中',
  onSkip,
}) => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-5">
        <div className="w-16 h-16 rounded-2xl bg-[#09112d] border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <Rocket className="w-8 h-8 text-cyan-400 animate-pulse -rotate-45" />
        </div>
        <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-900 border border-slate-700 shadow-xs">
          <Loader2 className="w-4 h-4 text-pink-400 animate-spin" />
        </div>
      </div>

      <h3 className="text-base font-bold text-white tracking-tight font-cosmic-title">
        {message}
      </h3>
      <p className="text-xs text-slate-400 mt-1.5 max-w-xs leading-relaxed">
        {subMessage}
      </p>

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="mt-6 px-4 py-2 rounded-xl text-xs font-semibold text-cyan-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 transition shadow-sm cursor-pointer"
        >
          そのまま開く
        </button>
      )}
    </div>
  );
};
