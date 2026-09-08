import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Megaphone,
  PauseCircle, 
  Users,
  GraduationCap,
  Lock,
  Clock
} from 'lucide-react';
import { TicketRecord, QueueStatus } from '../types';
import { NotificationManager } from '../utils/notifications';

interface TicketDetailModalProps {
  ticket: TicketRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTicket?: (id: string, partial: Partial<TicketRecord>) => void;
  waitingPosition?: number;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onUpdateTicket,
}) => {
  const [notifSent, setNotifSent] = useState(false);

  if (!isOpen || !ticket) return null;

  const handleTestPushNotification = async () => {
    await NotificationManager.requestPermission();
    await NotificationManager.sendLocalNotification(
      '整理券呼出テスト',
      `${ticket.name} 様、順番になりました。企画ブースまでお越しください。`,
      `call-${ticket.ticketNumber}`
    );
    setNotifSent(true);
    setTimeout(() => setNotifSent(false), 4000);
  };

  const handleStatusChange = (status: QueueStatus) => {
    if (!onUpdateTicket) return;
    const updates: Partial<TicketRecord> = { queueStatus: status };
    if (status === 'called') {
      updates.calledAt = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      updates.calledTimestamp = Date.now();
      updates.callCount = (ticket.callCount || 0) + 1;
    } else if (status === 'done') {
      updates.completedAt = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    }
    onUpdateTicket(ticket.id, updates);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040817]/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#09112d] border border-cyan-500/40 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden animate-scale-in">
        <div className="bg-gradient-to-r from-cyan-950 via-[#0b163b] to-pink-950 text-white p-5 flex items-center justify-between border-b border-cyan-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/50 flex items-center justify-center font-mono font-black text-xl text-cyan-300 shadow-md shadow-cyan-500/20">
              #{ticket.ticketNumber}
            </div>
            <div>
              <div className="text-[10px] text-cyan-300 font-mono tracking-widest uppercase font-bold">
                CREW MEMBER PROFILE
              </div>
              <div className="text-base sm:text-lg font-bold text-white flex items-center gap-2 font-cosmic-title">
                <span>{ticket.representativeName || ticket.name} 様</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-950/80 border border-pink-500/40 text-pink-300 font-mono">
                  {ticket.numberOfPeople}名
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">学年・クラス・出席番号</span>
              <span className="font-bold text-cyan-200 flex items-center gap-1 mt-0.5">
                <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
                {[ticket.grade, ticket.className, ticket.attendanceNumber ? `${ticket.attendanceNumber}番` : ''].filter(Boolean).join(' ') || '一般・教職員'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">搭乗人数</span>
              <span className="font-bold text-pink-300 flex items-center gap-1 mt-0.5 font-mono">
                <Users className="w-3.5 h-3.5 text-pink-400" />
                {ticket.numberOfPeople} 名
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">発券日時</span>
              <span className="font-bold text-slate-300 flex items-center gap-1 mt-0.5 font-mono">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                {ticket.registeredAt || '本日'}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block text-[11px]">照合パスコード</span>
              <span className="font-mono font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                {ticket.accessPassword ? '••••（設定済）' : '未設定'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              ミッション進行ステータスの変更
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange('waiting')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  ticket.queueStatus === 'waiting'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                待機中
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('called')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  ticket.queueStatus === 'called'
                    ? 'bg-pink-600 text-white shadow-xs'
                    : 'bg-pink-950/60 hover:bg-pink-900/60 text-pink-300 border border-pink-500/40'
                }`}
              >
                <Megaphone className="w-3 h-3" />
                搭乗呼出
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('in_progress')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  ticket.queueStatus === 'in_progress'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40'
                }`}
              >
                惑星突入中
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('done')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                  ticket.queueStatus === 'done'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                地球帰還
              </button>
            </div>

            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={() => handleStatusChange('on_hold')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1 cursor-pointer ${
                  ticket.queueStatus === 'on_hold'
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800'
                }`}
              >
                <PauseCircle className="w-3 h-3 text-amber-400" />
                保留
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('absent')}
                className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-medium transition flex items-center justify-center gap-1 cursor-pointer ${
                  ticket.queueStatus === 'absent'
                    ? 'bg-slate-700 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                キャンセル
              </button>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-white block">呼出アラートの直接通信</span>
              <span className="text-[11px] text-slate-400">搭乗クルーのブラウザ/端末へ緊急シグナルを送信</span>
            </div>
            <button
              type="button"
              onClick={handleTestPushNotification}
              className="px-3 py-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold transition flex items-center gap-1 shadow-md shadow-pink-600/30 shrink-0 cursor-pointer"
            >
              <Send className="w-3 h-3" />
              シグナル送信
            </button>
          </div>

          {notifSent && (
            <div className="p-2.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>呼出シグナルを送信しました。</span>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
