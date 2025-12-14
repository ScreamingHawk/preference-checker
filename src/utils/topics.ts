import topicsManifest from '../../data/topics.json';

export type Choice = {
  id: string;
  name: string;
  description: string;
  image: string;
  type?: string;
};

export type TopicMeta = {
  name: string;
  description: string;
  filename: string;
};

export const topics: TopicMeta[] = topicsManifest;

const topicLoaders = import.meta.glob('../../data/topics/*.json', { import: 'default' });

export const loadTopicChoices = async (filename: string): Promise<Choice[]> => {
  const key = `../../data/${filename}`;
  const loader = topicLoaders[key];
  if (!loader) {
    console.warn(`Topic file not found: ${filename}`);
    return [];
  }
  const data = await loader();
  return data as Choice[];
};
