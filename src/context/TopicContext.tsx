import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadTopicChoices, topics, type Choice, type TopicMeta } from '../utils/topics';
import { loadSelectedTopicKey, persistSelectedTopicKey } from '../utils/storage';

type TopicState = {
  topic: TopicMeta;
  choices: Choice[];
  loading: boolean;
  setTopic: (topic: TopicMeta) => void;
};

const TopicContext = createContext<TopicState | undefined>(undefined);

const DEFAULT_TOPIC = topics[0];

const resolveInitialTopic = () => {
  const storedKey = loadSelectedTopicKey();
  if (!storedKey) return DEFAULT_TOPIC;
  const storedTopic = topics.find((entry) => entry.filename === storedKey);
  return storedTopic ?? DEFAULT_TOPIC;
};

export const TopicProvider = ({ children }: { children: ReactNode }) => {
  const [topic, setTopicState] = useState<TopicMeta>(resolveInitialTopic);
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

  useEffect(() => {
    persistSelectedTopicKey(topic.filename);
  }, [topic]);

  const setTopic = useCallback((next: TopicMeta) => {
    setTopicState(next);
  }, []);

  const value = useMemo(() => ({ topic, choices, loading, setTopic }), [topic, choices, loading, setTopic]);

  return <TopicContext.Provider value={value}>{children}</TopicContext.Provider>;
};

export const useTopic = () => {
  const ctx = useContext(TopicContext);
  if (!ctx) throw new Error('useTopic must be used within TopicProvider');
  return ctx;
};

export const useTopicsList = () => topics;
