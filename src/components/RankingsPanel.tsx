import type { FC } from 'react';
import type { RankedChoice } from '../hooks/usePreferences';
import { BASE_RATING } from '../utils/storage';
import Button from './Button';

type Props = {
  ranked: RankedChoice[];
  onReset: () => void;
};

const RankingsPanel: FC<Props> = ({ ranked, onReset }) => {
  const maxRating = ranked[0]?.rating ?? BASE_RATING;

  return (
    <div className="h-full rounded-3xl border border-white/5 bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-transparent p-5 text-slate-50 shadow-[0_10px_30px_-12px_rgba(236,72,153,0.25)] backdrop-blur">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-pink-200/80">Rankings</p>
          <p className="text-lg font-semibold">Scores from your picks</p>
        </div>
        <Button variant="subtle" onClick={onReset} className="text-xs font-semibold">
          Reset
        </Button>
      </div>
      <div className="space-y-3 pb-2">
        {ranked.map((entry, idx) => {
          const ratio = maxRating ? entry.rating / maxRating : 0;
          return (
            <div
              key={entry.choice.id}
              className="relative overflow-hidden rounded-2xl border border-white/5 bg-slate-900/60 p-4"
            >
              <div className="mb-2 flex items-start gap-3">
                <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                  <img src={entry.choice.image} alt="" className="h-full w-full object-cover" loading="lazy" />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-pink-200">#{idx + 1}</span>
                    <p className="text-lg font-semibold text-white">{entry.choice.name}</p>
                  </div>
                  <div className="flex flex-col items-end text-sm font-semibold text-cyan-100">
                      <span className="text-lg text-pink-100">{entry.rating} score</span>
                      <span className="text-xs text-slate-400">{entry.wins} wins / {entry.losses} losses</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative h-2 overflow-hidden rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-pink-300 via-rose-400 to-fuchsia-400"
                  style={{ width: `${Math.max(ratio * 100, entry.rating > BASE_RATING ? 12 : 4)}%`, transition: 'width 250ms ease' }}
                />
              </div>
            </div>
          );
        })}
        {ranked.every((item) => item.wins === 0 && item.losses === 0) && null}
      </div>
    </div>
  );
};

export default RankingsPanel;
