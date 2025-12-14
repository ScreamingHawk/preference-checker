import type { FC } from 'react';
import type { Choice } from '../utils/topics';
import Button from './Button';

type Props = {
  choice: Choice;
  label: string;
  accent: 'cyan' | 'fuchsia';
  onPick: () => void;
  status?: 'idle' | 'selected' | 'dimmed';
  disabled?: boolean;
};

const DuelCard: FC<Props> = ({ choice, label, accent, onPick, status = 'idle', disabled = false }) => {
  const accentColor = accent === 'cyan' ? 'from-pink-400/25' : 'from-rose-400/25';
  const stateClass =
    status === 'selected'
      ? 'ring-4 ring-pink-200/80 brightness-110 shadow-lg shadow-pink-200/40 scale-[1.01]'
      : status === 'dimmed'
        ? 'opacity-35 saturate-50 scale-[0.985]'
        : '';
  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-slate-900/60 p-4 shadow-xl ring-1 ring-white/5 transition duration-200 ease-out ${
        stateClass || 'hover:-translate-y-[2px] hover:ring-white/10'
      }`}
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-transparent via-slate-900/50 to-slate-900/80" />
      <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} to-transparent opacity-60`} />
      <div className="absolute inset-0 overflow-hidden">
        <img src={choice.image} alt="" className="h-full w-full object-cover opacity-45" loading="lazy" />
      </div>
      <div className="relative flex h-full flex-col justify-between gap-3">
        <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-white/5 shadow-inner shadow-black/10 sm:h-80">
          <img src={choice.image} alt="" className="h-full w-full object-cover" loading="lazy" />
          {status === 'selected' && (
            <div className="absolute inset-0 bg-pink-200/20 blur-[1px] transition-opacity duration-150" />
          )}
          {status === 'dimmed' && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-150" />
          )}
        </div>
        <div className="mt-2">
          <h3 className="text-2xl font-semibold text-white">{choice.name}</h3>
          <p className="mt-2 text-sm text-slate-200/80">{choice.description}</p>
        </div>
        <Button
          onClick={onPick}
          className={`button-glow mt-2 rounded-xl px-4 py-3 text-sm ${
            accent === 'cyan'
              ? 'bg-pink-200 text-slate-900 shadow-pink-300/30 hover:brightness-110'
            : 'bg-rose-200 text-slate-900 shadow-rose-300/30 hover:brightness-110'
          }`}
          disabled={disabled}
        >
          {label}
        </Button>
      </div>
    </div>
  );
};

export default DuelCard;
