import { render, screen, waitFor, act, within } from '@testing-library/react';
import { beforeEach } from 'vitest';
import React from 'react';
import App from './App';
import { TopicProvider } from './context/TopicContext';
import { SELECTED_TOPIC_KEY } from './utils/storage';

// Basic smoke test to ensure the app renders without runtime errors

beforeEach(() => {
  localStorage.clear();
});

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
  render(
    <TopicProvider>
      <App />
    </TopicProvider>,
  );

  const petsCard = await screen.findByText('Pets & Companions');
  const card = petsCard.closest('[data-topic-card="topics/pets.json"]');
  expect(card).not.toBeNull();

  act(() => {
    within(card as HTMLElement).getByRole('button', { name: /use this/i }).click();
  });

  await waitFor(() => {
    expect(localStorage.getItem(SELECTED_TOPIC_KEY)).toBe('topics/pets.json');
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
