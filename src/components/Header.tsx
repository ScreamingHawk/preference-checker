import type { FC } from 'react';
import Button from './Button';

type Props = {
  onNavigate: (view: 'arena' | 'rankings' | 'topics') => void;
  active: 'arena' | 'rankings' | 'topics';
};

const Header: FC<Props> = ({ onNavigate, active }) => {
  return (
    <header className="flex items-center justify-between gap-3 rounded-2xl px-4 py-3 glass">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-300/20 text-lg text-pink-100 ring-2 ring-pink-300/50">
          ♥
        </div>
        <p className="text-lg font-semibold text-white">Pick what feels right</p>
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
        <Button
          variant={active === 'topics' ? 'solid' : 'ghost'}
          onClick={() => onNavigate('topics')}
          className={active === 'topics' ? '' : 'shadow-none text-slate-200'}
        >
          Topics
        </Button>
      </div>
    </header>
  );
};

export default Header;
