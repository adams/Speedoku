import React, { useEffect, useRef, useState } from 'react';

interface UnsolvableModalProps {
  onNewGame?: () => void;
}

const UnsolvableModal: React.FC<UnsolvableModalProps> = ({ onNewGame }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Handler function to ensure we only call onNewGame once
  const handleDismiss = () => {
    if (isProcessing) return; // Prevent multiple calls
    
    setIsProcessing(true);
    
    // Call onNewGame immediately if it exists
    if (onNewGame) {
      onNewGame();
    }
  };

  // Add keyboard event listener for Enter key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation(); // Stop event propagation to prevent other handlers from catching it
        handleDismiss();
      }
    };
    
    // Add event listener with capture phase to ensure it gets priority
    window.addEventListener('keydown', handleKeyDown, true);
    
    // Focus the button to ensure keyboard events work properly
    if (buttonRef.current) {
      buttonRef.current.focus();
    }
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [isProcessing]);

  return (
    <div className="board-modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(2px)'
    }}>
      <div 
        className="modal-content" 
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '20px',
          maxWidth: '320px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}
        tabIndex={-1} // Ensure the div can receive focus for keyboard events
      >
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
          ref={buttonRef}
          onClick={handleDismiss}
          disabled={isProcessing}
          autoFocus // Add autofocus to ensure it receives keyboard events
          style={{
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            fontSize: '16px',
            cursor: isProcessing ? 'default' : 'pointer',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease',
            opacity: isProcessing ? 0.7 : 1
          }}
        >
          Dismiss (ENTR)
        </button>
      </div>
    </div>
  );
};

export default UnsolvableModal; 