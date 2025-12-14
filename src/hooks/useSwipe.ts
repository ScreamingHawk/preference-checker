import { useRef, useState } from 'react';

export type SwipeDirection = 'like' | 'skip';

const SWIPE_THRESHOLD = 90;

export const useSwipe = (onCommit: (dir: SwipeDirection) => void) => {
  const startX = useRef<number | null>(null);
  const [delta, setDelta] = useState(0);
  const [dragging, setDragging] = useState(false);

  const handlePointerDown = (clientX: number) => {
    startX.current = clientX;
    setDragging(true);
  };

  const handlePointerMove = (clientX: number) => {
    if (!dragging || startX.current === null) return;
    setDelta(clientX - startX.current);
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    const distance = delta;
    const abs = Math.abs(distance);
    setDragging(false);
    setDelta(0);

    if (abs < SWIPE_THRESHOLD) return;
    onCommit(distance > 0 ? 'like' : 'skip');
  };

  return { delta, dragging, handlePointerDown, handlePointerMove, handlePointerUp };
};
