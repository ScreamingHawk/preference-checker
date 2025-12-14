import { useState } from 'react';
import { choices, type Choice } from '../data/options';
import Header from './components/Header';
import DuelCard from './components/DuelCard';
import RankingsPanel from './components/RankingsPanel';
import { usePreferences } from './hooks/usePreferences';

const randomPair = (items: Choice[]): [Choice, Choice] => {
  const first = items[Math.floor(Math.random() * items.length)];
  let second = items[Math.floor(Math.random() * items.length)];
  while (second.id === first.id) {
    second = items[Math.floor(Math.random() * items.length)];
  }
  return [first, second];
};

const App = () => {
  const [view, setView] = useState<'arena' | 'rankings'>('arena');
  const [pair, setPair] = useState<[Choice, Choice]>(() => randomPair(choices));
  const [lastChoice, setLastChoice] = useState<'A' | 'B' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { ranked, recordResult, reset } = usePreferences(choices);

  const handlePick = (slot: 'A' | 'B') => {
    if (isTransitioning) return;
    const [a, b] = pair;
    const winner = slot === 'A' ? a : b;
    const loser = slot === 'A' ? b : a;
    setLastChoice(slot);
    const fadeTimeout = setTimeout(() => setIsTransitioning(true), 140);
    recordResult(winner, loser);
    setTimeout(() => {
      clearTimeout(fadeTimeout);
      setPair(randomPair(choices));
      setLastChoice(null);
      setIsTransitioning(false);
    }, 360);
  };

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 text-slate-50 sm:px-6 lg:px-10">
      <div className="floating-orb one" />
      <div className="floating-orb two" />
      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6">
        <Header active={view} onNavigate={setView} />

        {view === 'arena' && (
          <div className="grid gap-5">
            <div className="glass rounded-3xl p-5">
              <div className="flex items-center justify-between pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-pink-200/80">Choose your vibe</p>
                  <p className="text-xl font-semibold text-white">Make a call</p>
                </div>
                <div className="hidden text-right text-sm text-slate-300 sm:block" />
              </div>

              <div
                className="grid gap-4 sm:grid-cols-2 transition-all duration-300 ease-out"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning ? 'translateY(8px)' : 'translateY(0)',
                }}
              >
                <DuelCard
                  choice={pair[0]}
                  label="This one"
                  accent="cyan"
                  onPick={() => handlePick('A')}
                  status={lastChoice === null ? 'idle' : lastChoice === 'A' ? 'selected' : 'dimmed'}
                  disabled={isTransitioning}
                />
                <DuelCard
                  choice={pair[1]}
                  label="That one"
                  accent="fuchsia"
                  onPick={() => handlePick('B')}
                  status={lastChoice === null ? 'idle' : lastChoice === 'B' ? 'selected' : 'dimmed'}
                  disabled={isTransitioning}
                />
              </div>

              <div className="mt-4 text-center text-sm text-slate-300" aria-live="polite" />
            </div>
          </div>
        )}

        {view === 'rankings' && (
          <div className="grid gap-4">
            <RankingsPanel ranked={ranked} onReset={reset} />
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
