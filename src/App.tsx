import { useEffect, useState } from 'react';
import Header from './components/Header';
import DuelCard from './components/DuelCard';
import RankingsPanel from './components/RankingsPanel';
import { usePreferences } from './hooks/usePreferences';
import { useTopic } from './context/TopicContext';
import TopicsPage from './components/TopicsPage';
import type { Choice } from './utils/topics';

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
  const [pendingImages, setPendingImages] = useState<string[]>([]);
  const [loadedImages, setLoadedImages] = useState<string[]>([]);
  const { ranked, recordResult, reset } = usePreferences(topic.filename, choices);

  useEffect(() => {
    if (choices.length >= 2) {
      setPair(randomPair(choices));
      setView((prev) => (prev === 'topics' ? 'arena' : prev));
    } else {
      setPair([null, null]);
    }
  }, [choices]);

  useEffect(() => {
    const ids = pair.map((item) => item?.id).filter(Boolean) as string[];
    setPendingImages(ids);
    setLoadedImages([]);
    if (!ids.length) {
      setIsTransitioning(false);
    }
  }, [pair]);

  useEffect(() => {
    if (pendingImages.length && loadedImages.length >= pendingImages.length) {
      setIsTransitioning(false);
    }
  }, [loadedImages, pendingImages]);

  useEffect(() => {
    if (!pendingImages.length) return;
    const fallback = window.setTimeout(() => setIsTransitioning(false), 1600);
    return () => clearTimeout(fallback);
  }, [pendingImages]);

  const handleImageLoad = (id: string) => {
    if (!pendingImages.includes(id)) return;
    setLoadedImages((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

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
    }, 360);
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_20%_20%,rgba(244,114,182,0.12),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(249,168,212,0.14),transparent_40%),#14070f] px-4 py-4 text-slate-50 sm:px-6 sm:py-6 lg:px-10">
      <div className="pointer-events-none absolute -top-16 -left-20 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(244,114,182,0.35),transparent_60%)] blur-[50px] opacity-30 animate-[drift_18s_ease-in-out_infinite_alternate]" />
      <div className="pointer-events-none absolute -bottom-16 -right-20 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle,rgba(249,168,212,0.35),transparent_55%)] blur-[50px] opacity-30 animate-[drift_18s_ease-in-out_infinite_alternate] [animation-delay:1.5s]" />
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
                className="grid auto-rows-fr items-stretch gap-4 transition-all duration-300 ease-out portrait:grid-cols-1 landscape:min-h-[calc(100dvh-160px)] landscape:h-[calc(100dvh-160px)] landscape:grid-cols-2 lg:landscape:min-h-[calc(100dvh-200px)] lg:landscape:h-[calc(100dvh-200px)]"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning ? 'translateY(8px)' : 'translateY(0)',
                }}
              >
                <div className="flex h-full min-h-[70dvh] flex-col landscape:min-h-[calc(100dvh-160px)] landscape:h-full lg:landscape:min-h-[calc(100dvh-200px)] lg:landscape:h-full">
                  <DuelCard
                    choice={pair[0]}
                    label="This one"
                    accent="cyan"
                    onPick={() => handlePick('A')}
                    onImageLoad={handleImageLoad}
                    status={lastChoice === null ? 'idle' : lastChoice === 'A' ? 'selected' : 'dimmed'}
                    disabled={isTransitioning}
                  />
                </div>
                <div className="flex h-full min-h-[70dvh] flex-col landscape:min-h-[calc(100dvh-160px)] landscape:h-full lg:landscape:min-h-[calc(100dvh-200px)] lg:landscape:h-full">
                  <DuelCard
                    choice={pair[1]}
                    label="That one"
                    accent="fuchsia"
                    onPick={() => handlePick('B')}
                    onImageLoad={handleImageLoad}
                    status={lastChoice === null ? 'idle' : lastChoice === 'B' ? 'selected' : 'dimmed'}
                    disabled={isTransitioning}
                  />
                </div>
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
