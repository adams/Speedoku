import React from 'react';
import { useSudoku } from '../utils/SudokuContext';

const GameControls: React.FC = () => {
  const { startNewGame, difficulty, setDifficulty } = useSudoku();
  
  const buttonStyle = {
    padding: '8px 16px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    marginLeft: '10px',
  };
  
  return (
    <div
      className="game-controls"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: '20px 0',
        gap: '10px'
      }}
    >
      <div
        className="controls-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <label htmlFor="difficulty">Difficulty:</label>
        <select
          id="difficulty"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
          style={{
            padding: '5px',
            borderRadius: '4px',
          }}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        
        <button
          onClick={startNewGame}
          style={buttonStyle}
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default GameControls; 