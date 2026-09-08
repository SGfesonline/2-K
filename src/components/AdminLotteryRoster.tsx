import React, { useState, useMemo } from 'react';
import { 
  Search, 
  FileSpreadsheet,
  Users,
  GraduationCap,
  Lock,
  Megaphone,
  CheckCircle2
} from 'lucide-react';
import { TicketRecord, QueueStatus } from '../types';
import { ticketMatchesSearchQuery } from '../utils/studentIdMatcher';

interface AdminLotteryRosterProps {
  tickets: TicketRecord[];
  onUpdateLotteryResult?: (ticketId: string, result: string) => void;
  onUpdateTicket?: (ticketId: string, updates: Partial<TicketRecord>) => void;
  onOpenSpreadsheet?: () => void;
}

export const AdminLotteryRoster: React.FC<AdminLotteryRosterProps> = ({
  tickets,
  onUpdateTicket,
  onOpenSpreadsheet
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'waiting' | 'called' | 'in_progress' | 'done' | 'on_hold'>('all');

  const filteredTickets = useMemo(() => {
    return tickets
      .slice()
      .sort((a, b) => a.ticketNumber - b.ticketNumber)
      .filter((t) => {
        if (searchQuery.trim()) {
          if (!ticketMatchesSearchQuery(t, searchQuery.trim())) {
            return false;
          }
        }

        if (statusFilter !== 'all') {
          return t.queueStatus === statusFilter;
        }

        return true;
      });
  }, [tickets, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const totalTickets = tickets.length;
    const totalPeople = tickets.reduce((sum, t) => sum + (t.numberOfPeople || 1), 0);
    const waiting = tickets.filter(t => t.queueStatus === 'waiting').length;
    const called = tickets.filter(t => t.queueStatus === 'called').length;
    const inProgress = tickets.filter(t => t.queueStatus === 'in_progress').length;
    const completed = tickets.filter(t => t.queueStatus === 'done').length;

    return {
      totalTickets,
      totalPeople,
      waiting,
      called,
      inProgress,
      completed
    };
  }, [tickets]);

  const handleStatusChange = (ticketId: string, status: QueueStatus) => {
    if (!onUpdateTicket) return;
    const updates: Partial<TicketRecord> = { queueStatus: status };
    if (status === 'called') {
      updates.calledAt = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
      updates.calledTimestamp = Date.now();
    } else if (status === 'done') {
      updates.completedAt = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });
    }
    onUpdateTicket(ticketId, updates);
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#09112d]/90 rounded-3xl p-5 border border-cyan-500/30 shadow-xl backdrop-blur-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] tracking-widest uppercase font-bold">
                CREW MANIFEST
              </span>
            </div>
            <h3 className="font-bold text-white text-base flex items-center gap-2 mt-1 font-cosmic-title">
              <Users className="w-4 h-4 text-pink-400" />
              <span>全搭乗クルー・整理券台帳</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              発行された全整理券の管理・進行状況および安全照合一覧です
            </p>
          </div>

          {onOpenSpreadsheet && (
            <button
              type="button"
              onClick={onOpenSpreadsheet}
              className="px-3 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer shadow-xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>結果CSV・シート出力</span>
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3 py-1.5 rounded-xl bg-pink-950/60 border border-pink-500/40 text-pink-200 font-bold font-mono">
            総発券数: <span className="text-white">{stats.totalTickets} 組</span> / 合計搭乗: <span className="text-pink-400">{stats.totalPeople} 名</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-medium">
            待機: <span className="font-bold text-cyan-300 font-mono">{stats.waiting} 組</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-pink-950/80 border border-pink-500/40 text-pink-300 font-medium">
            呼出中: <span className="font-bold text-pink-200 font-mono">{stats.called} 組</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-medium">
            帰還完了: <span className="font-bold text-emerald-200 font-mono">{stats.completed} 組</span>
          </div>
        </div>
      </div>

      <div className="bg-[#09112d]/90 rounded-2xl p-3 border border-slate-800 shadow-xl backdrop-blur-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="整理番号、名前、学年クラスで検索..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-900/90 text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-400 font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            全員 ({tickets.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('waiting')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
              statusFilter === 'waiting'
                ? 'bg-cyan-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            待機中 ({stats.waiting})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('called')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
              statusFilter === 'called'
                ? 'bg-pink-600 text-white shadow-xs'
                : 'bg-pink-950/60 text-pink-300 border border-pink-500/40'
            }`}
          >
            呼出中 ({stats.called})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('done')}
            className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
              statusFilter === 'done'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            帰還完了 ({stats.completed})
          </button>
        </div>
      </div>

      <div className="bg-[#09112d]/90 rounded-3xl border border-slate-800 shadow-xl backdrop-blur-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/90 border-b border-slate-800 text-xs text-cyan-300 font-bold font-mono">
                <th className="py-3 px-4 w-16 text-center border-r border-slate-800">番号</th>
                <th className="py-3 px-4 min-w-[140px] border-r border-slate-800">代表クルー名</th>
                <th className="py-3 px-4 w-20 text-center border-r border-slate-800">人数</th>
                <th className="py-3 px-4 min-w-[160px] border-r border-slate-800">学年・クラス・番号</th>
                <th className="py-3 px-4 w-28 border-r border-slate-800">発券日時</th>
                <th className="py-3 px-4 w-28 text-center border-r border-slate-800">照合パス</th>
                <th className="py-3 px-4 w-32 text-center border-r border-slate-800">進行状態</th>
                <th className="py-3 px-4 min-w-[120px] text-center">指令</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-xs">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    該当する搭乗券データがありません
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => {
                  return (
                    <tr key={ticket.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 text-center font-mono font-bold text-cyan-300 border-r border-slate-800">
                        #{ticket.ticketNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-white border-r border-slate-800">
                        {ticket.representativeName || ticket.name} 様
                      </td>
                      <td className="py-3 px-4 text-center border-r border-slate-800">
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-pink-950/80 text-pink-300 border border-pink-500/40 font-mono">
                          {ticket.numberOfPeople}名
                        </span>
                      </td>
                      <td className="py-3 px-4 border-r border-slate-800">
                        <div className="flex items-center gap-1 font-bold text-cyan-200">
                          <GraduationCap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>
                            {[
                              ticket.grade,
                              ticket.className,
                              ticket.attendanceNumber ? `${ticket.attendanceNumber}番` : ''
                            ].filter(Boolean).join(' ') || '一般・教職員'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-400 border-r border-slate-800 font-mono text-[11px]">
                        {ticket.registeredAt || '本日'}
                      </td>
                      <td className="py-3 px-4 text-center border-r border-slate-800">
                        {ticket.accessPassword ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 font-mono">
                            <Lock className="w-3 h-3" />
                            設定済
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">未設定</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center border-r border-slate-800">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          ticket.queueStatus === 'called'
                            ? 'bg-pink-600 text-white animate-pulse'
                            : ticket.queueStatus === 'in_progress'
                            ? 'bg-cyan-600 text-white'
                            : ticket.queueStatus === 'done'
                            ? 'bg-emerald-600 text-white'
                            : ticket.queueStatus === 'on_hold'
                            ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                            : 'bg-slate-800 text-slate-300'
                        }`}>
                          {ticket.queueStatus === 'called' ? '呼出中' :
                           ticket.queueStatus === 'in_progress' ? '潜入中' :
                           ticket.queueStatus === 'done' ? '帰還完了' :
                           ticket.queueStatus === 'on_hold' ? '保留' :
                           ticket.queueStatus === 'absent' ? '取消' : '待機中'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {ticket.queueStatus === 'waiting' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(ticket.id, 'called')}
                              className="px-2.5 py-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white font-bold text-[11px] transition flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Megaphone className="w-3 h-3" />
                              <span>呼出</span>
                            </button>
                          )}
                          {ticket.queueStatus === 'called' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(ticket.id, 'in_progress')}
                              className="px-2.5 py-1 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-[11px] transition cursor-pointer"
                            >
                              突入
                            </button>
                          )}
                          {ticket.queueStatus === 'in_progress' && (
                            <button
                              type="button"
                              onClick={() => handleStatusChange(ticket.id, 'done')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition cursor-pointer"
                            >
                              帰還
                            </button>
                          )}
                          {ticket.queueStatus === 'done' && (
                            <span className="text-emerald-400 text-[11px] flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              帰還済
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
