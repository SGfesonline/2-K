import React, { useState, useMemo, useEffect } from 'react';
import { TicketRecord } from '../types';
import { 
  Clock, 
  Bell, 
  BellRing, 
  CheckCircle2, 
  AlertCircle, 
  Lock,
  User,
  Users,
  GraduationCap,
  Sparkles, 
  LogOut, 
  ArrowRight, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Ticket,
  Plus,
  Eye,
  EyeOff,
  Smartphone,
  Download,
  Share,
  PlusSquare,
  Send
} from 'lucide-react';
import { NotificationManager } from '../utils/notifications';
import { LoadingScreen } from './LoadingScreen';
import { TicketIssueForm } from './TicketIssueForm';

interface MyTicketViewProps {
  tickets: TicketRecord[];
  notificationPermission: NotificationPermission;
  onReqNotifications: () => void;
  onSwitchToAdmin?: () => void;
  isLoading?: boolean;
  onUpdateTicket?: (id: string, partial: Partial<TicketRecord>) => void;
  onCreateTicket?: (ticket: TicketRecord) => Promise<void> | void;
  isOnline?: boolean;
  lastSyncedAt?: Date | null;
  isResyncing?: boolean;
  onManualResync?: () => Promise<void>;
  projectName?: string;
}

const STORAGE_VERIFIED_ID_KEY = 'festival_verified_ticket_id';
const STORAGE_VERIFIED_PWD_KEY = 'festival_verified_ticket_pwd';

