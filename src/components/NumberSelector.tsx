import React from 'react';
import { useSudoku } from '../utils/SudokuContext';

interface NumberSelectorProps {
  showAutoSelectEffect?: boolean;
}

const NumberSelector: React.FC<NumberSelectorProps> = ({ showAutoSelectEffect = false }) => {
  const { selectedNumber, setSelectedNumber, grid, findFirstAvailableCellForNumber, setSelectedCell } = useSudoku();
  
  // Create an array of numbers 1-9
  const numbers = Array.from({ length: 9 }, (_, i) => i + 1);
  
  // Count occurrences of each number on the board
  const countNumbers = () => {
    const counts: Record<number, number> = {};
    
    // Initialize counts
    for (let num = 1; num <= 9; num++) {
      counts[num] = 0;
    }
    
    // Count occurrences
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        const value = grid[row][col];
        if (value > 0) {
          counts[value]++;
        }
      }
    }
    
    return counts;
  };
  
  const numberCounts = countNumbers();
  
  // Jump to the first available cell for the selected number
  const jumpToFirstAvailableCell = (num: number) => {
    const cell = findFirstAvailableCellForNumber(num);
    if (cell) {
      setSelectedCell(cell);
    }
  };
  
  return (
    <div className="number-selector-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
      <div
        className="number-selector"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 40px)',
          gridTemplateRows: 'repeat(3, 40px)',
          gap: '8px',
          margin: '20px auto 10px',
          width: 'fit-content',
          position: 'relative',
        }}
      >
        {showAutoSelectEffect && selectedNumber && (
          <div 
            className="auto-select-highlight"
            style={{
              position: 'absolute',
              top: `-10px`,
              left: `${(((selectedNumber - 1) % 3) * 48)}px`,
              width: '40px',
              height: '40px',
              border: '2px solid #1890ff',
              borderRadius: '4px',
              animation: 'pulse 1s ease-in-out',
              zIndex: 1,
              boxShadow: '0 0 8px rgba(24, 144, 255, 0.5)',
              pointerEvents: 'none',
              opacity: 0.7,
              transform: `translateY(${Math.floor((selectedNumber - 1) / 3) * 48 + 10}px)`,
            }}
          />
        )}
        {numbers.map((num) => {
          const isComplete = numberCounts[num] === 9;
          const hasAvailableSpot = findFirstAvailableCellForNumber(num) !== null;
          
          return (
            <div
              key={num}
              onClick={() => {
                setSelectedNumber(selectedNumber === num ? null : num);
              }}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: 'bold',
                border: isComplete 
                  ? '2px solid #52c41a' 
                  : hasAvailableSpot 
                    ? '1px solid #1890ff' 
                    : '1px solid #999',
                borderRadius: '4px',
                backgroundColor: selectedNumber === num 
                  ? '#1890ff' 
                  : isComplete ? '#f6ffed' : 'white',
                color: selectedNumber === num 
                  ? 'white' 
                  : isComplete ? '#52c41a' : '#333',
                position: 'relative',
                animation: selectedNumber === num && showAutoSelectEffect ? 'pulse 1s ease-in-out' : 'none',
                zIndex: 2,
              }}
            >
              <span>{num}</span>
              <div
                style={{
                  position: 'absolute',
                  top: '2px',
                  right: '3px',
                  fontSize: '8px',
                  fontWeight: 'normal',
                  color: selectedNumber === num 
                    ? 'rgba(255, 255, 255, 0.7)' 
                    : isComplete ? '#52c41a' : '#999',
                }}
              >
                {numberCounts[num]}
              </div>
              {isComplete && (
                <div 
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    backgroundColor: '#52c41a',
                    borderBottomLeftRadius: '3px',
                    borderBottomRightRadius: '3px',
                  }}
                />
              )}
              {!isComplete && hasAvailableSpot && (
                <div 
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '3px',
                    backgroundColor: selectedNumber === num ? 'white' : '#1890ff',
                    borderBottomLeftRadius: '3px',
                    borderBottomRightRadius: '3px',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {selectedNumber && findFirstAvailableCellForNumber(selectedNumber) && (
        <button
          onClick={() => jumpToFirstAvailableCell(selectedNumber)}
          style={{
            padding: '5px 10px',
            backgroundColor: '#1890ff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            marginBottom: '10px',
          }}
        >
          Jump to available {selectedNumber}
          <span style={{ fontSize: '0.7rem', marginLeft: '5px' }}>(Tab)</span>
        </button>
      )}
      
      <div className="keyboard-hint" style={{ fontSize: '0.75rem', color: '#666', textAlign: 'center' }}>
        Tab: cycle forward | Shift+Tab: cycle backward | Enter: fill cell & move to next
      </div>
    </div>
  );
};

export default NumberSelector; 