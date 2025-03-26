import React from 'react';
import { useSudoku } from '../utils/SudokuContext';

const GameControls: React.FC = () => {
  const { 
    startNewGame, 
    difficulty, 
    setDifficulty, 
    undoLastMove, 
    resetBoard, 
    isUnsolvable 
  } = useSudoku();
  
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
      
      <div
        className="controls-row"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginTop: '10px',
        }}
      >
        <button
          onClick={undoLastMove}
          style={{
            ...buttonStyle,
            backgroundColor: '#ff9800',
          }}
        >
          Undo
        </button>
        
        <button
          onClick={resetBoard}
          style={{
            ...buttonStyle,
            backgroundColor: '#f44336',
          }}
        >
          Reset
        </button>
      </div>
      
      {isUnsolvable && (
        <div
          style={{
            backgroundColor: '#ffebee',
            color: '#d32f2f',
            padding: '10px 15px',
            borderRadius: '4px',
            marginTop: '15px',
            fontWeight: 'bold',
            border: '1px solid #f44336',
            textAlign: 'center',
            maxWidth: '500px',
            animation: 'fadeIn 0.3s ease-in-out'
          }}
        >
          <h3 style={{ margin: '0 0 8px 0' }}>⚠️ Unsolvable Board</h3>
          <p style={{ margin: '0', fontSize: '0.9rem' }}>
            The current board configuration cannot be solved. Try using the Undo button to go back to a valid state.
          </p>
        </div>
      )}
    </div>
  );
};

export default GameControls; 