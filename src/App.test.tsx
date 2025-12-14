import { render, screen, waitFor, act } from '@testing-library/react';
import React from 'react';
import App from './App';
import { TopicProvider } from './context/TopicContext';

// Basic smoke test to ensure the app renders without runtime errors

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
