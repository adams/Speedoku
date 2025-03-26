import React from 'react';

interface UnsolvableModalProps {
  onNewGame?: () => void;
}

const UnsolvableModal: React.FC<UnsolvableModalProps> = ({ onNewGame }) => {
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
      backdropFilter: 'blur(2px)',
      borderRadius: '4px'
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        padding: '20px',
        maxWidth: '320px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
      }}>
        <div style={{ fontSize: '40px', marginBottom: '5px' }}>⚠️</div>
        <h2 style={{ 
          color: 'var(--error-color)',
          marginTop: 0,
          marginBottom: '10px',
          fontSize: '20px'
        }}>Game Over</h2>
        <p style={{ 
          fontSize: '14px',
          marginBottom: '20px',
          color: 'var(--text-primary)',
          lineHeight: 1.4
        }}>
          You've put the puzzle into an unsolvable state.
        </p>
        <button 
          onClick={onNewGame}
          style={{
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            fontSize: '16px',
            cursor: 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease'
          }}
        >
          New Game
        </button>
      </div>
    </div>
  );
};

export default UnsolvableModal; 