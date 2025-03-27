import React from 'react';
import { useSudoku } from '../utils/SudokuContext';

interface GameControlsProps {
  onNewGame?: () => void;
  showPencilModeOnly?: boolean;
}

const GameControls: React.FC<GameControlsProps> = ({ onNewGame, showPencilModeOnly = false }) => {
  const { 
    pencilMode,
    cyclePencilMode
  } = useSudoku();

  const handleNewGame = () => {
    if (onNewGame) {
      onNewGame();
    }
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
  
  const PencilModeButton = () => (
    <button 
      onClick={cyclePencilMode}
      className={`control-button ${pencilMode !== 'off' ? 'active' : ''} ${pencilMode === 'auto' ? 'auto' : ''}`}
      style={getPencilModeButtonStyle(pencilMode as 'off' | 'auto')}
    >
      {getPencilModeButtonText(pencilMode as 'off' | 'auto')}
    </button>
  );

  // If only showing pencil mode button, return just that
  if (showPencilModeOnly) {
    return <PencilModeButton />;
  }

  return (
    <div className="game-controls">
      <button 
        className="control-button primary"
        onClick={handleNewGame}
      >
        New Game (N)
      </button>
      
      <PencilModeButton />
    </div>
  );
};

// Export a function that returns just the pencil mode button
export const PencilModeButton = () => {
  const { 
    pencilMode,
    cyclePencilMode
  } = useSudoku();
  
  const getPencilModeButtonText = (mode: 'off' | 'auto') => {
    switch (mode) {
      case 'off': return 'Pencil Mode: Off';
      case 'auto': return 'Pencil Mode: On';
      default: return 'Pencil Mode';
    }
  };

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
      transition: 'all 0.2s ease',
      width: '100%',
      justifyContent: 'center',
      marginBottom: '15px'
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
    <button 
      onClick={cyclePencilMode}
      className={`control-button ${pencilMode !== 'off' ? 'active' : ''} ${pencilMode === 'auto' ? 'auto' : ''}`}
      style={getPencilModeButtonStyle(pencilMode as 'off' | 'auto')}
    >
      {getPencilModeButtonText(pencilMode as 'off' | 'auto')}
    </button>
  );
};

export default GameControls; 