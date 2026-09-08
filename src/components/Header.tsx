import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Rocket, 
  Users, 
  Clock, 
  FileSpreadsheet, 
  ClipboardCheck, 
  RefreshCw,
  Radio,
  Menu,
  X,
  Ticket,
  Info,
  Activity,
  Bell,
  ChevronRight
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
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
  notificationPermission,
  onReqNotifications,
  waitingCount,
  callingCount,
  completedCount,
  isOnline = true,
  lastSyncedAt,
  isResyncing = false,
  onManualResync,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent body scrolling when side drawer is open & handle Esc key
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#070d24]/95 backdrop-blur-xl border-b border-cyan-500/25 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo and Brand */}
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
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-950/80 text-pink-300 border border-pink-500/40 shrink-0 font-mono">
                    2年K組
                  </span>
                </div>
                
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

          {/* Quick status counters and Menu toggle button */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
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

            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900/90 border border-cyan-500/40 hover:border-cyan-400 text-slate-200 hover:text-white transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-950/40"
              aria-label="メニューを開く"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X className="w-5 h-5 text-pink-400" /> : <Menu className="w-5 h-5 text-cyan-400" />}
              <span className="hidden sm:inline text-xs font-bold text-cyan-200">メニュー</span>
            </button>
          </div>
        </div>

        {/* Admin Bar (visible under header when Admin mode is on) */}
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

    {/* Full Screen Right-Side Drawer via Portal (画面全体に展開・ヘッダー外に配置) */}
    {typeof document !== 'undefined' && createPortal(
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Backdrop overlay: 暗幕＋ブラーで画面全体を薄暗く注視させる */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm cursor-pointer"
              onClick={() => setIsMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Right-Side Drawer Panel: 画面全体の右端にフルハイトでスマートにスライドイン */}
            <motion.aside 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 280 }}
              className="fixed inset-y-0 right-0 w-80 sm:w-88 max-w-[85vw] h-screen bg-[#091133] border-l border-cyan-500/40 shadow-2xl shadow-cyan-950 flex flex-col justify-between z-[101] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-label="メニュー"
            >
              {/* Drawer Header */}
              <div className="p-4 sm:p-5 border-b border-cyan-500/25 bg-[#0a143c] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl border border-pink-500/40 bg-pink-950/70 flex items-center justify-center">
                    <Rocket className="w-4 h-4 text-pink-300 -rotate-45" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white font-cosmic-title">システムメニュー</div>
                    <div className="text-[10px] text-cyan-300 font-mono">2年K組 惑星朝日</div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition cursor-pointer border border-transparent hover:border-slate-700"
                  aria-label="メニューを閉じる"
                >
                  <X className="w-5 h-5 text-pink-400" />
                </button>
              </div>

              {/* Scrollable Center Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Real-time Status Card */}
                <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-2xl bg-slate-950/80 border border-cyan-500/25 text-center">
                  <div className="p-1">
                    <div className="text-[9px] text-slate-400">待機組数</div>
                    <div className="text-sm font-bold text-cyan-300 font-mono">{waitingCount}組</div>
                  </div>
                  <div className="p-1 border-x border-slate-800">
                    <div className="text-[9px] text-slate-400">現在呼出</div>
                    <div className="text-sm font-bold text-amber-300 font-mono">{callingCount}組</div>
                  </div>
                  <div className="p-1">
                    <div className="text-[9px] text-slate-400">帰還完了</div>
                    <div className="text-sm font-bold text-emerald-300 font-mono">{completedCount}組</div>
                  </div>
                </div>

                {/* Section Links */}
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-1">
                    ページ内メニュー
                  </div>

                  <button
                    type="button"
                    onClick={() => scrollToSection('attraction-info')}
                    className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-left text-white flex items-center justify-between transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 group-hover:bg-cyan-900 transition">
                        <Info className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-cyan-200 transition">企画概要・公式ポスター</div>
                        <div className="text-[10px] text-slate-400">宇宙迷路・所要時間・見どころ</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('ticket-section')}
                    className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-pink-500/40 text-left text-white flex items-center justify-between transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-pink-950/80 text-pink-400 border border-pink-500/30 group-hover:bg-pink-900 transition">
                        <Ticket className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-pink-200 transition">搭乗整理券の発券・確認</div>
                        <div className="text-[10px] text-slate-400">整理券取得・マイチケット</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition" />
                  </button>

                  <button
                    type="button"
                    onClick={() => scrollToSection('queue-section')}
                    className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left text-white flex items-center justify-between transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-amber-950/80 text-amber-400 border border-amber-500/30 group-hover:bg-amber-900 transition">
                        <Activity className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-amber-200 transition">混雑状況・リアルタイム呼出</div>
                        <div className="text-[10px] text-slate-400">現在の呼出番号・待機リスト</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
                  </button>

                  {/* Notification Permission Setting */}
                  <button
                    type="button"
                    onClick={() => {
                      if (onReqNotifications) {
                        onReqNotifications();
                      }
                      scrollToSection('ticket-section');
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-left text-white flex items-center justify-between transition cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 group-hover:bg-emerald-900 transition">
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-emerald-200 transition">呼出通知・PWA設定</div>
                        <div className="text-[10px] text-slate-400">
                          {notificationPermission === 'granted' ? '通知許可済み (呼出時通知ON)' : '順番が近づいたらスマホへ通知'}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
                  </button>
                </div>

                {/* Cloud Sync Button */}
                {onManualResync && (
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => {
                        onManualResync();
                        setIsMenuOpen(false);
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left text-white flex items-center justify-between transition cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-slate-800 text-slate-300">
                          <RefreshCw className={`w-3.5 h-3.5 ${isResyncing ? 'animate-spin text-cyan-400' : ''}`} />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-white">クラウドデータと同期</div>
                          <div className="text-[10px] text-slate-400">
                            {lastSyncedAt ? `最終同期: ${lastSyncedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}` : '未同期'}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] text-cyan-300 font-mono">同期</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Bottom Bar */}
              <div className="p-4 border-t border-cyan-500/20 bg-[#0a143c] space-y-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full p-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 cursor-pointer"
                >
                  <X className="w-4 h-4 text-pink-400" />
                  <span>メニューを閉じる</span>
                </button>

                <div className="text-center text-[10px] text-slate-400 font-mono">
                  2-K COSMIC QUEUE SYSTEM
                </div>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </>
  );
};
