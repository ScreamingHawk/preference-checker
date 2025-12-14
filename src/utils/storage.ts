import type { Choice } from './topics';

export type RatingEntry = {
  rating: number;
  wins: number;
  losses: number;
  lastUpdated: number;
};

export type RatingMap = Record<string, RatingEntry>;

const STORAGE_KEY = 'preference-checker/ratings';
const BASE_RATING = 1200;
const K_FACTOR = 32;

const expectedScore = (player: number, opponent: number) => 1 / (1 + 10 ** ((opponent - player) / 400));

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

export const updateRatings = (map: RatingMap, winner: Choice, loser: Choice): RatingMap => {
  const winnerEntry = ensureEntry(map, winner);
  const loserEntry = ensureEntry(map, loser);

  const expectedWinner = expectedScore(winnerEntry.rating, loserEntry.rating);
  const expectedLoser = expectedScore(loserEntry.rating, winnerEntry.rating);

  const winnerRating = winnerEntry.rating + K_FACTOR * (1 - expectedWinner);
  const loserRating = loserEntry.rating + K_FACTOR * (0 - expectedLoser);

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
