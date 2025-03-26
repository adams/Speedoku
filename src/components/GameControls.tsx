import React from 'react';
import { useSudoku } from '../utils/SudokuContext';

const GameControls: React.FC = () => {
  const { 
    generateNewGame, 
    difficulty, 
    setDifficulty,
    pencilMode,
    cyclePencilMode
  } = useSudoku();

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDifficulty = e.target.value as 'easy' | 'medium' | 'hard';
    setDifficulty(newDifficulty);
  };

  const handleNewGame = () => {
    generateNewGame();
  };
  
  // For the pencil mode button, update the button text and style based on the binary state
  const getPencilModeButtonText = (mode: 'off' | 'auto') => {
    switch (mode) {
      case 'off': return 'Pencil Mode: Off';
      case 'auto': return 'Pencil Mode: On';
      default: return 'Pencil Mode';
    }
  };

  // Update button styling for the simpler toggle
  const getPencilModeButtonStyle = (mode: 'off' | 'auto') => {
    const baseStyle = {
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      padding: '8px 12px',
      border: 'none',
      borderRadius: '4px',
      fontSize: '14px',
      cursor: 'pointer',
      fontWeight: mode === 'auto' ? 'bold' as const : 'normal' as const,
      transition: 'all 0.2s ease'
    };

    switch (mode) {
      case 'off':
        return {
          ...baseStyle,
          backgroundColor: '#f0f0f0',
          color: '#666'
        };
      case 'auto':
        return {
          ...baseStyle,
          backgroundColor: 'var(--secondary-color)',
          color: 'white'
        };
      default:
        return baseStyle;
    }
  };

  return (
    <div className="game-controls">
      <select 
        className="difficulty-selector" 
        value={difficulty} 
        onChange={handleDifficultyChange}
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <button 
        className="control-button primary"
        onClick={handleNewGame}
      >
        New Game (N)
      </button>
      
      <button 
        onClick={cyclePencilMode}
        className={`control-button ${pencilMode !== 'off' ? 'active' : ''} ${pencilMode === 'auto' ? 'auto' : ''}`}
        style={getPencilModeButtonStyle(pencilMode as 'off' | 'auto')}
      >
        {getPencilModeButtonText(pencilMode as 'off' | 'auto')}
      </button>
    </div>
  );
};

export default GameControls; 