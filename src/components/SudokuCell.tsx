import React from 'react';
import { useSudoku } from '../utils/SudokuContext';
import { EMPTY_CELL } from '../utils/sudokuUtils';

interface SudokuCellProps {
  row: number;
  col: number;
  value: number;
  isInitial: boolean;
  autoPencilMode?: boolean;
}

const SudokuCell: React.FC<SudokuCellProps> = ({ row, col, value, isInitial, autoPencilMode = false }) => {
  const { 
    selectedCell, 
    selectedNumber, 
    selectCell, 
    isSameHouseRowOrColumn,
    getPencilMarks,
    getValidCandidates
  } = useSudoku();
  
  const isSelected = selectedCell ? selectedCell[0] === row && selectedCell[1] === col : false;
  const isEditable = !isInitial;
  
  // Get manual pencil marks for this cell
  const manualPencilMarks = getPencilMarks(row, col);
  
  // Get auto-generated pencil marks (all valid candidates) for this cell
  const autoGeneratedCandidates = autoPencilMode ? getValidCandidates(row, col) : [];
  
  // Combine both types of pencil marks if in auto mode, otherwise just use manual marks
  const pencilMarks = autoPencilMode ? autoGeneratedCandidates : manualPencilMarks;
  
  // Check if this cell contains the selected number
  const hasSelectedNumber = selectedNumber !== null && value === selectedNumber;
  
  // Check if this cell cannot contain the selected number due to rules or it's already filled
  const isInvalid = selectedNumber !== null && 
                  ((value === EMPTY_CELL && isSameHouseRowOrColumn(row, col, selectedNumber)) || 
                   (value !== EMPTY_CELL && value !== selectedNumber));
  
  // Should we show a preview (when cell is selected, empty, valid, and a number is selected in 3x3)
  const showPreview = isSelected && value === EMPTY_CELL && selectedNumber !== null && 
                     !isSameHouseRowOrColumn(row, col, selectedNumber);
  
  // Determine border styling for grid lines
  const borderStyles = {
    borderRight: (col + 1) % 3 === 0 && col !== 8 ? '2px solid #333' : '1px solid #999',
    borderBottom: (row + 1) % 3 === 0 && row !== 8 ? '2px solid #333' : '1px solid #999',
    borderLeft: col === 0 ? '2px solid #333' : undefined,
    borderTop: row === 0 ? '2px solid #333' : undefined,
  };
  
  // Determine background color based on state
  let backgroundColor = 'white';
  if (hasSelectedNumber || isInvalid) {
    backgroundColor = '#f0f0f0'; // Grey background for highlighted cells
  }

  // Generate the pencil marks grid
  const renderPencilMarks = () => {
    if (value !== EMPTY_CELL || (!autoPencilMode && pencilMarks.length === 0)) return null;

    // Create a 3x3 grid for the pencil marks
    return (
      <div 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gridTemplateRows: 'repeat(3, 1fr)',
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none', // Allow clicks to pass through
        }}
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const hasNumber = pencilMarks.includes(num);
          const isHighlighted = selectedNumber === num;
          const isAutoPencil = autoPencilMode && hasNumber;
          
          const position = {
            1: { gridRow: 1, gridColumn: 1 },
            2: { gridRow: 1, gridColumn: 2 },
            3: { gridRow: 1, gridColumn: 3 },
            4: { gridRow: 2, gridColumn: 1 },
            5: { gridRow: 2, gridColumn: 2 },
            6: { gridRow: 2, gridColumn: 3 },
            7: { gridRow: 3, gridColumn: 1 },
            8: { gridRow: 3, gridColumn: 2 },
            9: { gridRow: 3, gridColumn: 3 },
          }[num];
          
          return (
            <div 
              key={num}
              className={`pencil-mark ${isHighlighted ? 'highlighted' : ''} ${isAutoPencil ? 'auto-pencil' : ''}`}
              style={{
                ...position,
                visibility: hasNumber ? 'visible' : 'hidden',
              }}
            >
              {num}
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div
      className={`sudoku-cell ${isInitial ? 'initial' : ''} ${isEditable ? 'editable' : ''} ${hasSelectedNumber ? 'has-selected-number' : ''} ${isInvalid ? 'invalid-for-number' : ''}`}
      style={{
        ...borderStyles,
        width: '40px',
        height: '40px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
        fontWeight: isInitial ? 'bold' : 'normal',
        backgroundColor, // This ensures the right background color is used
        position: 'relative',
        boxShadow: isSelected ? '0 0 0 2px #1890ff inset' : 'none',
      }}
      onClick={() => selectCell(row, col)}
    >
      {renderPencilMarks()}
      
      {value !== EMPTY_CELL ? value : showPreview ? (
        <span style={{ 
          color: '#bfbfbf', 
          fontWeight: 300,
          fontSize: '1.2rem',
          opacity: 0.7
        }}>
          {selectedNumber}
        </span>
      ) : ''}
      
      {isSelected && isEditable && (
        <div className="cursor-indicator"></div>
      )}
    </div>
  );
};

export default SudokuCell; 