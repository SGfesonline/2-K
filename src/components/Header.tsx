import React from 'react';
import { 
  Rocket, 
  Users, 
  Clock, 
  FileSpreadsheet, 
  User, 
  ClipboardCheck, 
  RefreshCw,
  KeyRound,
  Radio,
  Sparkles
} from 'lucide-react';
import { AdminTabType } from '../types';

interface HeaderProps {
  isAdminMode: boolean;
  setIsAdminMode: (admin: boolean) => void;
  adminTab: AdminTabType;
  setAdminTab: (tab: AdminTabType) => void;
  onOpenSpreadsheet: () => void;
  onOpenGuidelines?: () => void;
  notificationPermission?: NotificationPermission;
  onReqNotifications?: () => void;
  waitingCount: number;
  callingCount: number;
  completedCount: number;
  isFirebaseConnected?: boolean;
  ticketCount?: number;
  isOnline?: boolean;
  lastSyncedAt?: Date | null;
  isResyncing?: boolean;
  onManualResync?: () => Promise<void>;
  projectName?: string;
}

export const Header: React.FC<HeaderProps> = ({
  isAdminMode,
  setIsAdminMode,
  adminTab,
  setAdminTab,
  onOpenSpreadsheet,
  waitingCount,
  callingCount,
  completedCount,
  isOnline = true,
  lastSyncedAt,
  isResyncing = false,
  onManualResync,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#070d24]/90 backdrop-blur-xl border-b border-cyan-500/25 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* 左側：企画タイトル & クラス名 */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl border border-pink-500/40 bg-gradient-to-br from-pink-900/60 to-purple-900/80 flex items-center justify-center shadow-md shadow-pink-500/20 shrink-0">
              <Rocket className="w-5 h-5 text-pink-300 transform -rotate-45" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="text-xs sm:text-sm font-black text-white tracking-wide truncate">
                    今日、迷子になりました。<span className="text-cyan-300 font-bold hidden sm:inline">～惑星朝日編～</span>
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-950/80 text-pink-300 border border-pink-500/40 shrink-0">
                    2年K組
                  </span>
                </div>
                
                {/* 接続インジケーター */}
                <div className="flex items-center gap-1">
                  {!isOnline ? (
                    <span 
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/40"
                      title="電波不通・オフライン（ローカルキャッシュ利用中）"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                      <span className="hidden sm:inline">オフライン</span>
                    </span>
                  ) : (
                    <span 
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30"
                      title="リアルタイム同期中"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                      <span className="hidden sm:inline">LIVE</span>
                    </span>
                  )}

                  {onManualResync && (
                    <button
                      type="button"
                      onClick={onManualResync}
                      disabled={isResyncing}
                      className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60 transition disabled:opacity-40 cursor-pointer"
                      title={`クラウドと同期 (最終: ${lastSyncedAt ? lastSyncedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) : '未同期'})`}
                    >
                      <RefreshCw className={`w-3 h-3 ${isResyncing ? 'animate-spin text-cyan-400' : ''}`} />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                <span className="text-cyan-400">★</span> 宇宙迷路 × 謎解き × プラネタリウム
              </p>
            </div>
          </div>

          {/* 右側：待機カウント・管理モード */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* 待ち状況バッジ */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 font-medium">
                <Users className="w-3.5 h-3.5 text-cyan-400" />
                <span>待機:</span>
                <span className="font-bold text-white font-mono">{waitingCount}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-500/40 font-medium">
                <Radio className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>呼出中:</span>
                <span className="font-bold text-amber-200 font-mono">{callingCount}</span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 font-medium">
                <span>帰還済:</span>
                <span className="font-bold text-emerald-200 font-mono">{completedCount}</span>
              </div>
            </div>

            {/* 管理者モード切替 */}
            <button
              type="button"
              onClick={() => setIsAdminMode(!isAdminMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                isAdminMode 
                  ? 'bg-pink-600 hover:bg-pink-500 text-white border-pink-400 shadow-md shadow-pink-600/30' 
                  : 'bg-slate-900/90 text-slate-300 hover:text-white border-slate-700 hover:border-slate-600'
              }`}
            >
              {isAdminMode ? (
                <>
                  <User className="w-3.5 h-3.5" />
                  <span>来場者画面</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
                  <span>司令室(管理)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 管理者用タブバー */}
        {isAdminMode && (
          <div className="mt-2.5 pt-2.5 border-t border-cyan-500/20 flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setAdminTab('queue')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                  adminTab === 'queue'
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/60'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>管制キューボード</span>
                {callingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('slots')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                  adminTab === 'slots'
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>枠別・時間帯</span>
              </button>

              <button
                type="button"
                onClick={() => setAdminTab('roster')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                  adminTab === 'roster'
                    ? 'bg-cyan-600 text-white border-cyan-400 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-800/60'
                }`}
              >
                <ClipboardCheck className="w-3.5 h-3.5" />
                <span>全搭乗券名簿</span>
              </button>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={onOpenSpreadsheet}
                className="px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 hover:bg-emerald-900/70 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                title="整理券・来場結果データ出力 (CSV / スプレッドシート)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>結果CSV出力</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

