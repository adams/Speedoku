import React, { useEffect, useState } from 'react';
import { useSudoku } from '../utils/SudokuContext';

interface PreGameModalProps {
  onStartGame: () => void;
}

const PreGameModal: React.FC<PreGameModalProps> = ({ onStartGame }) => {
  const { 
    generateNewGame, 
    difficulty, 
    setDifficulty,
    setIsUnsolvable
  } = useSudoku();
  
  // State to track if we're processing the start game action
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDifficulty = e.target.value as 'easy' | 'medium' | 'hard' | 'expert';
    setDifficulty(newDifficulty);
  };

  const handleStartGame = () => {
    // Prevent multiple calls
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    // Make sure to reset unsolvable state when starting a new game
    setIsUnsolvable(false);
    
    // First hide the modal to ensure clean state transitions
    onStartGame();
    
    // Then generate the new game with a delay
    // This helps prevent state conflicts and avoid the game over modal flash
    setTimeout(() => {
      generateNewGame();
      // Reset processing state after starting the game
      setTimeout(() => {
        setIsProcessing(false);
      }, 200);
    }, 150);
  };
  
  // Add keyboard event listener for Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        handleStartGame();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown, true);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isProcessing]);

  return (
    <div className="board-modal-overlay" style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 100,
      backdropFilter: 'blur(2px)'
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '360px',
        width: '80%',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        margin: '20px'
      }}>
        <h1 style={{ 
          color: 'var(--primary-color)',
          marginTop: 0,
          marginBottom: '10px',
          fontSize: '28px'
        }}>Speedoku</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <label 
            htmlFor="difficulty" 
            style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontWeight: 'bold',
              fontSize: '14px'
            }}
          >
            Select Difficulty:
          </label>
          <select 
            id="difficulty"
            className="difficulty-selector" 
            value={difficulty} 
            onChange={handleDifficultyChange}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #d9d9d9',
              fontSize: '16px',
              marginBottom: '20px',
              color: 'var(--text-primary)'
            }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </div>
        
        <button 
          onClick={handleStartGame}
          disabled={isProcessing}
          autoFocus
          style={{
            backgroundColor: 'var(--primary-color)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '12px 24px',
            fontSize: '16px',
            cursor: isProcessing ? 'default' : 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            width: '100%',
            opacity: isProcessing ? 0.7 : 1
          }}
        >
          Start New Game (ENTR)
        </button>
      </div>
    </div>
  );
};

export default PreGameModal; 