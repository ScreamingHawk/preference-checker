import type { FC } from 'react';
import Button from './Button';

type Props = {
  onNavigate: (view: 'arena' | 'rankings') => void;
  active: 'arena' | 'rankings';
};

const Header: FC<Props> = ({ onNavigate, active }) => {
  return (
    <header className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 glass">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-900/60 ring-2 ring-pink-300/50" />
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-pink-200/80">Preference Checker</p>
          <p className="text-lg font-semibold text-white">Pick what feels right</p>
        </div>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <Button
          variant={active === 'arena' ? 'solid' : 'ghost'}
          onClick={() => onNavigate('arena')}
          className={active === 'arena' ? '' : 'shadow-none text-slate-200'}
        >
          Arena
        </Button>
        <Button
          variant={active === 'rankings' ? 'solid' : 'ghost'}
          onClick={() => onNavigate('rankings')}
          className={active === 'rankings' ? 'bg-white text-slate-900 shadow-lg shadow-white/20' : 'shadow-none text-slate-200'}
        >
          Rankings
        </Button>
      </div>
    </header>
  );
};

export default Header;
