import { describe, expect, it } from 'vitest';
import { BASE_RATING, updateRatings } from './storage';
import type { Choice } from './topics';

const choice = (id: string): Choice => ({
  id,
  name: id,
  description: '',
  image: '',
});

describe('updateRatings', () => {
  it('moves ratings more for low-game (provisional) entries', () => {
    const a = choice('a');
    const b = choice('b');

    const first = updateRatings({}, a, b);
    const firstDelta = first[a.id].rating - BASE_RATING;

    const establishedMap = {
      [a.id]: { rating: BASE_RATING, wins: 25, losses: 25, lastUpdated: Date.now() },
      [b.id]: { rating: BASE_RATING, wins: 25, losses: 25, lastUpdated: Date.now() },
    };
    const later = updateRatings(establishedMap, a, b);
    const laterDelta = later[a.id].rating - BASE_RATING;

    expect(firstDelta).toBeGreaterThan(laterDelta);
    expect(firstDelta).toBeGreaterThanOrEqual(32);
    expect(laterDelta).toBeLessThanOrEqual(20);
  });

  it('applies K-factor per entry (new ratings move more than established)', () => {
    const newcomer = choice('new');
    const veteran = choice('vet');

    const map = {
      [veteran.id]: { rating: BASE_RATING, wins: 40, losses: 40, lastUpdated: Date.now() },
    };

    const updated = updateRatings(map, newcomer, veteran);
    const newcomerDelta = updated[newcomer.id].rating - BASE_RATING;
    const veteranDelta = updated[veteran.id].rating - BASE_RATING;

    expect(newcomerDelta).toBeGreaterThan(0);
    expect(veteranDelta).toBeLessThan(0);
    expect(newcomerDelta).toBeGreaterThan(Math.abs(veteranDelta));
  });
});

