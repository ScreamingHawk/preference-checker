import type { FC } from 'react';
import type { Choice } from '../utils/topics';
import Button from './Button';

type Props = {
  choice: Choice;
  label: string;
  accent: 'cyan' | 'fuchsia';
  onPick: () => void;
  onImageLoad?: (id: string) => void;
  status?: 'idle' | 'selected' | 'dimmed';
  disabled?: boolean;
};

const DuelCard: FC<Props> = ({
  choice,
  label,
  accent,
  onPick,
  onImageLoad,
  status = 'idle',
  disabled = false,
}) => {
  const accentColor = accent === 'cyan' ? 'from-pink-400/25' : 'from-rose-400/25';
  const stateClass =
    status === 'selected'
      ? 'ring-4 ring-pink-200/80 brightness-110 shadow-lg shadow-pink-200/40 scale-[1.01]'
      : status === 'dimmed'
        ? 'opacity-35 saturate-50 scale-[0.985]'
        : '';
  return (
    <div
      className={`relative flex h-full flex-col overflow-hidden rounded-3xl bg-slate-900/60 p-4 shadow-xl ring-1 ring-white/5 transition duration-200 ease-out ${
        stateClass || 'hover:-translate-y-[2px] hover:ring-white/10'
      }`}
    >
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-transparent via-slate-900/50 to-slate-900/80" />
      <div className={`absolute inset-0 bg-gradient-to-br ${accentColor} to-transparent opacity-60`} />
      <div className="absolute inset-0 overflow-hidden">
        <img src={choice.image} alt="" className="h-full w-full object-cover opacity-45" loading="lazy" />
      </div>
      <div className="relative flex h-full flex-col gap-4">
        <div className="relative flex-1 min-h-[17rem] w-full overflow-hidden rounded-2xl border border-white/5 shadow-inner shadow-black/10 portrait:min-h-[18rem] landscape:min-h-[16rem]">
          <img
            src={choice.image}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            onLoad={() => onImageLoad?.(choice.id)}
          />
          {choice.type && (
            <span className="absolute left-3 top-3 z-10 rounded-full border border-white/10 bg-white/10 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-pink-100 backdrop-blur">
              {choice.type}
            </span>
          )}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 z-10 p-4 pt-16">
            <h3 className="text-xl font-semibold text-white drop-shadow-sm">{choice.name}</h3>
            <p className="mt-1 text-sm text-slate-100/85 drop-shadow-sm">{choice.description}</p>
          </div>
          {status === 'selected' && (
            <div className="absolute inset-0 bg-pink-200/20 blur-[1px] transition-opacity duration-150" />
          )}
          {status === 'dimmed' && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] transition-opacity duration-150" />
          )}
        </div>
        <Button
          onClick={onPick}
          className={`mt-auto rounded-xl px-4 py-3 text-sm shadow-[0_6px_18px_-10px_rgba(236,72,153,0.45)] ${
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
