import React, { useState, useEffect, useRef } from 'react';
import { 
  TicketRecord, 
  AdminTabType 
} from './types';
import { 
  loadTicketsFromStorage, 
  saveTicketsToStorage
} from './utils/storage';
import { NotificationManager } from './utils/notifications';
import { 
  testConnection, 
  subscribeToTickets, 
  setFirestoreTicket,
  updateFirestoreTicket, 
  syncAllTicketsToFirestore,
  subscribeToSyncSettings,
  subscribeAuthSession,
  logoutAdmin,
  SyncSettings
} from './firebase';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useNetworkSync } from './hooks/useNetworkSync';

import { Header } from './components/Header';
import { CosmicBackground } from './components/CosmicBackground';
import { AttractionInfoSection } from './components/AttractionInfoSection';
import { MyTicketView } from './components/MyTicketView';
import { LiveQueueBoard } from './components/LiveQueueBoard';
import { TimeSlotGrid } from './components/TimeSlotGrid';
import { AdminLotteryRoster } from './components/AdminLotteryRoster';
import { SpreadsheetSyncModal } from './components/SpreadsheetSyncModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { Footer } from './components/Footer';
import { AdminAuthModal } from './components/AdminAuthModal';
import { LoadingScreen } from './components/LoadingScreen';

