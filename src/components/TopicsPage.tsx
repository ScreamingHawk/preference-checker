import type { FC } from 'react';
import Button from './Button';
import { useTopic, useTopicsList } from '../context/TopicContext';

const TopicsPage: FC<{ onSelect?: () => void }> = ({ onSelect }) => {
  const { topic, setTopic } = useTopic();
  const topics = useTopicsList();

  return (
    <div className="rounded-3xl border border-white/5 bg-gradient-to-br from-pink-500/10 via-rose-500/5 to-transparent p-5 shadow-[0_10px_30px_-12px_rgba(236,72,153,0.25)] backdrop-blur">
      <div className="mb-4">
        <p className="text-xl font-semibold text-white">Pick a topic to explore</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {topics.map((item) => {
          const active = item.filename === topic.filename;
          return (
            <div
              key={item.filename}
              className={`rounded-2xl border px-4 py-3 transition ${
                active ? 'border-pink-300/60 bg-pink-200/10' : 'border-white/5 bg-slate-900/60 hover:border-white/10'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-white">{item.name}</p>
                  <p className="text-xs text-slate-300">{item.description}</p>
                </div>
                {active && <span className="rounded-full bg-pink-200/30 px-2 py-1 text-xs text-pink-50">Active</span>}
              </div>
              <div className="mt-3">
                <Button
                  variant={active ? 'subtle' : 'solid'}
                  className="px-3 py-2 text-sm"
                  onClick={() => {
                    setTopic(item);
                    onSelect?.();
                  }}
                >
                  {active ? 'Selected' : 'Use this'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TopicsPage;