export const MyTicketView: React.FC<MyTicketViewProps> = ({
  tickets,
  notificationPermission,
  onReqNotifications,
  isLoading = false,
  onCreateTicket,
  isOnline = true,
  lastSyncedAt,
  isResyncing = false,
  onManualResync,
  projectName = '文化祭クラス企画',
}) => {
  const [activeTab, setActiveTab] = useState<'issue' | 'lookup'>('issue');
  const [verifiedTicketId, setVerifiedTicketId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(STORAGE_VERIFIED_ID_KEY);
  });
  
  const [lookupName, setLookupName] = useState<string>('');
  const [lookupPassword, setLookupPassword] = useState<string>('');
  const [showLookupPassword, setShowLookupPassword] = useState<boolean>(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isIssuingNew, setIsIssuingNew] = useState<boolean>(false);

  const [notifSent, setNotifSent] = useState<boolean>(false);
  const [showPwaGuide, setShowPwaGuide] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [, setIsStandalone] = useState<boolean>(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsStandalone(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', () => {
      setIsStandalone(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      setShowPwaGuide(prev => !prev);
    }
  };

  const currentTicket = useMemo(() => {
    if (!verifiedTicketId) return null;
    const found = tickets.find(t => t.id === verifiedTicketId);
    return found || null;
  }, [tickets, verifiedTicketId]);

  const lastAlertRef = React.useRef<{ id: string; status: string; timestamp: number }>({
    id: '',
    status: '',
    timestamp: 0
  });

  useEffect(() => {
    if (!currentTicket) return;

    const prev = lastAlertRef.current;
    const isSameTicket = prev.id === currentTicket.id;
    const isCalled = currentTicket.queueStatus === 'called';
    const hasNewTimestamp = Boolean(
      currentTicket.calledTimestamp && 
      currentTicket.calledTimestamp > prev.timestamp
    );
    const hasStatusTransition = isCalled && prev.status !== 'called';

    if (isCalled && (!isSameTicket || hasStatusTransition || hasNewTimestamp)) {
      lastAlertRef.current = {
        id: currentTicket.id,
        status: currentTicket.queueStatus,
        timestamp: currentTicket.calledTimestamp || Date.now()
      };

      NotificationManager.sendCallNotification(currentTicket);
    } else {
      lastAlertRef.current = {
        id: currentTicket.id,
        status: currentTicket.queueStatus,
        timestamp: currentTicket.calledTimestamp || prev.timestamp
      };
    }
  }, [currentTicket]);

  const handleTicketIssued = async (newTicket: TicketRecord) => {
    if (onCreateTicket) {
      await onCreateTicket(newTicket);
    }
    setVerifiedTicketId(newTicket.id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_VERIFIED_ID_KEY, newTicket.id);
      if (newTicket.accessPassword) {
        localStorage.setItem(STORAGE_VERIFIED_PWD_KEY, newTicket.accessPassword);
      }
    }
    setIsIssuingNew(false);
  };

  const handleVerifyTicket = (e: React.FormEvent) => {
    e.preventDefault();
    setVerifyError(null);

    const trimmedName = lookupName.trim().toLowerCase();
    const trimmedPassword = lookupPassword.trim();

    if (!trimmedName) {
      setVerifyError('代表者のお名前を入力してください');
      return;
    }
    if (!trimmedPassword) {
      setVerifyError('確認用パスワードを入力してください');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      const matched = tickets.find(t => {
        const tName = (t.representativeName || t.name || '').trim().toLowerCase();
        const tPass = (t.accessPassword || '').trim();

        const cleanTName = tName.replace(/\s+/g, '');
        const cleanInputName = trimmedName.replace(/\s+/g, '');

        const isNameMatched = cleanTName === cleanInputName || cleanTName.includes(cleanInputName);
        const isPasswordMatched = tPass === trimmedPassword;

        return isNameMatched && isPasswordMatched;
      });

      if (matched) {
        setVerifiedTicketId(matched.id);
        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_VERIFIED_ID_KEY, matched.id);
          localStorage.setItem(STORAGE_VERIFIED_PWD_KEY, trimmedPassword);
        }
        setIsIssuingNew(false);
        setVerifyError(null);
      } else {
        setVerifyError('お名前、またはパスワードが一致しませんでした。発行時に入力した代表者のお名前とパスワードをご確認ください。');
      }
      setIsVerifying(false);
    }, 200);
  };

  const handleCloseTicket = () => {
    setVerifiedTicketId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_VERIFIED_ID_KEY);
      localStorage.removeItem(STORAGE_VERIFIED_PWD_KEY);
    }
    setLookupPassword('');
    setVerifyError(null);
    setIsIssuingNew(false);
    setActiveTab('lookup');
  };

  const currentlyCalled = tickets.filter(t => t.queueStatus === 'called');
  const waitingTickets = tickets.filter(t => t.queueStatus === 'waiting');
  const myQueuePosition = currentTicket && currentTicket.queueStatus === 'waiting'
    ? waitingTickets.findIndex(t => t.id === currentTicket.id) + 1
    : 0;

  const getStatusDisplay = (ticket: TicketRecord) => {
    switch (ticket.queueStatus) {
      case 'called':
        return {
          title: '搭乗案内中（お呼出中）！',
          description: '順番になりました！２年K組教室（惑星朝日ゲート）へ直ちにお越しください！',
          badge: '🚀 搭乗開始',
          bgClass: 'bg-gradient-to-r from-pink-600 to-rose-600 text-white animate-pulse neon-border-pink',
          borderClass: 'border-pink-500/50',
          cardBg: 'bg-pink-950/70'
        };
      case 'in_progress':
        return {
          title: 'ミッション体験中',
          description: '現在、惑星朝日の謎解き・迷路ミッションに挑戦中です。',
          badge: '🌌 潜入中',
          bgClass: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white',
          borderClass: 'border-cyan-500/50',
          cardBg: 'bg-cyan-950/70'
        };
      case 'done':
        return {
          title: '地球帰還完了',
          description: '無事にミッションをクリアされました。ご来場ありがとうございました！',
          badge: '✨ 帰還完了',
          bgClass: 'bg-slate-700 text-slate-200',
          borderClass: 'border-slate-700',
          cardBg: 'bg-slate-900/60'
        };
      case 'on_hold':
        return {
          title: '一時保留（呼び出し不在）',
          description: '呼出時にご不在だったため保留となっています。到着されましたら受付スタッフにお声がけください。',
          badge: '⏸ 保留中',
          bgClass: 'bg-amber-600 text-white',
          borderClass: 'border-amber-500/50',
          cardBg: 'bg-amber-950/70'
        };
      case 'absent':
        return {
          title: 'キャンセル',
          description: 'この整理券（搭乗券）はキャンセルされました。',
          badge: 'キャンセル',
          bgClass: 'bg-slate-700 text-slate-300',
          borderClass: 'border-slate-700',
          cardBg: 'bg-slate-900/60'
        };
      default:
        return {
          title: myQueuePosition > 0 ? `待機中（あと ${myQueuePosition} 番目の搭乗予定）` : '待機中（スタンバイ）',
          description: '順番が近づくまで、他のクラス企画や展示を楽しみながらお待ちいただけます。',
          badge: '⏳ スタンバイ',
          bgClass: 'bg-indigo-900/90 border border-cyan-500/40 text-cyan-200',
          borderClass: 'border-cyan-500/30',
          cardBg: 'bg-[#0b1433]/80'
        };
    }
  };

  const statusInfo = currentTicket ? getStatusDisplay(currentTicket) : null;

  const handleTestPush = async () => {
    if (!currentTicket) return;
    await NotificationManager.sendCallNotification(currentTicket);
    setNotifSent(true);
    setTimeout(() => setNotifSent(false), 4000);
  };

  if (isLoading && (!currentTicket || tickets.length === 0)) {
    return (
      <div className="max-w-xl mx-auto space-y-5 px-1 py-2">
        <LoadingScreen
          message="整理券データを読み込んでいます..."
          subMessage="クラウドから最新の進行状況を取得中"
        />
      </div>
    );
  }

  return (
    <div id="queue-section" className="max-w-xl mx-auto space-y-5 px-1 py-2 scroll-mt-24">
      {!currentTicket || isIssuingNew ? (
        <div className="space-y-4">
          <div className="bg-slate-900/80 p-1.5 rounded-2xl flex items-center gap-1.5 border border-cyan-500/20 backdrop-blur-md shadow-lg">
            <button
              type="button"
              onClick={() => {
                setActiveTab('issue');
                setIsIssuingNew(true);
              }}
              className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'issue'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>搭乗券を発行する</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('lookup');
              }}
              className={`flex-1 py-3 px-3 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'lookup'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-cyan-600/30 font-black'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>整理券の確認（開く）</span>
            </button>
          </div>

          {currentTicket && isIssuingNew && (
            <div className="p-3.5 bg-slate-900/90 border border-cyan-500/30 rounded-2xl flex items-center justify-between text-xs text-white">
              <span className="text-cyan-200">
                現在 <strong className="font-mono text-cyan-300">#{currentTicket.ticketNumber} ({currentTicket.representativeName || currentTicket.name} 様)</strong> の搭乗券を開いています。
              </span>
              <button
                type="button"
                onClick={() => setIsIssuingNew(false)}
                className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-500/30 text-cyan-300 text-xs font-bold transition cursor-pointer shrink-0"
              >
                戻る
              </button>
            </div>
          )}

          {activeTab === 'issue' ? (
            <TicketIssueForm
              existingTickets={tickets}
              onTicketCreated={handleTicketIssued}
              projectName={projectName}
            />
          ) : (
            <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#09112d]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-400 mb-1 shadow-md shadow-cyan-500/20">
                  <Lock className="w-6 h-6 text-cyan-300" />
                </div>
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] tracking-widest uppercase">
                  BOARDING PASS VERIFICATION
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-cosmic-title">
                  搭乗券の確認・照会
                </h2>
                <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                  発行時に設定した<span className="font-bold text-cyan-300">代表者名</span>と<span className="font-bold text-pink-300">確認用パスワード</span>を入力して整理券を開いてください。
                </p>
              </div>

              <form onSubmit={handleVerifyTicket} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>代表者のお名前</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={lookupName}
                    onChange={(e) => {
                      setLookupName(e.target.value);
                      if (verifyError) setVerifyError(null);
                    }}
                    placeholder="お名前を入力"
                    className="w-full px-4 py-3 text-sm bg-slate-900/90 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-pink-400" />
                    <span>確認用パスワード</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showLookupPassword ? 'text' : 'password'}
                      required
                      value={lookupPassword}
                      onChange={(e) => {
                        setLookupPassword(e.target.value);
                        if (verifyError) setVerifyError(null);
                      }}
                      placeholder="確認用パスワードを入力"
                      className="w-full pl-4 pr-11 py-3 text-sm bg-slate-900/90 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:border-pink-400 transition font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLookupPassword(prev => !prev)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                      aria-label={showLookupPassword ? 'パスワードを隠す' : 'パスワードを表示'}
                    >
                      {showLookupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {verifyError && (
                  <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-500/50 text-xs text-rose-200 flex items-start gap-2.5 animate-fade-in">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{verifyError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-4 px-4 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-black text-sm transition flex items-center justify-center gap-2 shadow-xl shadow-cyan-600/30 cursor-pointer disabled:opacity-50 neon-border-cyan"
                >
                  {isVerifying ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>通信・照合中...</span>
                    </div>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-cyan-200" />
                      <span>パスワードを照合して搭乗券を開く</span>
                      <ArrowRight className="w-4 h-4 text-cyan-200" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg flex items-center justify-between gap-4 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-cyan-950 text-cyan-400 border border-cyan-500/30 shrink-0">
                <Smartphone className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">
                  スマホのホーム画面に追加（アプリ化）
                </h4>
                <p className="text-[11px] text-slate-400">
                  アプリ化すると電波が途切れても搭乗券を開きやすくなります
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-cyan-600/20 shrink-0 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              インストール
            </button>
          </div>

          {showPwaGuide && (
            <div className="bg-slate-900/90 border border-slate-700 rounded-3xl p-5 shadow-xl space-y-3 text-xs backdrop-blur-md">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-cyan-400" />
                  ホーム画面への追加手順（PWA）
                </h4>
                <button
                  type="button"
                  onClick={() => setShowPwaGuide(false)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  閉じる
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-bold text-cyan-300 text-xs">
                    iPhone / iPad (Safari)
                  </div>
                  <ol className="space-y-1 text-[11px] text-slate-300 pl-4 list-decimal leading-relaxed">
                    <li>画面下部の「<strong>共有ボタン</strong>」（<Share className="w-3 h-3 inline" />）をタップ</li>
                    <li>「<strong>ホーム画面に追加</strong>」（<PlusSquare className="w-3 h-3 inline" />）を選択</li>
                    <li>右上の「<strong>追加</strong>」をタップ</li>
                  </ol>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="font-bold text-pink-300 text-xs">
                    Android (Chrome)
                  </div>
                  <ol className="space-y-1 text-[11px] text-slate-300 pl-4 list-decimal leading-relaxed">
                    <li>画面右上の「<strong>メニュー（︙）</strong>」をタップ</li>
                    <li>「<strong>アプリをインストール</strong>」または「<strong>ホーム画面に追加</strong>」を選択</li>
                    <li>「<strong>インストール</strong>」をタップ</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-slate-900/80 border border-cyan-500/30 rounded-2xl px-4 py-3 shadow-lg flex items-center justify-between gap-2 text-xs backdrop-blur-md">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0 shadow-sm shadow-cyan-400" />
              <span className="text-slate-400 shrink-0">搭乗券:</span>
              <span className="font-black text-cyan-300 shrink-0 font-mono tracking-wider">
                #{currentTicket.ticketNumber}
              </span>
              <span className="font-bold text-white truncate">
                {currentTicket.representativeName || currentTicket.name} 様
              </span>
              {currentTicket.numberOfPeople > 1 && (
                <span className="px-2 py-0.5 rounded-full bg-pink-950/80 text-pink-300 border border-pink-500/40 text-[10px] font-bold shrink-0">
                  {currentTicket.numberOfPeople}名
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setIsIssuingNew(true)}
                className="px-2.5 py-1.5 rounded-xl bg-pink-950/80 border border-pink-500/40 text-pink-300 hover:bg-pink-900/80 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer shadow-sm"
                title="別の搭乗券を発行する"
              >
                <Plus className="w-3 h-3" />
                <span>新規発行</span>
              </button>
              <button
                type="button"
                onClick={handleCloseTicket}
                className="px-2.5 py-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-[11px] font-medium transition flex items-center gap-1 cursor-pointer border border-transparent hover:border-slate-700"
                title="この搭乗券を閉じて照会画面へ戻る"
              >
                <LogOut className="w-3 h-3" />
                <span>閉じる</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs shadow-md backdrop-blur-md">
            <div className="flex items-center gap-2">
              {isOnline ? (
                <span className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <Wifi className="w-3.5 h-3.5 text-cyan-400" />
                  衛星通信リンク正常（リアルタイム同期中）
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                  オフライン通信モード（ローカル保存データ）
                </span>
              )}
              {lastSyncedAt && (
                <span className="text-[11px] text-slate-400 hidden sm:inline">
                  最終同期: {lastSyncedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>

            {onManualResync && (
              <button
                type="button"
                onClick={onManualResync}
                disabled={isResyncing}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-50"
                title="電波回復時にサーバーと呼出状況を再同期します"
              >
                <RefreshCw className={`w-3 h-3 ${isResyncing ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />
                <span>{isResyncing ? '通信中...' : '再同期'}</span>
              </button>
            )}
          </div>

          <div className="relative overflow-hidden rounded-3xl border-2 border-cyan-500/40 bg-[#09112d]/95 shadow-2xl backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="bg-gradient-to-r from-slate-900 via-[#101b46] to-slate-900 border-b border-cyan-500/30 p-6 sm:p-7 relative">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] tracking-widest uppercase font-bold">
                      MISSION BOARDING PASS
                    </span>
                    <span className="text-[11px] font-mono text-pink-400 font-bold">
                      CLASS 2-K
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1.5 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-pink-400 shrink-0" />
                    <span>今日、迷子になりました。～惑星朝日編～</span>
                  </div>
                </div>

                {statusInfo && (
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-md shrink-0 ${statusInfo.bgClass}`}>
                    {statusInfo.badge}
                  </span>
                )}
              </div>

              <div className="mt-5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <div>
                  <span className="text-cyan-300/80 text-xs font-mono uppercase tracking-wider block">
                    BOARDING NUMBER / 整理券番号
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-5xl sm:text-6xl font-black tracking-tight font-mono text-white neon-text-cyan">
                      #{currentTicket.ticketNumber}
                    </span>
                  </div>
                </div>

                <div className="text-left sm:text-right mt-2 sm:mt-0">
                  <span className="text-slate-400 text-[11px] font-mono block">DESTINATION</span>
                  <span className="text-sm font-bold text-pink-300 font-cosmic-title">惑星朝日 (2年K組)</span>
                </div>
              </div>

              <div className="absolute -bottom-3 left-0 right-0 flex items-center justify-between px-2 pointer-events-none">
                <div className="w-5 h-5 rounded-full bg-[#040817] -ml-4" />
                <div className="flex-1 border-b border-dashed border-cyan-500/40 mx-2" />
                <div className="w-5 h-5 rounded-full bg-[#040817] -mr-4" />
              </div>
            </div>

            <div className="p-6 sm:p-7 space-y-5 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-5 border-b border-slate-800">
                <div>
                  <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                    <span className="font-mono text-[11px] uppercase tracking-wider text-cyan-400">CREW COMMANDER</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-pink-950/80 text-pink-300 font-bold text-xs border border-pink-500/40">
                      <Users className="w-3 h-3 text-pink-400" />
                      <span>{currentTicket.numberOfPeople} 名様</span>
                    </span>
                  </div>
                  <div className="text-2xl font-black text-white mt-1 flex items-center gap-2">
                    <span>{currentTicket.representativeName || currentTicket.name}</span>
                    <span className="text-sm font-normal text-slate-400">様</span>
                  </div>

                  <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900 border border-cyan-500/30 text-cyan-200 text-xs font-bold shadow-xs">
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>
                        {[
                          currentTicket.grade,
                          currentTicket.className,
                          currentTicket.attendanceNumber ? `${currentTicket.attendanceNumber}番` : ''
                        ].filter(Boolean).join(' ')}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <div className="text-xs text-slate-400 font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-mono text-[11px] uppercase tracking-wider">ISSUE TIME</span>
                    </div>
                    <div className="text-sm font-bold text-white mt-0.5 font-mono">
                      {currentTicket.registeredAt ? `${currentTicket.registeredAt} 発券` : '本日発券'}
                    </div>
                  </div>
                  <div className="text-[11px] text-pink-300/90 flex items-center gap-1.5 bg-pink-950/40 border border-pink-500/30 px-2.5 py-1 rounded-xl w-fit">
                    <Lock className="w-3 h-3 text-pink-400" />
                    <span>パスワード照会保護中</span>
                  </div>
                </div>
              </div>

              {statusInfo && (
                <div className={`p-5 rounded-2xl border ${statusInfo.cardBg} ${statusInfo.borderClass} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-black text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping" />
                      <span>リアルタイム進行状況</span>
                    </div>
                    <span className="text-xs font-bold text-cyan-300">
                      {statusInfo.title}
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed font-medium">
                    {statusInfo.description}
                  </p>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">現在のお呼出番号:</span>
                    <span className="font-black text-cyan-300 font-mono text-sm">
                      {currentlyCalled.length > 0 
                        ? currentlyCalled.map(c => `#${c.ticketNumber}`).join(', ')
                        : '呼出準備中'}
                    </span>
                  </div>

                  {currentTicket.queueStatus === 'waiting' && myQueuePosition > 0 && (
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400">搭乗までの前の待機組数:</span>
                      <span className="font-black text-pink-300 font-mono text-sm">あと {myQueuePosition - 1} 組</span>
                    </div>
                  )}
                </div>
              )}

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/60 opacity-60">
                <div className="font-mono text-[9px] text-slate-400 tracking-widest">
                  SECTOR-2K // PLANET-ASAHI // ORBIT-2026 // {currentTicket.id.slice(0, 8).toUpperCase()}
                </div>
                <div className="flex items-center gap-1">
                  {[4, 2, 6, 1, 5, 3, 2, 7, 3, 5, 1, 4, 6].map((h, i) => (
                    <span
                      key={i}
                      className="inline-block bg-cyan-400/60 rounded-xs"
                      style={{ width: '2px', height: `${h * 3}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4 backdrop-blur-md">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-pink-950 border border-pink-500/30 text-pink-400 shrink-0">
                  <Bell className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    呼出通知（プッシュ通知）
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    順番が来るとスマホ画面への通知でお知らせします
                  </p>
                </div>
              </div>

              {notificationPermission !== 'granted' ? (
                <button
                  type="button"
                  onClick={onReqNotifications}
                  className="px-3.5 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-pink-600/30 shrink-0 cursor-pointer"
                >
                  <BellRing className="w-3.5 h-3.5" />
                  通知を許可
                </button>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  通知有効
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400">通知テスト:</span>
              <button
                type="button"
                onClick={handleTestPush}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5 text-cyan-400" />
                テスト通信を発信
              </button>
            </div>

            {notifSent && (
              <p className="text-xs text-cyan-300 font-semibold flex items-center gap-1.5 bg-cyan-950/60 p-2.5 rounded-xl border border-cyan-500/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                テスト通知信号を送信しました。端末画面をご確認ください。
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};
