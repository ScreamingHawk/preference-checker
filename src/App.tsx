import { useEffect, useMemo, useState } from 'react';
import Header from './components/Header';
import DuelCard from './components/DuelCard';
import RankingsPanel from './components/RankingsPanel';
import { usePreferences } from './hooks/usePreferences';
import { useTopic } from './context/TopicContext';
import type { Choice } from './utils/topics';
import TopicsPage from './components/TopicsPage';

const randomPair = (items: Choice[]): [Choice | null, Choice | null] => {
  if (items.length < 2) return [null, null];
  const first = items[Math.floor(Math.random() * items.length)];
  let second = items[Math.floor(Math.random() * items.length)];
  while (second.id === first.id) {
    second = items[Math.floor(Math.random() * items.length)];
  }
  return [first, second];
};

const App = () => {
  const [view, setView] = useState<'arena' | 'rankings' | 'topics'>('topics');
  const { choices, topic, loading } = useTopic();
  const [pair, setPair] = useState<[Choice | null, Choice | null]>([null, null]);
  const [lastChoice, setLastChoice] = useState<'A' | 'B' | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { ranked, recordResult, reset } = usePreferences(topic.filename, choices);

  useEffect(() => {
    if (choices.length >= 2) {
      setPair(randomPair(choices));
      setView((prev) => (prev === 'topics' ? 'arena' : prev));
    } else {
      setPair([null, null]);
    }
  }, [choices]);

  const handlePick = (slot: 'A' | 'B') => {
    if (isTransitioning) return;
    const [a, b] = pair;
    if (!a || !b) return;
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

        {view === 'topics' && (
          <div className="grid min-h-[60vh] gap-5">
            <TopicsPage onSelect={() => setView('arena')} />
          </div>
        )}

        {view === 'arena' && (
          <div className="grid gap-5">
            {(!pair[0] || !pair[1]) ? (
              <div className="rounded-2xl bg-slate-900/50 p-6 text-center text-sm text-slate-300">
                {loading ? 'Loading...' : 'Need at least two options to start.'}
              </div>
            ) : (
              <div
                className="grid items-stretch gap-4 sm:grid-cols-2 transition-all duration-300 ease-out"
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
            )}

            <div className="mt-4 text-center text-sm text-slate-300" aria-live="polite" />
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
