import type { Choice } from './topics';
import type { TopicMeta } from './topics';

export type RatingEntry = {
  rating: number;
  wins: number;
  losses: number;
  lastUpdated: number;
};

export type RatingMap = Record<string, RatingEntry>;

const STORAGE_KEY = 'preference-checker/ratings';
export const SELECTED_TOPIC_KEY = 'preference-checker/selected-topic';
const USER_TOPICS_KEY = 'preference-checker/user-topics';
const BASE_RATING = 1200;
const K_FACTOR = 32;
const PROVISIONAL_MAX_MULTIPLIER = 2.5;
const PROVISIONAL_GAMES_SCALE = 12;

const expectedScore = (player: number, opponent: number) => 1 / (1 + 10 ** ((opponent - player) / 400));

const kFactorForGamesPlayed = (gamesPlayed: number) => {
  const safeGamesPlayed = Math.max(0, gamesPlayed);
  const multiplier =
    1 + (PROVISIONAL_MAX_MULTIPLIER - 1) * Math.exp(-safeGamesPlayed / PROVISIONAL_GAMES_SCALE);
  return K_FACTOR * multiplier;
};

const ensureEntry = (map: RatingMap, choice: Choice): RatingEntry => {
  return (
    map[choice.id] ?? {
      rating: BASE_RATING,
      wins: 0,
      losses: 0,
      lastUpdated: Date.now(),
    }
  );
};

export const loadRatings = (topicKey: string): RatingMap => {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}/${topicKey}`);
    if (!raw) return {};
    return JSON.parse(raw) as RatingMap;
  } catch (error) {
    console.warn('Unable to read ratings', error);
    return {};
  }
};

export const persistRatings = (topicKey: string, map: RatingMap) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(`${STORAGE_KEY}/${topicKey}`, JSON.stringify(map));
  } catch (error) {
    console.warn('Unable to persist ratings', error);
  }
};

export const loadSelectedTopicKey = (): string | null => {
  if (typeof localStorage === 'undefined') return null;
  try {
    return localStorage.getItem(SELECTED_TOPIC_KEY);
  } catch (error) {
    console.warn('Unable to read selected topic', error);
    return null;
  }
};

export const persistSelectedTopicKey = (topicKey: string) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(SELECTED_TOPIC_KEY, topicKey);
  } catch (error) {
    console.warn('Unable to persist selected topic', error);
  }
};

export type StoredUserTopic = {
  meta: TopicMeta;
  choices: Choice[];
  createdAt: number;
};

const safeParseJson = <T,>(raw: string): T | null => {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const loadUserTopics = (): StoredUserTopic[] => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(USER_TOPICS_KEY);
    if (!raw) return [];
    const parsed = safeParseJson<StoredUserTopic[]>(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to read user topics', error);
    return [];
  }
};

export const persistUserTopics = (topics: StoredUserTopic[]) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(USER_TOPICS_KEY, JSON.stringify(topics));
  } catch (error) {
    console.warn('Unable to persist user topics', error);
  }
};

export const loadUserTopicChoices = (filename: string): Choice[] | null => {
  const found = loadUserTopics().find((topic) => topic.meta.filename === filename);
  return found?.choices ?? null;
};

const generateUserTopicId = () => {
  const cryptoApi = typeof crypto !== 'undefined' ? crypto : undefined;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const addUserTopic = (meta: Omit<TopicMeta, 'filename'>, choices: Choice[]): TopicMeta => {
  const id = generateUserTopicId();
  const filename = `user-topics/${id}.json`;
  const stored: StoredUserTopic = { meta: { ...meta, filename }, choices, createdAt: Date.now() };
  const next = [...loadUserTopics(), stored];
  persistUserTopics(next);
  return stored.meta;
};

export const updateRatings = (map: RatingMap, winner: Choice, loser: Choice): RatingMap => {
  const winnerEntry = ensureEntry(map, winner);
  const loserEntry = ensureEntry(map, loser);

  const expectedWinner = expectedScore(winnerEntry.rating, loserEntry.rating);
  const expectedLoser = expectedScore(loserEntry.rating, winnerEntry.rating);

  const winnerGames = winnerEntry.wins + winnerEntry.losses;
  const loserGames = loserEntry.wins + loserEntry.losses;

  const winnerK = kFactorForGamesPlayed(winnerGames);
  const loserK = kFactorForGamesPlayed(loserGames);

  const winnerRating = winnerEntry.rating + winnerK * (1 - expectedWinner);
  const loserRating = loserEntry.rating + loserK * (0 - expectedLoser);

  return {
    ...map,
    [winner.id]: {
      rating: Math.round(winnerRating),
      wins: winnerEntry.wins + 1,
      losses: winnerEntry.losses,
      lastUpdated: Date.now(),
    },
    [loser.id]: {
      rating: Math.round(loserRating),
      wins: loserEntry.wins,
      losses: loserEntry.losses + 1,
      lastUpdated: Date.now(),
    },
  };
};

export { BASE_RATING };
