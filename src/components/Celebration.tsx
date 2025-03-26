import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useSudoku } from '../utils/SudokuContext';

const Celebration: React.FC = () => {
  const { isComplete } = useSudoku();
  const [windowDimension, setWindowDimension] = useState<{ width: number; height: number }>({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  const [showMessage, setShowMessage] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Log when isComplete changes to help debug
  useEffect(() => {
    console.log("Completion status changed:", isComplete);
  }, [isComplete]);

  useEffect(() => {
    const handleResize = () => {
      setWindowDimension({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (isComplete) {
      console.log("Showing celebration message");
      setShowMessage(true);
      
      // After 5 seconds, start fading out
      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 5000);
      
      // After 6 seconds, hide the message
      const hideTimer = setTimeout(() => {
        setShowMessage(false);
        setFadeOut(false);
      }, 6000);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isComplete]);

  // Early return if not complete
  if (!isComplete) {
    return null;
  }

  console.log("Rendering celebration component");

  return (
    <>
      {showMessage && (
        <div 
          className={`celebration-overlay ${fadeOut ? 'fade-out' : ''}`}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            transition: 'opacity 1s ease',
          }}
        >
          <div 
            className="celebration-message"
            style={{
              backgroundColor: 'white',
              borderRadius: '10px',
              padding: '30px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
              textAlign: 'center',
              animation: 'pop-in 0.5s ease-out',
              maxWidth: '80%',
            }}
          >
            <h2 style={{ color: '#4CAF50', marginBottom: '15px', fontSize: '2.5rem' }}>
              🎉 Congratulations! 🎉
            </h2>
            <p style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
              You solved the puzzle!
            </p>
            <div 
              className="trophy"
              style={{
                fontSize: '5rem',
                margin: '20px 0',
                animation: 'spin 1s ease-in-out',
              }}
            >
              🏆
            </div>
            <button
              onClick={() => {
                setFadeOut(true);
                setTimeout(() => {
                  setShowMessage(false);
                  setFadeOut(false);
                }, 1000);
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                fontSize: '1.1rem',
                cursor: 'pointer',
                marginTop: '15px',
              }}
            >
              Continue Playing
            </button>
          </div>
        </div>
      )}
      <Confetti
        width={windowDimension.width}
        height={windowDimension.height}
        recycle={showMessage}
        numberOfPieces={showMessage ? 200 : 0}
        gravity={0.1}
      />
    </>
  );
};

export default Celebration; 