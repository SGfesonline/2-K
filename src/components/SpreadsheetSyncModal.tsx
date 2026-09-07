import React, { useState } from 'react';
import { TicketRecord } from '../types';
import { exportTicketsToCSV, exportTicketsToTSV } from '../utils/spreadsheet';
import { 
  FileSpreadsheet, 
  X, 
  Download, 
  Copy, 
  CheckCheck, 
  CheckCircle2, 
  Table, 
  Users, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

interface SpreadsheetSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickets: TicketRecord[];
  onImportTickets?: (tickets: TicketRecord[]) => void;
}

export const SpreadsheetSyncModal: React.FC<SpreadsheetSyncModalProps> = ({
  isOpen,
  onClose,
  tickets,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  // 統計集計
  const totalTickets = tickets.length;
  const totalPeople = tickets.reduce((acc, t) => acc + (t.numberOfPeople || 1), 0);
  const completedCount = tickets.filter(t => t.queueStatus === 'done').length;
  const waitingCount = tickets.filter(t => t.queueStatus === 'waiting').length;

  // CSVダウンロード処理（UTF-8 with BOM for Excel/Sheets）
  const handleDownloadCSV = () => {
    const csvContent = exportTicketsToCSV(tickets);
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    link.href = url;
    link.setAttribute('download', `惑星朝日_整理券結果_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // スプレッドシート用コピー処理（TSV）
  const handleCopyTSV = async () => {
    try {
      const tsvContent = exportTicketsToTSV(tickets);
      await navigator.clipboard.writeText(tsvContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // フォールバック
      const textarea = document.createElement('textarea');
      textarea.value = exportTicketsToTSV(tickets);
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#040817]/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-[#09112d] rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-emerald-500/40 relative space-y-5 backdrop-blur-xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold tracking-widest text-emerald-400 uppercase bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  DATA EXPORT
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white font-cosmic-title">
                整理券・来場結果データ出力
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 統計サマリーバッジ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">総発券組数</span>
            <span className="text-lg font-mono font-bold text-white">{totalTickets} 組</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">総搭乗人数</span>
            <span className="text-lg font-mono font-bold text-pink-400">{totalPeople} 名</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">帰還完了</span>
            <span className="text-lg font-mono font-bold text-emerald-400">{completedCount} 組</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
            <span className="text-[11px] text-slate-400 block">待機中</span>
            <span className="text-lg font-mono font-bold text-cyan-400">{waitingCount} 組</span>
          </div>
        </div>

        {/* 出力ボタングループ */}
        <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              スプレッドシート・Excel 連携出力
            </span>
            <span className="text-[11px] text-slate-400">
              ※ 事前名簿読込は不要化されました
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* CSVダウンロード */}
            <button
              type="button"
              onClick={handleDownloadCSV}
              disabled={tickets.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <CheckCheck className="w-4 h-4 text-white" />
                  <span>CSVを出力しました！</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>CSVファイルをダウンロード</span>
                </>
              )}
            </button>

            {/* スプレッドシート用コピー */}
            <button
              type="button"
              onClick={handleCopyTSV}
              disabled={tickets.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-cyan-300 font-bold text-xs transition border border-cyan-500/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>表データをコピーしました！</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-cyan-400" />
                  <span>シート貼付用にコピー (TSV)</span>
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            💡「シート貼付用にコピー」を押して、Googleスプレッドシートの空きセルを選択して 
            <kbd className="px-1.5 py-0.5 mx-1 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-white">Ctrl + V</kbd> 
            するだけで、学年クラス・代表者名・人数・状況がセルごとに一括ペーストされます。
          </p>
        </div>

        {/* 出力データプレビュー表 */}
        <div className="flex-1 overflow-hidden flex flex-col space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 font-bold text-slate-300">
              <Table className="w-3.5 h-3.5 text-cyan-400" />
              出力対象データ（全 {tickets.length} 件）
            </span>
            <span className="text-[11px]">整理番号・代表者・人数</span>
          </div>

          <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-800 bg-slate-950/60 divide-y divide-slate-800/80 text-xs">
            {tickets.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                整理券データがありません
              </div>
            ) : (
              tickets.slice(0, 30).map((t) => (
                <div key={t.id} className="p-2.5 px-3 flex items-center justify-between hover:bg-slate-900/50 transition">
                  <div className="flex items-center gap-3">
                    <span className="w-8 font-mono font-bold text-cyan-400">
                      #{String(t.ticketNumber).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{t.representativeName || t.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                          {t.numberOfPeople || 1}名
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {t.grade && t.className ? `${t.grade}${t.className}` : (t.attribute || t.grade || '一般')}
                        {t.attendanceNumber ? ` ${t.attendanceNumber}番` : ''} ｜ 時間: {t.timeSlot || '即時'}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    t.queueStatus === 'done'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                      : t.queueStatus === 'called'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {t.queueStatus === 'done' ? '帰還完了' : t.queueStatus === 'called' ? '呼出中' : '待機中'}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* フッター */}
        <div className="pt-2 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
