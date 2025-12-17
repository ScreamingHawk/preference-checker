import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { loadTopicChoices, topics, type Choice, type TopicMeta } from '../utils/topics';
import { addUserTopic, loadSelectedTopicKey, loadUserTopicChoices, loadUserTopics, persistSelectedTopicKey } from '../utils/storage';

type TopicState = {
  topic: TopicMeta;
  choices: Choice[];
  loading: boolean;
  topics: TopicMeta[];
  setTopic: (topic: TopicMeta) => void;
  importTopic: (meta: Omit<TopicMeta, 'filename'>, choices: Choice[]) => TopicMeta;
};

const TopicContext = createContext<TopicState | undefined>(undefined);

const DEFAULT_TOPIC = topics[0];

const resolveInitialTopic = () => {
  const storedKey = loadSelectedTopicKey();
  if (!storedKey) return DEFAULT_TOPIC;
  const storedTopic = [...topics, ...loadUserTopics().map((item) => item.meta)].find((entry) => entry.filename === storedKey);
  return storedTopic ?? DEFAULT_TOPIC;
};

export const TopicProvider = ({ children }: { children: ReactNode }) => {
  const [topic, setTopicState] = useState<TopicMeta>(resolveInitialTopic);
  const [choices, setChoices] = useState<Choice[]>([]);
  const [loading, setLoading] = useState(true);
  const [userTopics, setUserTopics] = useState<TopicMeta[]>(() => loadUserTopics().map((item) => item.meta));

  useEffect(() => {
    let active = true;
    setLoading(true);
    setChoices([]);
    const maybeUserChoices = loadUserTopicChoices(topic.filename);
    const loader = maybeUserChoices
      ? Promise.resolve(maybeUserChoices)
      : loadTopicChoices(topic.filename).catch(() => []);

    loader
      .then((loaded) => {
        if (!active) return;
        setChoices(loaded);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
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

  const importTopic = useCallback((meta: Omit<TopicMeta, 'filename'>, importedChoices: Choice[]) => {
    const storedMeta = addUserTopic(meta, importedChoices);
    setUserTopics((current) => [...current, storedMeta]);
    return storedMeta;
  }, []);

  const mergedTopics = useMemo(() => [...topics, ...userTopics], [userTopics]);

  const value = useMemo(
    () => ({ topic, choices, loading, topics: mergedTopics, setTopic, importTopic }),
    [topic, choices, loading, mergedTopics, setTopic, importTopic],
  );

  return <TopicContext.Provider value={value}>{children}</TopicContext.Provider>;
};

export const useTopic = () => {
  const ctx = useContext(TopicContext);
  if (!ctx) throw new Error('useTopic must be used within TopicProvider');
  return ctx;
};

export const useTopicsList = () => {
  const ctx = useTopic();
  return ctx.topics;
};