export const App: React.FC = () => {
  const [tickets, setTickets] = useState<TicketRecord[]>(() => loadTicketsFromStorage());
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState<boolean>(false);
  const [adminTab, setAdminTab] = useState<AdminTabType>('queue');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const [isSpreadsheetOpen, setIsSpreadsheetOpen] = useState(false);
  const [detailTicket, setDetailTicket] = useState<TicketRecord | null>(null);
  const [, setSyncSettings] = useState<SyncSettings | null>(() => {
    const localUrl = localStorage.getItem('asahi_sheet_url') || '';
    return { sheetUrl: localUrl, autoSync: true, intervalSec: 60 };
  });

  const ticketSectionRef = useRef<HTMLDivElement>(null);

  const scrollToTicketSection = () => {
    if (ticketSectionRef.current) {
      ticketSectionRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const networkSync = useNetworkSync((updatedTickets) => {
    setTickets(updatedTickets);
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoading(false);
    }, 1200);

    testConnection().then((ok) => {
      setIsFirebaseConnected(ok);
    });

    const unsubscribe = subscribeToTickets(
      (firestoreTickets) => {
        setTickets(firestoreTickets);
        saveTicketsToStorage(firestoreTickets);
        setIsFirebaseConnected(true);
        setIsInitialLoading(false);
        networkSync.recordSyncTimestamp();
      },
      (err) => {
        console.warn('Firestore subscription offline, using cached tickets:', err);
        setIsInitialLoading(false);
      }
    );

    const unsubSettings = subscribeToSyncSettings((settings) => {
      if (settings) {
        setSyncSettings(settings);
      }
    });

    const unsubAuth = subscribeAuthSession((_user, isAdminSession) => {
      setIsAdminMode(isAdminSession);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
      unsubSettings();
      unsubAuth();
    };
  }, [networkSync]);

  const mergeSheetTicketsWithExisting = (
    fetched: TicketRecord[],
    current: TicketRecord[]
  ): TicketRecord[] => {
    const currentMap = new Map<string, TicketRecord>(current.map(t => [t.id, t]));

    return fetched.map(item => {
      const existing = currentMap.get(item.id);
      if (!existing) {
        return item;
      }

      return {
        ...item,
        queueStatus: existing.queueStatus || item.queueStatus,
        attendance: existing.attendance || item.attendance,
        calledAt: existing.calledAt || item.calledAt,
        completedAt: existing.completedAt || item.completedAt,
        accessPassword: existing.accessPassword || item.accessPassword,
        representativeName: existing.representativeName || item.representativeName,
        notes: item.notes || existing.notes || ''
      };
    });
  };

  const handleRequestNotification = async () => {
    const perm = await NotificationManager.requestPermission();
    setNotificationPermission(perm);
    if (perm === 'granted') {
      await NotificationManager.sendLocalNotification(
        '惑星朝日 宇宙ミッション通知設定完了',
        '搭乗のお呼出時にこちらの端末へアラートが届きます。',
        'planet-asahi-notification'
      );
    }
  };

  const handleCreateTicket = async (newTicket: TicketRecord) => {
    const updated = [...tickets.filter(t => t.id !== newTicket.id), newTicket];
    setTickets(updated);
    saveTicketsToStorage(updated);
    try {
      await setFirestoreTicket(newTicket);
    } catch (err) {
      console.error('Failed to create ticket in Firestore:', err);
    }
  };

  const handleUpdateTicket = async (id: string, partial: Partial<TicketRecord>) => {
    setTickets(prev => {
      const next = prev.map(t => {
        if (t.id === id) {
          return { ...t, ...partial };
        }
        return t;
      });
      saveTicketsToStorage(next);
      return next;
    });

    try {
      await updateFirestoreTicket(id, partial);
    } catch (err) {
      console.error('Failed to update ticket in Firestore:', err);
    }
  };

  const handleImportTickets = async (newTickets: TicketRecord[]) => {
    const merged = mergeSheetTicketsWithExisting(newTickets, tickets);
    setTickets(merged);
    saveTicketsToStorage(merged);
    try {
      await syncAllTicketsToFirestore(merged);
    } catch (err) {
      console.error('Failed to sync imported tickets to Firestore:', err);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('整理券・搭乗データをすべて消去しますか？')) {
      setTickets([]);
      saveTicketsToStorage([]);
      try {
        await syncAllTicketsToFirestore([]);
      } catch (err) {
        console.error('Failed to clear Firestore tickets:', err);
      }
    }
  };

  const handleExitAdminMode = async () => {
    await logoutAdmin();
    setIsAdminMode(false);
  };

  const waitingCount = tickets.filter(t => t.queueStatus === 'waiting').length;
  const callingCount = tickets.filter(t => t.queueStatus === 'called').length;
  const completedCount = tickets.filter(t => t.queueStatus === 'done').length;

  return (
    <div className="min-h-screen bg-[#040817] text-slate-100 flex flex-col font-sans selection:bg-pink-600 selection:text-white relative overflow-x-hidden">
      {/* 宇宙の星空キャンバス背景 */}
      <CosmicBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header
          isAdminMode={isAdminMode}
          setIsAdminMode={(mode) => {
            if (!mode) {
              handleExitAdminMode();
            } else {
              setIsAdminMode(true);
            }
          }}
          adminTab={adminTab}
          setAdminTab={setAdminTab}
          onOpenSpreadsheet={() => setIsSpreadsheetOpen(true)}
          notificationPermission={notificationPermission}
          onReqNotifications={handleRequestNotification}
          waitingCount={waitingCount}
          callingCount={callingCount}
          completedCount={completedCount}
          isFirebaseConnected={isFirebaseConnected}
          ticketCount={tickets.length}
          isOnline={networkSync.isOnline}
          lastSyncedAt={networkSync.lastSyncedAt}
          isResyncing={networkSync.isResyncing}
          onManualResync={networkSync.manualResync}
        />

        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-12">
          {networkSync.syncMessage && (
            <div className="mb-4 p-3 bg-cyan-950/80 border border-cyan-500/40 text-cyan-200 rounded-2xl flex items-center justify-between text-xs shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="font-bold text-white">{networkSync.syncMessage}</span>
              </div>
              {networkSync.lastSyncedAt && (
                <span className="text-[11px] text-cyan-300 font-medium">
                  最終更新: {networkSync.lastSyncedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
          )}

          {!networkSync.isOnline && (
            <div className="mb-4 p-3.5 bg-amber-950/80 border border-amber-500/40 text-amber-200 rounded-2xl flex items-center justify-between text-xs backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <div className="font-bold text-white">オフライン通信モードで稼働中</div>
                  <div className="text-[11px] text-amber-300">
                    搭乗券データは端末内に保持され、電波回復時に自動で衛星クラウドへ同期されます。
                    {networkSync.lastSyncedAt && `（最終同期: ${networkSync.lastSyncedAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}）`}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => networkSync.manualResync()}
                disabled={networkSync.isResyncing}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${networkSync.isResyncing ? 'animate-spin' : ''}`} />
                <span>{networkSync.isResyncing ? '同期中' : '再同期'}</span>
              </button>
            </div>
          )}

          {isInitialLoading && tickets.length === 0 ? (
            <LoadingScreen onSkip={() => setIsInitialLoading(false)} />
          ) : !isAdminMode ? (
            <div className="space-y-12">
              {/* 1. ポスター世界観・アトラクション紹介・ミッションストーリーセクション */}
              <AttractionInfoSection
                onGoToTicket={scrollToTicketSection}
                waitingCount={waitingCount}
                callingCount={callingCount}
              />

              {/* 2. 整理券発行・確認（開く）セクション */}
              <div ref={ticketSectionRef} className="pt-4 scroll-mt-24">
                <div className="text-center mb-6 space-y-1">
                  <span className="text-[11px] font-mono tracking-widest text-cyan-400 uppercase">
                    ENTRY PASS REGISTRATION
                  </span>
                  <h3 className="text-2xl font-black text-white font-cosmic-title neon-text-pink">
                    搭乗整理券の発行・照会
                  </h3>
                  <p className="text-xs text-slate-300 max-w-md mx-auto">
                    整理券を発行して、呼び出しがあるまで校内をお楽しみください
                  </p>
                </div>

                <MyTicketView
                  tickets={tickets}
                  notificationPermission={notificationPermission}
                  onReqNotifications={handleRequestNotification}
                  onSwitchToAdmin={() => setIsAdminAuthOpen(true)}
                  isLoading={isInitialLoading}
                  onUpdateTicket={handleUpdateTicket}
                  onCreateTicket={handleCreateTicket}
                  isOnline={networkSync.isOnline}
                  lastSyncedAt={networkSync.lastSyncedAt}
                  isResyncing={networkSync.isResyncing}
                  onManualResync={networkSync.manualResync}
                  projectName="今日、迷子になりました。～惑星朝日編～"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {adminTab === 'queue' && (
                <LiveQueueBoard
                  tickets={tickets}
                  onUpdateTicket={handleUpdateTicket}
                  onOpenTicketDetail={(t) => setDetailTicket(t)}
                />
              )}

              {adminTab === 'slots' && (
                <TimeSlotGrid
                  tickets={tickets}
                />
              )}

              {(adminTab === 'roster' || adminTab === 'lottery') && (
                <AdminLotteryRoster
                  tickets={tickets}
                  onUpdateLotteryResult={(ticketId, result) => handleUpdateTicket(ticketId, { lotteryResult: result })}
                  onUpdateTicket={handleUpdateTicket}
                  onOpenSpreadsheet={() => setIsSpreadsheetOpen(true)}
                />
              )}
            </div>
          )}
        </main>

        <Footer
          isAdminMode={isAdminMode}
          onOpenAdminAuth={() => setIsAdminAuthOpen(true)}
          onExitAdminMode={handleExitAdminMode}
          isFirebaseConnected={isFirebaseConnected}
          onResetData={handleResetData}
        />

        <SpreadsheetSyncModal
          isOpen={isSpreadsheetOpen}
          onClose={() => setIsSpreadsheetOpen(false)}
          tickets={tickets}
          onImportTickets={handleImportTickets}
        />

        <TicketDetailModal
          ticket={detailTicket}
          isOpen={Boolean(detailTicket)}
          onClose={() => setDetailTicket(null)}
          onUpdateTicket={handleUpdateTicket}
        />

        <AdminAuthModal
          isOpen={isAdminAuthOpen}
          onClose={() => setIsAdminAuthOpen(false)}
          onSuccess={() => {
            setIsAdminAuthOpen(false);
            setIsAdminMode(true);
          }}
        />
      </div>
    </div>
  );
};

export default App;

