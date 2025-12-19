import { render, screen, waitFor, act, within } from '@testing-library/react';
import { beforeEach, vi } from 'vitest';
import React from 'react';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import App from './App';
import { TopicProvider } from './context/TopicContext';
import { SELECTED_TOPIC_KEY } from './utils/storage';

// Basic smoke test to ensure the app renders without runtime errors

beforeEach(() => {
  localStorage.clear();
});

type TopicEntry = { id: string; name: string; description?: string; image: string };
type TopicMeta = { name: string; description: string; filename: string };

const loadTopicEntries = (topicFilename: string): TopicEntry[] => {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const normalized = topicFilename.replace(/^topics\//, '');
  const topicPath = path.join(testDir, '..', 'data', 'topics', normalized);
  return JSON.parse(readFileSync(topicPath, 'utf8')) as TopicEntry[];
};

const selectExpectedPairNames = (entries: TopicEntry[]) => {
  return entries
    .map((entry) => entry.name)
    .slice()
    .sort((a, b) => a.localeCompare(b))
    .slice(0, 2);
};

const loadTopicsMeta = (): TopicMeta[] => {
  const testDir = path.dirname(fileURLToPath(import.meta.url));
  const topicsPath = path.join(testDir, '..', 'data', 'topics.json');
  return JSON.parse(readFileSync(topicsPath, 'utf8')) as TopicMeta[];
};

test('app renders topics and can reach arena without crashing', async () => {
  render(
    <TopicProvider>
      <App />
    </TopicProvider>,
  );

  // Topics page should show heading
  expect(await screen.findByText(/pick a topic to explore/i)).toBeInTheDocument();

  // choose first topic button
  const useButtons = screen.getAllByRole('button', { name: /use this|selected/i });
  expect(useButtons.length).toBeGreaterThan(0);
  act(() => {
    useButtons[0].click();
  });

  await waitFor(() => {
    expect(screen.getByRole('button', { name: /this one/i })).toBeInTheDocument();
  });
});

test('switching topics refreshes the arena pair', async () => {
  const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0);
  const topics = loadTopicsMeta();
  const [firstTopic, secondTopic] = topics;
  expect(firstTopic).toBeDefined();
  expect(secondTopic).toBeDefined();
  const firstPair = selectExpectedPairNames(loadTopicEntries(firstTopic.filename));
  const secondPair = selectExpectedPairNames(loadTopicEntries(secondTopic.filename));

  render(
    <TopicProvider>
      <App />
    </TopicProvider>,
  );

  act(() => {
    screen.getByRole('button', { name: /topics/i }).click();
  });

  expect(await screen.findByText(/pick a topic to explore/i)).toBeInTheDocument();

  act(() => {
    screen.getByRole('button', { name: /selected/i }).click();
  });

  expect(await screen.findByText(firstPair[0])).toBeInTheDocument();
  expect(screen.getByText(firstPair[1])).toBeInTheDocument();

  act(() => {
    screen.getByRole('button', { name: /topics/i }).click();
  });

  const nextCardTitle = await screen.findByText(secondTopic.name);
  const nextCard = nextCardTitle.closest(`[data-topic-card="${secondTopic.filename}"]`);
  expect(nextCard).not.toBeNull();

  act(() => {
    within(nextCard as HTMLElement).getByRole('button', { name: /use this/i }).click();
  });

  expect(await screen.findByText(secondPair[0])).toBeInTheDocument();
  expect(screen.getByText(secondPair[1])).toBeInTheDocument();

  randomSpy.mockRestore();
});

test('uses last selected topic from localStorage', async () => {
  localStorage.setItem(SELECTED_TOPIC_KEY, 'topics/pets.json');

  render(
    <TopicProvider>
      <App />
    </TopicProvider>,
  );

  const petsCard = await screen.findByText('Pets & Companions');
  const card = petsCard.closest('[data-topic-card="topics/pets.json"]');
  expect(card).not.toBeNull();

  await waitFor(() => {
    expect(within(card as HTMLElement).getByRole('button', { name: /selected/i })).toBeInTheDocument();
  });
});

test('persists selected topic to localStorage when changed', async () => {
  const [, nextTopic] = loadTopicsMeta();

  render(
    <TopicProvider>
      <App />
    </TopicProvider>,
  );

  const cardTitle = await screen.findByText(nextTopic.name);
  const card = cardTitle.closest(`[data-topic-card="${nextTopic.filename}"]`);
  expect(card).not.toBeNull();

  act(() => {
    within(card as HTMLElement).getByRole('button', { name: /use this/i }).click();
  });

  await waitFor(() => {
    expect(localStorage.getItem(SELECTED_TOPIC_KEY)).toBe(nextTopic.filename);
  });
});

test('loads ratings on page load using last selected topic', async () => {
  localStorage.setItem(SELECTED_TOPIC_KEY, 'topics/pets.json');
  localStorage.setItem(
    'preference-checker/ratings/topics/pets.json',
    JSON.stringify({
      'couch-cat': { rating: 1555, wins: 6, losses: 1, lastUpdated: Date.now() },
    }),
  );

  render(
    <TopicProvider>
      <App />
    </TopicProvider>,
  );

  act(() => {
    screen.getByRole('button', { name: /rankings/i }).click();
  });

  expect(await screen.findByText(/1555 score/i)).toBeInTheDocument();
});

test('shows tied places when multiple entries share the same score', async () => {
  localStorage.setItem(SELECTED_TOPIC_KEY, 'topics/pets.json');
  const petCount = loadTopicEntries('pets.json').length;
  localStorage.setItem(
    'preference-checker/ratings/topics/pets.json',
    JSON.stringify({
      'couch-cat': { rating: 1600, wins: 5, losses: 2, lastUpdated: Date.now() },
      'trail-dog': { rating: 1600, wins: 1, losses: 0, lastUpdated: Date.now() },
    }),
  );

  render(
    <TopicProvider>
      <App />
    </TopicProvider>,
  );

  act(() => {
    screen.getByRole('button', { name: /rankings/i }).click();
  });

  expect(await screen.findAllByText(/1600 score/i)).toHaveLength(2);
  expect(screen.getAllByText('#1=')).toHaveLength(2);
  expect(screen.getAllByText('#3=')).toHaveLength(Math.max(petCount - 2, 0));
});
