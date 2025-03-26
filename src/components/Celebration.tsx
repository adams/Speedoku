import React, { useEffect } from 'react';
import { useSudoku } from '../utils/SudokuContext';
import confetti from 'canvas-confetti';

interface CelebrationProps {
  onComplete?: () => void;
}

const Celebration: React.FC<CelebrationProps> = ({ onComplete }) => {
  const { isComplete } = useSudoku();

  useEffect(() => {
    if (isComplete) {
      // Trigger confetti effect
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      
      const randomInRange = (min: number, max: number) => {
        return Math.random() * (max - min) + min;
      };
      
      // Create a canvas that covers the entire screen
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
          document.body.removeChild(myCanvas);
          if (onComplete) onComplete();
          return;
        }
        
        // Launch confetti from multiple origins
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
  }, [isComplete, onComplete]);

  return null;
};

export default Celebration; 