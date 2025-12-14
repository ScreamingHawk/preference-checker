import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadTopicChoices, topics, type Choice, type TopicMeta } from '../utils/topics';

type TopicState = {
  topic: TopicMeta;
  choices: Choice[];
  loading: boolean;
  setTopic: (topic: TopicMeta) => void;
};

const TopicContext = createContext<TopicState | undefined>(undefined);

const DEFAULT_TOPIC = topics[0];

export const TopicProvider = ({ children }: { children: ReactNode }) => {
  const [topic, setTopic] = useState<TopicMeta>(DEFAULT_TOPIC);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    loadTopicChoices(topic.filename)
      .then((loaded) => {
        if (active) setChoices(loaded);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [topic]);

  const value = useMemo(() => ({ topic, choices, loading, setTopic }), [topic, choices, loading]);

  return <TopicContext.Provider value={value}>{children}</TopicContext.Provider>;
};

export const useTopic = () => {
  const ctx = useContext(TopicContext);
  if (!ctx) throw new Error('useTopic must be used within TopicProvider');
  return ctx;
};

export const useTopicsList = () => topics;
