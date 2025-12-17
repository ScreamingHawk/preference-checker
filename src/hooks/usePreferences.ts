import { useEffect, useMemo, useState } from 'react';
import type { Choice } from '../utils/topics';
import { BASE_RATING, loadRatings, persistRatings, updateRatings, type RatingMap } from '../utils/storage';

export type RankedChoice = {
  choice: Choice;
  rating: number;
  wins: number;
  losses: number;
};

export const usePreferences = (topicKey: string, choices: Choice[]) => {
  const [ratingsState, setRatingsState] = useState<{ topicKey: string; ratings: RatingMap }>(() => ({
    topicKey,
    ratings: loadRatings(topicKey),
  }));

  useEffect(() => {
    setRatingsState((prev) => {
      if (prev.topicKey === topicKey) return prev;
      return { topicKey, ratings: loadRatings(topicKey) };
    });
  }, [topicKey]);

  useEffect(() => {
    if (ratingsState.topicKey !== topicKey) return;
    persistRatings(topicKey, ratingsState.ratings);
  }, [ratingsState, topicKey]);

  const ranked = useMemo<RankedChoice[]>(() => {
    return choices
      .map((choice) => {
        const entry = ratingsState.ratings[choice.id] ?? { rating: BASE_RATING, wins: 0, losses: 0 };
        return { choice, rating: entry.rating, wins: entry.wins, losses: entry.losses };
      })
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.choice.name.localeCompare(b.choice.name);
      });
  }, [choices, ratingsState.ratings]);

  const totalBattles = useMemo(
    () => Object.values(ratingsState.ratings).reduce((acc, entry) => acc + entry.wins + entry.losses, 0),
    [ratingsState.ratings],
  );

  const recordResult = (winner: Choice, loser: Choice) => {
    setRatingsState((prev) => ({ ...prev, ratings: updateRatings(prev.ratings, winner, loser) }));
  };

  const reset = () => setRatingsState((prev) => ({ ...prev, ratings: {} }));

  const topPick = ranked[0];

  const ratingsReady = ratingsState.topicKey === topicKey;

  return { ranked, totalBattles, recordResult, reset, topPick, ratingsReady };
};
