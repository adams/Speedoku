import React, { useEffect, useState, useRef } from 'react';
import { useSudoku } from '../utils/SudokuContext';
import confetti from 'canvas-confetti';

interface CelebrationProps {
  onComplete?: () => void;
  onNewGameRequested?: () => void;
}

const Celebration: React.FC<CelebrationProps> = ({ onComplete, onNewGameRequested }) => {
  const { isComplete, setIsComplete } = useSudoku();
  const [showModal, setShowModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isComplete) {
      // Trigger confetti effect
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };
      
      // Create a canvas that covers the entire window
      const myCanvas = document.createElement('canvas');
      myCanvas.style.position = 'fixed';
      myCanvas.style.top = '0';
      myCanvas.style.left = '0';
      myCanvas.style.width = '100%';
      myCanvas.style.height = '100%';
      myCanvas.style.pointerEvents = 'none';
      myCanvas.style.zIndex = '1000';
      document.body.appendChild(myCanvas);
      
      const myConfetti = confetti.create(myCanvas, {
        resize: true,
        useWorker: true
      });
      
      const runAnimation = () => {
        const now = Date.now();
        const remaining = animationEnd - now;
        
        if (remaining <= 0) {
          if (document.body.contains(myCanvas)) {
            document.body.removeChild(myCanvas);
          }
          setShowModal(true); // Show the modal after confetti animation
          return;
        }
        
        // Launch confetti from multiple origins across the entire screen
        const confettiCount = 3;
        for (let i = 0; i < confettiCount; i++) {
          // Vary the origin points across the width of the screen
          myConfetti({
            particleCount: 2,
            angle: randomInRange(55, 125),
            spread: randomInRange(50, 70),
            origin: { 
              x: randomInRange(0.2, 0.8), 
              y: randomInRange(0.2, 0.4) 
            },
            colors: ['#FFC700', '#FF0000', '#2962FF', '#00C853'],
            disableForReducedMotion: true
          });
        }
        
        // Schedule next frame
        requestAnimationFrame(runAnimation);
      };
      
      // Start animation
      runAnimation();
      
      return () => {
        // Clean up the canvas if component unmounts
        if (document.body.contains(myCanvas)) {
          document.body.removeChild(myCanvas);
        }
      };
    }
  }, [isComplete]);

  // Reset modal state when isComplete changes to false
  useEffect(() => {
    if (!isComplete) {
      setShowModal(false);
      setIsProcessing(false);
    }
  }, [isComplete]);

  // Handler function to prevent multiple dismissals
  const handleDismiss = () => {
    if (isProcessing) return; // Prevent multiple calls
    
    setIsProcessing(true);
    setShowModal(false);
    
    // Reset the isComplete state to avoid the modal getting stuck
    setIsComplete(false);
    
    // Tell the parent component to show the pre-game modal
    if (onNewGameRequested) {
      onNewGameRequested();
    }
    
    if (onComplete) onComplete();
  };
  
  // Add keyboard event listener for Enter key
  useEffect(() => {
    // Only add the listener when the modal is shown
    if (!showModal) return;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation(); // Stop event propagation to prevent other handlers
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
  }, [showModal, isProcessing]);

  return (
    <div ref={containerRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      {showModal && (
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
          backdropFilter: 'blur(2px)',
          pointerEvents: 'auto'
        }}>
          <div className="modal-content" style={{
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
            <div style={{ fontSize: '40px', marginBottom: '5px' }}>🎉</div>
            <h2 style={{ 
              color: '#52c41a',
              marginTop: 0,
              marginBottom: '10px',
              fontSize: '22px'
            }}>Puzzle Complete!</h2>
            <p style={{ 
              fontSize: '14px',
              marginBottom: '20px',
              color: 'var(--text-primary)',
              lineHeight: 1.4
            }}>
              Congratulations! You've successfully completed the puzzle.
            </p>
            <button 
              ref={buttonRef}
              onClick={handleDismiss}
              disabled={isProcessing}
              autoFocus // Add autofocus to ensure it receives keyboard events
              style={{
                backgroundColor: '#52c41a',
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
      )}
    </div>
  );
};

export default Celebration; 