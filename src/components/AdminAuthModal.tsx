import React, { useState } from 'react';
import { Lock, Eye, EyeOff, ShieldCheck, AlertCircle, X, Loader2 } from 'lucide-react';
import { loginAdminWithScriptPassword } from '../firebase';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('パスワードを入力してください');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      await loginAdminWithScriptPassword(password.trim());
      setPassword('');
      setError(null);
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'パスワードが正しくありません。');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleClose = () => {
    setPassword('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#040817]/80 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="bg-[#09112d] rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-pink-500/40 relative space-y-5 backdrop-blur-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          aria-label="閉じる"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-1.5 pt-2">
          <div className="inline-flex p-3 rounded-2xl bg-pink-950/80 text-pink-300 border border-pink-500/50 mb-1 shadow-md shadow-pink-500/20">
            <Lock className="w-5 h-5 text-pink-400" />
          </div>
          <div className="text-[10px] font-mono tracking-widest text-cyan-400 font-bold uppercase">
            COMMAND OVERRIDE
          </div>
          <h3 className="text-base font-bold text-white font-cosmic-title">
            惑星朝日・司令室認証
          </h3>
          <p className="text-xs text-slate-300">
            クラス運営用セキュリティキーを入力してください
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-300">
              司令室パスコード
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                disabled={isVerifying}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="パスワードを入力"
                autoFocus
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-700 bg-slate-900/90 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-500 transition disabled:opacity-50 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition cursor-pointer"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-pink-950/80 border border-pink-500/50 text-xs text-pink-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-pink-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={isVerifying}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition cursor-pointer disabled:opacity-50"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={isVerifying || !password.trim()}
              className="flex-1 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-lg shadow-pink-600/30 cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  照合中...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  認証して突入
                </>
              )}
            </button>
          </div>
        </form>

        <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
          <p className="text-[11px] text-pink-300/90 font-mono">
            初期パスコード: <strong className="text-white underline tracking-wider font-bold">asahi2026</strong> または <strong className="text-white underline font-bold">admin</strong>
          </p>
        </div>

        <p className="text-[10px] text-slate-500 text-center leading-relaxed font-mono">
          SYSTEM ENCRYPTION SECURED
        </p>
      </div>
    </div>
  );
};
