import type { FC, ReactNode } from 'react';

type Props = {
  label: string;
  onPick: () => void;
  accent: 'cyan' | 'fuchsia';
  children?: ReactNode;
};

const ActionBar: FC<Props> = ({ label, onPick, accent, children }) => {
  const accentClasses =
    accent === 'cyan'
      ? 'bg-cyan-400 text-slate-900 shadow-lg shadow-cyan-500/40'
      : 'bg-fuchsia-400 text-slate-900 shadow-lg shadow-fuchsia-500/40';

  return (
    <div className="flex items-center justify-between rounded-2xl bg-slate-900/60 px-4 py-3">
      <div className="text-sm text-slate-200">{children}</div>
      <button
        onClick={onPick}
        className={`button-glow inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition hover:-translate-y-[1px] ${accentClasses}`}
      >
        Choose {label}
      </button>
    </div>
  );
};

export default ActionBar;
