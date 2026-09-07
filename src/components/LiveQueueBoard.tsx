import React, { useState } from 'react';
import { 
  TicketRecord, 
  QueueStatus 
} from '../types';
import { 
  Megaphone, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  Users, 
  GraduationCap, 
  Search,
  RotateCcw,
  PauseCircle,
  Play,
  ArrowRight,
  Ticket
} from 'lucide-react';
import { sounds } from '../utils/audio';
import { NotificationManager } from '../utils/notifications';
import { ticketMatchesSearchQuery } from '../utils/studentIdMatcher';

interface LiveQueueBoardProps {
  tickets: TicketRecord[];
  onUpdateTicket: (id: string, partial: Partial<TicketRecord>) => void;
  onOpenTicketDetail?: (ticket: TicketRecord) => void;
  projectName?: string;
}

export const LiveQueueBoard: React.FC<LiveQueueBoardProps> = ({
  tickets,
  onUpdateTicket,
  onOpenTicketDetail,
  projectName = 'クラス企画'
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recentNotification, setRecentNotification] = useState<string | null>(null);

  const filteredTickets = tickets.filter(t => {
    if (!searchQuery.trim()) return true;
    return ticketMatchesSearchQuery(t, searchQuery.trim());
  });

  const callingList = filteredTickets.filter(t => t.queueStatus === 'called');
  const waitingList = filteredTickets.filter(t => t.queueStatus === 'waiting');
  const inProgressList = filteredTickets.filter(t => t.queueStatus === 'in_progress' || t.queueStatus === 'interview' || t.queueStatus === 'donating');
  const onHoldList = filteredTickets.filter(t => t.queueStatus === 'on_hold' || t.queueStatus === 'absent');
  const doneList = filteredTickets.filter(t => t.queueStatus === 'done' || t.queueStatus === 'resting');

  const estimatedWaitMinutes = Math.max(0, waitingList.length * 3);

  const handleCallTicket = (ticket: TicketRecord) => {
    const timeStr = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    const currentCallCount = ticket.callCount || 0;
    const nextCallCount = currentCallCount + 1;

    onUpdateTicket(ticket.id, {
      queueStatus: 'called',
      calledAt: timeStr,
      calledTimestamp: Date.now(),
      callCount: nextCallCount,
      attendance: 'present',
      arrivedAt: ticket.arrivedAt || timeStr
    });

    sounds.unlock();
    sounds.playCallingChime();

    NotificationManager.sendPushNotification(
      ticket.id,
      ticket.email || '',
      ticket.name,
      `企画ブースへのお呼出（整理券 #${ticket.ticketNumber}）`,
      `${ticket.name} 様、順番になりました！${projectName}ブース入口へお越しください。`
    );

    setRecentNotification(`整理券 #${ticket.ticketNumber} ${ticket.name} 様をお呼び出ししました（${nextCallCount}回目）`);
    setTimeout(() => setRecentNotification(null), 5000);
  };

  const handleCallNextWaiting = () => {
    if (waitingList.length === 0) return;
    handleCallTicket(waitingList[0]);
  };

  const handleStageTransition = (ticket: TicketRecord, nextStatus: QueueStatus) => {
    const timeStr = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    const updates: Partial<TicketRecord> = { queueStatus: nextStatus };
    if (nextStatus === 'done') {
      updates.completedAt = timeStr;
      updates.attendance = 'completed';
    }
    onUpdateTicket(ticket.id, updates);
  };

  return (
    <div className="space-y-6">
      {/* 呼出通知メッセージトースト */}
      {recentNotification && (
        <div className="p-3 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-bold">{recentNotification}</span>
          </div>
          <button
            type="button"
            onClick={() => setRecentNotification(null)}
            className="text-amber-700 hover:text-amber-900 text-[11px] font-bold cursor-pointer"
          >
            閉じる
          </button>
        </div>
      )}

      {/* コントロールヘッダー & 検索バー */}
      <div className="bg-[#09112d]/90 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] tracking-widest uppercase font-bold">
              MISSION CONTROL
            </span>
            <span className="text-xs font-mono text-pink-400 font-bold">SECTOR 2-K</span>
          </div>
          <h2 className="text-xl font-black text-white flex items-center gap-2 mt-1 font-cosmic-title">
            <Ticket className="w-5 h-5 text-pink-400" />
            <span>搭乗・ミッション管制ボード</span>
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            待機人数: <span className="font-bold text-cyan-300 font-mono text-sm">{waitingList.length}組</span> / 予想搭乗待ち時間: 約<span className="font-bold text-pink-300 font-mono text-sm">{estimatedWaitMinutes}分</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* 検索バー */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搭乗者名・クラス・番号検索"
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-900/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-400 transition font-medium"
            />
          </div>

          <button
            type="button"
            onClick={handleCallNextWaiting}
            disabled={waitingList.length === 0}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-pink-600/30 transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>次のクルーを呼出</span>
          </button>
        </div>
      </div>

      {/* 1. 現在お呼出中（Calling）エリア */}
      <div className="bg-pink-950/30 border-2 border-pink-500/40 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-pink-500/30">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-pink-600 to-rose-600 text-white shadow-md shadow-pink-600/30">
              <Megaphone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-white text-sm flex items-center gap-2">
                <span>現在搭乗案内中（お呼出中）</span>
                <span className="px-2.5 py-0.5 rounded-full bg-pink-600 text-white text-xs font-mono font-black animate-pulse">
                  {callingList.length} 組
                </span>
              </h3>
              <p className="text-[11px] text-pink-300">
                ２年K組教室入口（惑星ゲート）でお待ちいただいている搭乗者です
              </p>
            </div>
          </div>
        </div>

        {callingList.length === 0 ? (
          <div className="text-center py-6 text-pink-300/70 text-xs">
            現在、お呼出中の方はいません。「次のクルーを呼出」または待機列の「呼出」ボタンを押してください。
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {callingList.map((ticket) => (
              <div 
                key={ticket.id}
                className="bg-[#0e1738] border-2 border-pink-500 rounded-2xl p-4 shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => onOpenTicketDetail && onOpenTicketDetail(ticket)}
                      className="font-mono font-black text-cyan-300 text-xl hover:text-pink-400 transition cursor-pointer"
                    >
                      #{ticket.ticketNumber}
                    </button>
                    <span className="px-2.5 py-1 rounded-full bg-pink-600 text-white text-[10px] font-black border border-pink-400 animate-pulse">
                      呼出中 ({ticket.callCount || 1}回目)
                    </span>
                  </div>

                  <div className="mt-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => onOpenTicketDetail && onOpenTicketDetail(ticket)}
                        className="text-base font-bold text-white hover:text-pink-300 text-left transition cursor-pointer"
                      >
                        {ticket.representativeName || ticket.name} 様
                      </button>
                      <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-bold bg-pink-950/80 text-pink-300 border border-pink-500/40">
                        <Users className="w-3 h-3 text-pink-400" />
                        {ticket.numberOfPeople}名
                      </span>
                    </div>

                    {/* 学年・クラス・出席番号 */}
                    <div className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-cyan-200">
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>
                        {[
                          ticket.grade,
                          ticket.className,
                          ticket.attendanceNumber ? `${ticket.attendanceNumber}番` : ''
                        ].filter(Boolean).join(' ')}
                      </span>
                    </div>

                    {ticket.calledAt && (
                      <p className="text-[11px] text-pink-300 mt-1 font-mono">
                        呼出時刻: {ticket.calledAt}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleCallTicket(ticket)}
                    className="px-2.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition flex items-center gap-1 cursor-pointer shadow-xs"
                    title="スマホへ再呼出チャイム・通知を送信"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>再呼出</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleStageTransition(ticket, 'on_hold')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition flex items-center gap-1 cursor-pointer border border-slate-700"
                      title="応答がないため保留にする"
                    >
                      <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>保留</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStageTransition(ticket, 'in_progress')}
                      className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-cyan-600/30 cursor-pointer"
                    >
                      <span>ミッション突入</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. 待機中（Waiting）エリア */}
      <div className="bg-[#09112d]/90 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-cyan-950 text-cyan-300 border border-cyan-500/30">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <span>待機列（スタンバイ）</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 text-xs font-mono font-bold border border-cyan-500/30">
                  {waitingList.length} 組
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                整理券発行順にスタンバイ中
              </p>
            </div>
          </div>
        </div>

        {waitingList.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            待機中の整理券はありません。
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {waitingList.map((ticket, index) => (
              <div 
                key={ticket.id}
                className="bg-[#070e28] border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold flex items-center justify-center font-mono">
                        {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenTicketDetail && onOpenTicketDetail(ticket)}
                        className="font-mono font-bold text-white hover:text-cyan-300 transition cursor-pointer"
                      >
                        #{ticket.ticketNumber}
                      </button>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-pink-950/80 text-pink-300 border border-pink-500/40">
                      <Users className="w-3 h-3 text-pink-400" />
                      {ticket.numberOfPeople}名
                    </span>
                  </div>

                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => onOpenTicketDetail && onOpenTicketDetail(ticket)}
                      className="text-sm font-bold text-white hover:text-cyan-300 text-left transition cursor-pointer"
                    >
                      {ticket.representativeName || ticket.name} 様
                    </button>

                    <div className="mt-1 flex items-center gap-1 text-xs font-bold text-cyan-200">
                      <GraduationCap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>
                        {[
                          ticket.grade,
                          ticket.className,
                          ticket.attendanceNumber ? `${ticket.attendanceNumber}番` : ''
                        ].filter(Boolean).join(' ')}
                      </span>
                    </div>

                    {ticket.registeredAt && (
                      <p className="text-[10px] text-slate-400 mt-1 font-mono">
                        発券: {ticket.registeredAt}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleStageTransition(ticket, 'absent')}
                    className="text-[11px] text-slate-400 hover:text-rose-400 cursor-pointer transition"
                  >
                    キャンセル
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCallTicket(ticket)}
                    className="px-3.5 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 active:bg-pink-700 text-white font-bold text-xs shadow-md shadow-pink-600/30 transition flex items-center gap-1 cursor-pointer"
                  >
                    <Megaphone className="w-3.5 h-3.5" />
                    <span>搭乗呼出</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. 体験中・ミッション突入 & 保留 & 帰還完了 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* 体験中・ミッション中 */}
        <div className="bg-[#09112d]/90 border border-cyan-500/30 rounded-3xl p-5 shadow-xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>惑星朝日 潜入中 ({inProgressList.length})</span>
            </h4>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {inProgressList.length === 0 ? (
              <p className="text-center py-4 text-slate-400 text-xs">現在体験中の方はいません</p>
            ) : (
              inProgressList.map(t => (
                <div key={t.id} className="p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-cyan-300">#{t.ticketNumber}</span>{' '}
                    <span className="font-bold text-white">{t.name} 様</span>
                    <span className="text-[11px] text-slate-300 block">
                      {[t.grade, t.className, t.attendanceNumber ? `${t.attendanceNumber}番` : ''].filter(Boolean).join(' ')} ({t.numberOfPeople}名)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStageTransition(t, 'done')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-sm transition cursor-pointer"
                  >
                    地球帰還
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 保留・不在 */}
        <div className="bg-[#09112d]/90 border border-amber-500/30 rounded-3xl p-5 shadow-xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <PauseCircle className="w-4 h-4 text-amber-400" />
              <span>保留・不在 ({onHoldList.length})</span>
            </h4>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {onHoldList.length === 0 ? (
              <p className="text-center py-4 text-slate-400 text-xs">保留中の整理券はありません</p>
            ) : (
              onHoldList.map(t => (
                <div key={t.id} className="p-3 bg-amber-950/40 border border-amber-500/40 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono font-bold text-amber-300">#{t.ticketNumber}</span>{' '}
                    <span className="font-bold text-white">{t.name} 様</span>
                    <span className="text-[11px] text-slate-300 block">
                      {[t.grade, t.className, t.attendanceNumber ? `${t.attendanceNumber}番` : ''].filter(Boolean).join(' ')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStageTransition(t, 'waiting')}
                    className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-200 font-bold text-[11px] transition flex items-center gap-1 cursor-pointer"
                    title="待機列の末尾に戻す"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>復帰</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 地球帰還完了 */}
        <div className="bg-[#09112d]/90 border border-slate-800 rounded-3xl p-5 shadow-xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h4 className="font-bold text-white text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>地球帰還完了 ({doneList.length})</span>
            </h4>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {doneList.length === 0 ? (
              <p className="text-center py-4 text-slate-400 text-xs">完了した整理券はありません</p>
            ) : (
              doneList.slice(-5).reverse().map(t => (
                <div key={t.id} className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300">
                  <div>
                    <span className="font-mono font-bold text-cyan-300">#{t.ticketNumber}</span>{' '}
                    <span className="font-medium text-white">{t.name} 様</span>
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {t.completedAt ? `${t.completedAt} 完了` : '完了'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                    帰還済
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
