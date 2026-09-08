import React, { useState, useRef } from 'react';
import posterImage from '../assets/poster.jpg';
import { 
  Rocket, 
  Compass, 
  Camera, 
  Sparkles, 
  MapPin, 
  Users, 
  Clock, 
  ShieldAlert, 
  Ticket, 
  Maximize2, 
  X, 
  FileText, 
  Image as ImageIcon
} from 'lucide-react';

interface AttractionInfoSectionProps {
  onIssueTicketClick?: () => void;
  onGoToTicket?: () => void;
  waitingCount?: number;
  callingCount?: number;
}

export const AttractionInfoSection: React.FC<AttractionInfoSectionProps> = ({
  onIssueTicketClick,
  onGoToTicket,
  waitingCount,
  callingCount,
}) => {
  const [isPosterModalOpen, setIsPosterModalOpen] = useState(false);
  const posterRef = useRef<HTMLDivElement>(null);

  const handleTicketAction = onGoToTicket || onIssueTicketClick;

  const scrollToPoster = () => {
    posterRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const pdfUrl = `${import.meta.env.BASE_URL || './'}poster.pdf`;
  const posterSrc = posterImage || `${import.meta.env.BASE_URL || './'}poster.jpg`;

  return (
    <div id="attraction-info" className="relative z-10 w-full max-w-4xl mx-auto space-y-8 scroll-mt-24">
      <section className="relative overflow-hidden rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#0b1335]/95 via-[#070f2b]/95 to-[#040817] shadow-2xl p-6 sm:p-8 backdrop-blur-xl space-y-6">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-orbitron">CLASS 2-K</span>
              <span className="text-cyan-400/60">|</span>
              <span>文化祭クラス企画</span>
            </div>

            {(typeof waitingCount === 'number' || typeof callingCount === 'number') && (
              <div className="inline-flex items-center gap-3 p-2 px-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs">
                <span className="text-slate-400">搭乗待機:</span>
                <span className="font-mono font-bold text-cyan-300">{waitingCount ?? 0}組</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">現在呼出:</span>
                <span className="font-mono font-bold text-pink-400">{callingCount ?? 0}組</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight neon-text-pink font-cosmic-title">
              今日、迷子になりました。
            </h1>
            <div className="text-2xl sm:text-3xl font-black tracking-wider neon-text-cyan flex items-center justify-center sm:justify-start gap-2">
              <span>～惑星朝日編～</span>
              <span className="text-xs px-2.5 py-0.5 rounded-md bg-cyan-900/60 border border-cyan-400/30 text-cyan-200 font-mono">
                MISSION 2-K
              </span>
            </div>
          </div>

          <p className="text-base sm:text-lg font-bold text-amber-300 tracking-wide flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
            <span>輝く星空の裏に潜む謎。あなたは無事に地球へ帰れるか！？</span>
          </p>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl font-medium">
            宇宙旅行中に不時着したのは……見知らぬ「<span className="text-cyan-300 font-bold">惑星朝日</span>」！？<br className="hidden sm:inline" />
            謎解きで壊れた宇宙船を修理し、危険な迷路を突破して無事に地球へ帰還せよ！<br />
            <strong className="text-pink-300">２年K組の教室が、プラネタリウムのような幻想的な宇宙空間に大変身！</strong>
          </p>
        </div>

        <div className="relative z-10 space-y-3 pt-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <h3 className="text-sm font-bold text-cyan-300 tracking-wider font-orbitron uppercase">
              MISSION HIGHLIGHTS
            </h3>
            <span className="text-xs text-slate-400">（アトラクション見どころ）</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs">
                  01
                </div>
                <Compass className="w-4 h-4 text-cyan-400" />
              </div>
              <h4 className="font-bold text-cyan-200 text-sm">
                幻想のプラネタリウム迷路
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                2年K組の教室が暗黒の宇宙空間に！頭上に広がる満天の星空の下、立ちはだかる未知の迷路をチームで突破してください。
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-pink-950/40 border border-pink-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold text-xs">
                  02
                </div>
                <Rocket className="w-4 h-4 text-pink-400" />
              </div>
              <h4 className="font-bold text-pink-200 text-sm">
                宇宙船修理の暗号謎解き
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                不時着の衝撃で故障した宇宙船「2-K号」。迷路の各所に散らばるエネルギーキーと暗号を解き明かし、エンジンを再起動せよ！
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-purple-950/40 border border-purple-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs">
                  03
                </div>
                <Camera className="w-4 h-4 text-amber-300" />
              </div>
              <h4 className="font-bold text-purple-200 text-sm">
                映える宇宙フォトスポット
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                見知らぬ惑星朝日での記念撮影！幻想的なネオンと宇宙船コックピットを模した映えスポットで最高の1枚を撮影できます。
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">開催場所</span>
              <span className="font-bold text-white">高校棟 2年K組 教室</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">体験時間</span>
              <span className="font-bold text-white">約 10 〜 15 分</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-pink-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">参加人数</span>
              <span className="font-bold text-white">1名 〜 10名（1グループ）</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[11px]">注意事項</span>
              <span className="font-bold text-white">室内が暗いため足元注意</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
          {handleTicketAction && (
            <button
              type="button"
              onClick={handleTicketAction}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:from-pink-500 hover:to-rose-500 text-white font-black text-sm tracking-wider shadow-lg shadow-pink-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 cursor-pointer neon-border-pink"
            >
              <Ticket className="w-4 h-4" />
              <span>整理券（搭乗パス）を発行する ↓</span>
            </button>
          )}

          <button
            type="button"
            onClick={scrollToPoster}
            className="px-5 py-3 rounded-2xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 font-bold text-xs border border-cyan-500/40 transition flex items-center gap-2 cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-cyan-400" />
            <span>公式ポスターを見る ↓</span>
          </button>
        </div>
      </section>

      <section 
        ref={posterRef} 
        className="scroll-mt-20 relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-[#09112d]/90 to-[#040817] shadow-2xl p-5 sm:p-8 backdrop-blur-xl space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white font-cosmic-title flex items-center gap-2">
                <span>2年K組 公式ポスター</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-pink-950 text-pink-300 border border-pink-500/30 font-mono">
                  K.pdf
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                クリックすると全画面で高解像度ポスターを拡大閲覧できます
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsPosterModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-bold flex items-center gap-1.5 transition cursor-pointer border border-cyan-500/30"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>全画面拡大</span>
            </button>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold flex items-center gap-1.5 transition border border-slate-700"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>PDFで開く</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center">
          <div 
            onClick={() => setIsPosterModalOpen(true)}
            className="relative rounded-2xl overflow-hidden border-2 border-cyan-400/40 shadow-2xl bg-slate-950 group cursor-pointer max-w-md w-full aspect-[1/1.414] transition duration-300 hover:border-pink-500/80 hover:shadow-pink-500/20"
            title="クリックしてポスターを全画面拡大"
          >
            <img
              src={posterSrc}
              alt="文化祭 2年K組 公式ポスター「今日、迷子になりました。～惑星朝日編～」"
              className="w-full h-full object-cover object-center transform group-hover:scale-102 transition duration-500"
            />
            
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white font-bold text-sm backdrop-blur-xs">
              <Maximize2 className="w-5 h-5 text-cyan-300" />
              <span>クリックで全画面拡大</span>
            </div>

            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-pink-600/95 text-white text-[11px] font-black border border-pink-300 shadow-md">
              2年K組
            </div>
          </div>

          {handleTicketAction && (
            <div className="pt-4">
              <button
                type="button"
                onClick={handleTicketAction}
                className="px-6 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow-md shadow-pink-600/30 transition flex items-center gap-2 cursor-pointer"
              >
                <Ticket className="w-4 h-4" />
                <span>整理券（搭乗パス）を発行する ↓</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {isPosterModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#040817]/95 backdrop-blur-md animate-in fade-in"
          onClick={() => setIsPosterModalOpen(false)}
        >
          <div 
            className="relative max-w-2xl w-full max-h-[92vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 text-white">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-cyan-300">2年K組 公式ポスター</span>
                <span className="text-[10px] text-slate-400 font-mono">（高解像度 2893 × 4091 px）</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-cyan-300 flex items-center gap-1 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  PDFを開く
                </a>
                <button
                  type="button"
                  onClick={() => setIsPosterModalOpen(false)}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden border border-cyan-500/40 shadow-2xl bg-black max-h-[84vh] overflow-y-auto">
              <img
                src={posterSrc}
                alt="公式ポスター拡大"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
