import React from 'react';
import { useSudoku } from '../utils/SudokuContext';

const NumberPad: React.FC = () => {
  const { fillCell, clearCell, selectedCell } = useSudoku();
  
  // Create an array of numbers 1-9
  const numbers = Array.from({ length: 9 }, (_, i) => i + 1);
  
  // Handler for filling a cell with a number
  const handleFillCell = (num: number) => {
    if (selectedCell) {
      const [row, col] = selectedCell;
      fillCell(row, col, num);
    }
  };
  
  // Handler for clearing a cell
  const handleClearCell = () => {
    if (selectedCell) {
      const [row, col] = selectedCell;
      clearCell(row, col);
    }
  };
  
  return (
    <div
      className="number-pad"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 40px)',
        gridTemplateRows: 'repeat(3, 40px)',
        gap: '8px',
        margin: '20px auto',
        width: 'fit-content',
      }}
    >
      {numbers.map((num) => (
        <button
          key={num}
          onClick={() => handleFillCell(num)}
          disabled={!selectedCell}
          style={{
            width: '40px',
            height: '40px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: selectedCell ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            border: '1px solid #999',
            borderRadius: '4px',
            backgroundColor: 'white',
          }}
        >
          {num}
        </button>
      ))}
      <button
        onClick={handleClearCell}
        disabled={!selectedCell}
        style={{
          gridColumn: '1 / span 3',
          height: '40px',
          cursor: selectedCell ? 'pointer' : 'not-allowed',
          fontWeight: 'bold',
          border: '1px solid #999',
          borderRadius: '4px',
          backgroundColor: 'white',
        }}
      >
        Clear
      </button>
    </div>
  );
};

export default NumberPad; 