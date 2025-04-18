import React from 'react';
import { useSudoku } from '../utils/SudokuContext';

interface NumberSelectorProps {}

const NumberSelector: React.FC<NumberSelectorProps> = () => {
  const { selectedNumber, setSelectedNumber, grid, findFirstAvailableCellForNumber, setSelectedCell, selectedCell, fillCell } = useSudoku();
  
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
  
  // Calculate remaining numbers (9 - placed count)
  const getRemainingCount = (num: number) => {
    return 9 - numberCounts[num];
  };
  
  // Calculate cell size to match board width
  // Sudoku board is 9x9 grid at 40px each = 360px
  // For 3x3 grid with 2 gaps, each cell should be (360px - (2 * gap)) / 3
  const gap = 6;
  const cellWidth = (360 - (2 * gap)) / 3;
  const cellHeight = 50; // Shorter rectangular cells
  
  return (
    <div className="number-selector-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '360px', margin: '0 auto' }}>
      <div
        className="number-selector"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(3, ${cellWidth}px)`,
          gridTemplateRows: `repeat(3, ${cellHeight}px)`,
          gap: `${gap}px`,
          margin: '15px auto',
          width: '360px',
          position: 'relative',
        }}
      >
        {numbers.map((num) => {
          const isComplete = numberCounts[num] === 9;
          const hasAvailableSpot = findFirstAvailableCellForNumber(num) !== null;
          const remaining = getRemainingCount(num);
          
          return (
            <div
              key={num}
              onClick={() => {
                // If number is complete (all 9 instances on board), ignore click
                if (isComplete) {
                  return;
                }
                
                // If the number is already selected AND a cell is selected,
                // fill the cell with that number (same as pressing the number key)
                if (selectedNumber === num && selectedCell) {
                  const [row, col] = selectedCell;
                  fillCell(row, col, num);
                  return;
                }
                
                // Always select the number (never deselect)
                setSelectedNumber(num);
                
                // Find and select first available cell
                const firstAvailableCell = findFirstAvailableCellForNumber(num);
                if (firstAvailableCell) {
                  setSelectedCell(firstAvailableCell);
                }
              }}
              style={{
                width: `${cellWidth}px`,
                height: `${cellHeight}px`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                cursor: isComplete ? 'default' : 'pointer',
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
                zIndex: 2,
                fontSize: '26px',
              }}
            >
              <span>{num}</span>
              <div
                style={{
                  position: 'absolute',
                  top: '4px',
                  right: '6px',
                  fontSize: '10px',
                  fontWeight: 'normal',
                  color: selectedNumber === num 
                    ? 'rgba(255, 255, 255, 0.7)' 
                    : isComplete ? '#52c41a' : '#999',
                }}
              >
                {remaining}
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
    </div>
  );
};

export default NumberSelector; 