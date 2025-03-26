import React from 'react';
import { useSudoku } from '../utils/SudokuContext';
import { EMPTY_CELL } from '../utils/sudokuUtils';

const NumberPad: React.FC = () => {
  const { fillCell, clearCell, selectedCell } = useSudoku();
  
  // Create an array of numbers 1-9
  const numbers = Array.from({ length: 9 }, (_, i) => i + 1);
  
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
          onClick={() => fillCell(num)}
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
        onClick={() => clearCell()}
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