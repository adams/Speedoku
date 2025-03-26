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
      // Initialize best time to null if no record exists
      setBestTime(null);
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
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setTime(elapsed);
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
      console.log("Game complete detected in Timer! Current time:", time, "Best time:", bestTime);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        console.log("Timer stopped");
      }

      // Calculate final time based on startTime to ensure accuracy
      const finalTime = startTime ? Math.floor((Date.now() - startTime) / 1000) : time;
      
      // Update best time if current time is better or no best time exists
      if (finalTime > 0 && (bestTime === null || finalTime < bestTime)) {
        console.log("Updating best time from", bestTime, "to", finalTime);
        setBestTime(finalTime);
        localStorage.setItem(getBestTimeKey(), finalTime.toString());
        console.log("Best time saved to localStorage with key:", getBestTimeKey(), "value:", finalTime.toString());
      } else {
        console.log("Not updating best time. Final time:", finalTime, "Best time:", bestTime);
      }
    }
  }, [isGameComplete, startTime, difficulty]); // Include startTime but not time or bestTime

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