import React from 'react';
import { TicketRecord } from '../types';
import { TIME_SLOTS } from '../utils/storage';
import { normalizeTimeSlot } from '../utils/spreadsheet';
import { Clock } from 'lucide-react';

interface TimeSlotGridProps {
  tickets: TicketRecord[];
}

export const TimeSlotGrid: React.FC<TimeSlotGridProps> = ({
  tickets,
}) => {
  const SLOT_CAPACITY = 8;

  const allUniqueSlots = Array.from(
    new Set([
      ...tickets.map(t => normalizeTimeSlot(t.timeSlot).slot).filter(Boolean),
      ...TIME_SLOTS
    ])
  ).sort((a, b) => a.localeCompare(b));

  const slotStats = allUniqueSlots.map(slot => {
    const slotTickets = tickets.filter(t => normalizeTimeSlot(t.timeSlot).slot === slot);
    const reserved = slotTickets.length;
    const completed = slotTickets.filter(t => t.queueStatus === 'done' || t.attendance === 'completed').length;
    const pending = reserved - completed;
    const available = Math.max(0, SLOT_CAPACITY - reserved);

    return {
      slot,
      tickets: slotTickets,
      reserved,
      completed,
      pending,
      available,
      percentage: Math.min(100, Math.round((reserved / SLOT_CAPACITY) * 100))
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#09112d]/90 border border-cyan-500/30 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] tracking-widest uppercase font-bold">
                TIMETABLE SLOTS
              </span>
            </div>
            <h2 className="text-lg font-black text-white mt-1 flex items-center gap-2 font-cosmic-title">
              <Clock className="w-5 h-5 text-cyan-400" />
              <span>時間帯別・搭乗ミッション配分</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1">
              各時間帯枠ごとの搭乗予約数、地球帰還（出席）状況および残枠を確認できます
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> 空き枠あり
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/40 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-400" /> 残りわずか
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-pink-950/80 text-pink-300 border border-pink-500/40 font-bold">
              <span className="w-2 h-2 rounded-full bg-pink-400" /> 満員
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {slotStats.map((item) => {
          const isFull = item.available === 0;
          const isCrowded = item.available <= 2 && !isFull;

          return (
            <div
              key={item.slot}
              className={`bg-[#09112d]/90 border rounded-2xl p-4 shadow-lg backdrop-blur-xl flex flex-col justify-between ${
                isFull
                  ? 'border-pink-500/40'
                  : isCrowded
                  ? 'border-amber-500/40'
                  : 'border-slate-800 hover:border-cyan-500/30'
              }`}
            >
              <div>
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="font-bold text-sm text-white font-mono">{item.slot}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    isFull
                      ? 'bg-pink-950 text-pink-300 border border-pink-500/40'
                      : isCrowded
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                  }`}>
                    {isFull ? '満員' : `空き ${item.available}枠`}
                  </span>
                </div>

                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                    <span className="text-slate-400">予約搭乗 ({item.reserved}/{SLOT_CAPACITY}組)</span>
                    <span className="font-bold text-cyan-300 font-mono">{item.percentage}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex border border-slate-700">
                    <div
                      style={{ width: `${Math.min(100, (item.completed / SLOT_CAPACITY) * 100)}%` }}
                      className="bg-emerald-500 h-full"
                      title={`帰還完了: ${item.completed}組`}
                    />
                    <div
                      style={{ width: `${Math.min(100, (item.pending / SLOT_CAPACITY) * 100)}%` }}
                      className="bg-cyan-500 h-full"
                      title={`未完了（待機中・ミッション中）: ${item.pending}組`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 mt-3.5 text-center text-[11px]">
                  <div className="p-2 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200">
                    <div className="text-[10px] text-emerald-400 font-medium">地球帰還</div>
                    <div className="font-mono font-bold text-sm">{item.completed}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-cyan-950/50 border border-cyan-500/30 text-cyan-200">
                    <div className="text-[10px] text-cyan-400 font-medium">待機・探索</div>
                    <div className="font-mono font-bold text-sm">{item.pending}</div>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-200">
                    <div className="text-[10px] text-slate-400 font-medium">空き枠</div>
                    <div className="font-mono font-bold text-sm">{item.available}</div>
                  </div>
                </div>

                {item.tickets.length > 0 && (
                  <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                    {item.tickets.map(t => {
                      const isDone = t.queueStatus === 'done' || t.attendance === 'completed';
                      return (
                        <span 
                          key={t.id}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] ${
                            isDone
                              ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-500/40'
                              : 'bg-slate-900 text-cyan-200 border border-slate-800'
                          }`}
                        >
                          #{t.ticketNumber} {t.name}
                          <span className="text-[9px] opacity-75">
                            {isDone ? '(帰還済)' : '(未)'}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <span>予約合計: {item.tickets.length}組</span>
                <span>定員: {SLOT_CAPACITY}組</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
