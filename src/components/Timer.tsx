import React, { useEffect, useState, useRef } from 'react';
import { useSudoku } from '../utils/SudokuContext';

interface TimerProps {
  isGameOver?: boolean;
}

const Timer: React.FC<TimerProps> = ({ isGameOver = false }) => {
  const { isGameComplete, startTime, difficulty } = useSudoku();
  const [time, setTime] = useState(0);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const timerRef = useRef<number | null>(null);
  
  // Get the localStorage key based on difficulty
  const getBestTimeKey = () => `speedoku-best-time-${difficulty}`;

  // Load best time from localStorage on initial mount and when difficulty changes
  useEffect(() => {
    const savedBestTime = localStorage.getItem(getBestTimeKey());
    if (savedBestTime) {
      setBestTime(parseInt(savedBestTime, 10));
    } else {
      // Initialize best time to zero for this difficulty if no record exists
      setBestTime(0);
      localStorage.setItem(getBestTimeKey(), '0');
    }
  }, [difficulty]);

  // Reset and start timer when startTime changes (new game or reset)
  useEffect(() => {
    // Reset the timer
    setTime(0);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    // Start a new timer
    if (startTime) {
      timerRef.current = window.setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    }

    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [startTime]); // Depend on startTime to reset when a new game starts

  useEffect(() => {
    // When game is complete, stop timer and check best time
    if (isGameComplete) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      // Update best time if current time is better or best time doesn't exist
      if (time > 0 && (bestTime === null || time < bestTime)) {
        setBestTime(time);
        localStorage.setItem(getBestTimeKey(), time.toString());
      }
    }
  }, [isGameComplete, time, bestTime, difficulty]);

  // Stop the timer when game is over (unsolvable)
  useEffect(() => {
    if (isGameOver && timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, [isGameOver]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (isGameOver) {
    return (
      <div className="timer-container game-over">
        <div className="game-over-message" style={{ 
          color: 'var(--error-color)',
          fontWeight: 'bold',
          fontSize: '1.2rem'
        }}>
          Game Over
        </div>
        <div className="final-time" style={{ fontSize: '1rem' }}>
          Final Time: {formatTime(time)}
        </div>
      </div>
    );
  }

  return (
    <div className="timer-container">
      <div className="timer-display">
        {formatTime(time)}
      </div>
      {bestTime !== null && (
        <div className="best-time">
          Best ({difficulty}): {formatTime(bestTime)}
        </div>
      )}
    </div>
  );
};

export default Timer; 