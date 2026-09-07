import React, { useState } from 'react';
import { TicketRecord, CLASS_OPTIONS, GradeType } from '../types';
import { 
  Rocket, 
  Users, 
  User, 
  GraduationCap, 
  School, 
  Hash, 
  Lock,
  Eye,
  EyeOff,
  Sparkles, 
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { createFestivalTicket, TicketIssueInput } from '../utils/ticketGenerator';

interface TicketIssueFormProps {
  existingTickets: TicketRecord[];
  onTicketCreated: (newTicket: TicketRecord) => Promise<void> | void;
  projectName?: string;
  isCompact?: boolean;
}

const GRADE_OPTIONS: GradeType[] = ['1年', '2年', '3年', '教職員', '保護者・一般'];

export const TicketIssueForm: React.FC<TicketIssueFormProps> = ({
  existingTickets,
  onTicketCreated,
  projectName = '今日、迷子になりました。～惑星朝日編～',
}) => {
  const [numberOfPeople, setNumberOfPeople] = useState<number>(1);
  const [representativeName, setRepresentativeName] = useState<string>('');
  const [grade, setGrade] = useState<GradeType>('1年');
  const [className, setClassName] = useState<string>('A組');
  const [attendanceNumber, setAttendanceNumber] = useState<string>('');
  const [accessPassword, setAccessPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // 教職員・保護者・一般のときはクラスと出席番号を非表示にする
  const isStudent = grade === '1年' || grade === '2年' || grade === '3年';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = representativeName.trim();
    if (!trimmedName) {
      setError('代表者のお名前を入力してください');
      return;
    }

    if (isStudent) {
      if (!className) {
        setError('クラスを選択してください');
        return;
      }
      if (!attendanceNumber.trim()) {
        setError('出席番号を入力してください');
        return;
      }
    }

    const trimmedPassword = accessPassword.trim();
    if (!trimmedPassword) {
      setError('確認用パスワードを入力してください（整理券を開く際に必要です）');
      return;
    }
    if (trimmedPassword.length < 3) {
      setError('パスワードは3文字以上で設定してください');
      return;
    }

    setIsSubmitting(true);
    try {
      const input: TicketIssueInput = {
        numberOfPeople: Math.max(1, numberOfPeople),
        representativeName: trimmedName,
        grade,
        className: isStudent ? className : undefined,
        attendanceNumber: isStudent ? attendanceNumber.trim() : undefined,
        accessPassword: trimmedPassword,
        projectName
      };

      const newTicket = createFestivalTicket(input, existingTickets);
      await onTicketCreated(newTicket);
    } catch (err) {
      console.error('Failed to issue ticket:', err);
      setError('整理券の発行に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-[#09112d]/90 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
      {/* 宇宙船ターミナルの装飾光 */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 text-center space-y-2">
        <div className="inline-flex p-3 rounded-2xl bg-pink-950/80 border border-pink-500/40 text-pink-400 mb-1 shadow-md shadow-pink-500/20">
          <Rocket className="w-6 h-6 transform -rotate-45" />
        </div>
        <div className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] tracking-widest uppercase">
          MISSION BOARDING PASS REGISTRATION
        </div>
        <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight font-cosmic-title">
          整理券（宇宙ミッション搭乗券）の発行
        </h2>
        <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
          人数と代表者情報を入力して搭乗券を発行してください。<br />
          後から整理券を開くために<span className="font-bold text-cyan-300">代表者名</span>と<span className="font-bold text-pink-300">パスワード</span>を使用します。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative z-10 space-y-5 text-left">
        {/* 1. 人数 */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>搭乗人数</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-900/80 text-pink-200 border border-pink-500/40">必須</span>
            </span>
            <span className="text-cyan-300/80 font-normal text-[11px]">一緒に挑戦する人数（1〜10名）</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNumberOfPeople(prev => Math.max(1, prev - 1))}
              className="w-11 h-11 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-lg font-bold flex items-center justify-center transition active:scale-95 cursor-pointer disabled:opacity-30"
              disabled={numberOfPeople <= 1}
              aria-label="人数を減らす"
            >
              -
            </button>
            <div className="flex-1 text-center py-2.5 px-3 bg-slate-900/80 border border-cyan-500/30 rounded-2xl font-bold text-white flex items-center justify-center gap-2 shadow-inner">
              <span className="text-2xl font-black font-mono text-cyan-300">{numberOfPeople}</span>
              <span className="text-xs text-slate-300 font-medium">名様</span>
            </div>
            <button
              type="button"
              onClick={() => setNumberOfPeople(prev => Math.min(10, prev + 1))}
              className="w-11 h-11 rounded-2xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-cyan-300 text-lg font-bold flex items-center justify-center transition active:scale-95 cursor-pointer disabled:opacity-30"
              disabled={numberOfPeople >= 10}
              aria-label="人数を増やす"
            >
              +
            </button>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5">
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setNumberOfPeople(num)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  numberOfPeople === num
                    ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white font-bold shadow-md shadow-pink-600/30 border border-pink-400'
                    : 'bg-slate-800/70 border border-slate-700/80 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                {num}名
              </button>
            ))}
          </div>
        </div>

        {/* 2. 代表者名 */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <User className="w-4 h-4 text-cyan-400" />
            <span>代表者名（搭乗クルー代表）</span>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-900/80 text-pink-200 border border-pink-500/40">必須</span>
          </label>
          <input
            type="text"
            required
            value={representativeName}
            onChange={(e) => {
              setRepresentativeName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="お名前を入力"
            className="w-full px-4 py-3 text-sm bg-slate-900/90 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
          />
        </div>

        {/* 3. 学年・属性 */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span>学年・区分</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-900/80 text-pink-200 border border-pink-500/40">必須</span>
            </span>
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
            {GRADE_OPTIONS.map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => {
                  setGrade(g);
                  if (error) setError(null);
                }}
                className={`py-2 px-2 rounded-xl text-xs font-semibold text-center transition border cursor-pointer ${
                  grade === g
                    ? 'bg-cyan-600 text-white font-bold border-cyan-400 shadow-md shadow-cyan-600/30'
                    : 'bg-slate-900/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* 4. クラス & 出席番号 (生徒の場合のみ表示: 教職員・保護者・一般は非表示) */}
        {isStudent && (
          <div className="space-y-3 p-4 bg-slate-900/90 border border-cyan-500/30 rounded-2xl">
            {/* クラス選択 (A〜L) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <School className="w-4 h-4 text-cyan-400" />
                  <span>クラス（A〜L組）</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-900/80 text-pink-200 border border-pink-500/40">必須</span>
                </span>
                <span className="text-cyan-300 font-mono text-[11px]">選択中: {className}</span>
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                {CLASS_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setClassName(c);
                      if (error) setError(null);
                    }}
                    className={`py-2 text-xs font-bold rounded-xl transition border cursor-pointer ${
                      className === c
                        ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-pink-400 shadow-sm'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            {/* 出席番号 */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-cyan-400" />
                  <span>出席番号</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-900/80 text-pink-200 border border-pink-500/40">必須</span>
                </span>
                <span className="text-slate-400 font-normal text-[11px]">半角数字</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="99"
                  required={isStudent}
                  value={attendanceNumber}
                  onChange={(e) => {
                    setAttendanceNumber(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="出席番号を入力"
                  className="w-full px-4 py-2.5 text-sm bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-hidden focus:border-cyan-400 transition font-mono font-bold"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-cyan-400 font-medium">
                  番
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 5. 発行時の確認用パスワード設定 */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800">
          <label className="block text-xs font-bold text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-pink-400" />
              <span>確認用パスワード（後で開く合言葉）</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-900/80 text-pink-200 border border-pink-500/40">必須</span>
            </span>
            <span className="text-pink-300 font-normal text-[11px]">3文字以上</span>
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={accessPassword}
              onChange={(e) => {
                setAccessPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="パスワードを入力（3文字以上）"
              className="w-full px-4 py-3 text-sm bg-slate-900/90 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-hidden focus:border-pink-400 focus:ring-1 focus:ring-pink-400 transition font-mono"
            />
            <button
              type="button"
              onClick={() => setShowPassword(prev => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
              aria-label={showPassword ? 'パスワードを隠す' : 'パスワードを表示'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[11px] text-slate-400">
            ※ 発行後に「整理券を開く」画面で、<strong>代表者名</strong>とこの<strong>パスワード</strong>を入力して照会します。
          </p>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="p-3 bg-red-950/80 border border-red-500/40 text-red-200 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* 発行ボタン */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-pink-500 hover:from-pink-500 hover:to-rose-500 text-white font-black text-sm tracking-wider shadow-xl shadow-pink-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group neon-border-pink"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>搭乗券を発行・転送中...</span>
            </div>
          ) : (
            <>
              <Rocket className="w-4 h-4 group-hover:-translate-y-0.5 group-hover:rotate-6 transition-transform text-pink-200" />
              <span>搭乗券（整理券）を発行する</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};

