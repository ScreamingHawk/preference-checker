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
  const [ratings, setRatings] = useState<RatingMap>({});

  useEffect(() => {
    setRatings(loadRatings(topicKey));
  }, [topicKey]);

  useEffect(() => {
    persistRatings(topicKey, ratings);
  }, [topicKey, ratings]);

  const ranked = useMemo<RankedChoice[]>(() => {
    return choices
      .map((choice) => {
        const entry = ratings[choice.id] ?? { rating: BASE_RATING, wins: 0, losses: 0 };
        return { choice, rating: entry.rating, wins: entry.wins, losses: entry.losses };
      })
      .sort((a, b) => {
        if (b.rating !== a.rating) return b.rating - a.rating;
        if (b.wins !== a.wins) return b.wins - a.wins;
        return a.choice.name.localeCompare(b.choice.name);
      });
  }, [choices, ratings]);

  const totalBattles = useMemo(
    () => Object.values(ratings).reduce((acc, entry) => acc + entry.wins + entry.losses, 0),
    [ratings],
  );

  const recordResult = (winner: Choice, loser: Choice) => {
    setRatings((prev) => updateRatings(prev, winner, loser));
  };

  const reset = () => setRatings({});

  const topPick = ranked[0];

  return { ranked, totalBattles, recordResult, reset, topPick };
};
