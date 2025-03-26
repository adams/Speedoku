import React, { useState, useEffect } from 'react';
import { useSudoku } from '../utils/SudokuContext';

interface BestTimes {
  easy: number | null;
  medium: number | null;
  hard: number | null;
}

const Timer: React.FC = () => {
  const { isComplete, startTime, difficulty } = useSudoku();
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [bestTimes, setBestTimes] = useState<BestTimes>({
    easy: null,
    medium: null,
    hard: null
  });

  // Load best times from localStorage on component mount
  useEffect(() => {
    const storedBestTimes = localStorage.getItem('sudokuBestTimes');
    if (storedBestTimes) {
      setBestTimes(JSON.parse(storedBestTimes));
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (!startTime || isComplete) return;

    const intervalId = setInterval(() => {
      const now = Date.now();
      setElapsedTime(now - startTime);
    }, 100);

    return () => clearInterval(intervalId);
  }, [startTime, isComplete]);

  // Check and update best time when puzzle is completed
  useEffect(() => {
    if (!isComplete || !startTime) return;

    const finalTime = Date.now() - startTime;
    const currentBestTime = bestTimes[difficulty];

    // Update best time if this is the first completion or faster than previous best
    if (currentBestTime === null || finalTime < currentBestTime) {
      const newBestTimes = { ...bestTimes, [difficulty]: finalTime };
      setBestTimes(newBestTimes);
      localStorage.setItem('sudokuBestTimes', JSON.stringify(newBestTimes));
    }
  }, [isComplete, startTime, difficulty, bestTimes]);

  // Format time in MM:SS.ms format
  const formatTime = (time: number): string => {
    const totalSeconds = Math.floor(time / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const ms = Math.floor((time % 1000) / 10);

    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  // Format best time
  const formatBestTime = (): string => {
    const bestTime = bestTimes[difficulty];
    return bestTime ? formatTime(bestTime) : 'Not Set';
  };

  return (
    <div className="timer-container">
      <div className="timer-display">
        <div className="current-time">
          <span className="timer-label">Time</span>
          <span className="timer-value">{formatTime(elapsedTime)}</span>
        </div>
        <div className="best-time">
          <span className="timer-label">Best Time ({difficulty})</span>
          <span className={`timer-value ${!bestTimes[difficulty] ? 'not-set' : ''}`}>
            {formatBestTime()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Timer; 