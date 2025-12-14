import type { FC } from 'react';
import type { Choice } from '../utils/topics';
import type { SwipeDirection } from '../hooks/useSwipe';

export type SwipeCardProps = {
  choice: Choice;
  delta: number;
  onSwipe: (dir: SwipeDirection) => void;
  onPointerDown: (clientX: number) => void;
  onPointerMove: (clientX: number) => void;
  onPointerUp: () => void;
};

const SwipeCard: FC<SwipeCardProps> = ({ choice, delta, onSwipe, onPointerDown, onPointerMove, onPointerUp }) => {
  const abs = Math.abs(delta);
  const direction: SwipeDirection | null = abs > 40 ? (delta > 0 ? 'like' : 'skip') : null;
  const rotation = delta / 18;
  const translate = delta;
  const intensity = Math.min(abs / 160, 1);

  const handlePointerDownInternal = (clientX: number) => {
    onPointerDown(clientX);
  };

  return (
    <div className="relative h-[420px] w-full select-none sm:h-[520px]">
      <div
        className="pointer-events-none absolute inset-0 rounded-[20px] bg-[radial-gradient(circle_at_40%_20%,rgba(244,114,182,0.1),transparent_50%),radial-gradient(circle_at_80%_0%,rgba(249,168,212,0.1),transparent_50%)]"
        aria-hidden
      />
      <div
        className="absolute inset-0 rounded-3xl border border-white/5 bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-transparent shadow-[0_10px_30px_-12px_rgba(236,72,153,0.25)] backdrop-blur transition duration-200 ease-out"
        style={{
          transform: `translateX(${translate}px) rotate(${rotation}deg) scale(${1 - Math.min(abs / 3200, 0.05)})`,
          opacity: 0.98,
          filter: `drop-shadow(0 20px 30px rgba(0,0,0,0.${Math.min(4 + abs / 25, 8).toFixed(0)})`,
        }}
        onPointerDown={(event) => handlePointerDownInternal(event.clientX)}
        onPointerMove={(event) => onPointerMove(event.clientX)}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onTouchStart={(event) => handlePointerDownInternal(event.touches[0]?.clientX ?? 0)}
        onTouchMove={(event) => onPointerMove(event.touches[0]?.clientX ?? 0)}
        onTouchEnd={onPointerUp}
        role="presentation"
      >
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div
            className="absolute inset-0 bg-gradient-to-br from-pink-200/20 via-slate-900/30 to-rose-200/20"
            style={{ opacity: 0.2 + intensity * 0.5 }}
          />
          <img src={choice.image} alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" loading="lazy" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.14),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(249,168,212,0.18),transparent_35%)]" />
        </div>

        <div className="relative flex h-full flex-col justify-between p-6">
          <div className="space-y-3">
            <h2 className="text-3xl font-semibold leading-tight text-white sm:text-4xl">{choice.name}</h2>
            <p className="text-base text-slate-200/80 sm:text-lg">{choice.description}</p>
          </div>
        </div>

        {direction && (
          <div
            className={`pointer-events-none absolute inset-0 rounded-3xl border-2 text-5xl font-semibold tracking-wide ${
              direction === 'like'
                ? 'border-pink-200/80 bg-pink-200/10 text-pink-100'
                : 'border-rose-200/80 bg-rose-200/10 text-rose-100'
            }`}
            style={{ opacity: 0.25 + intensity * 0.6 }}
          >
            <div className={`absolute ${direction === 'like' ? 'right-6 top-6' : 'left-6 top-6'}`}>
              {direction === 'like' ? 'LIKE' : 'SKIP'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SwipeCard;
