import React, { useEffect, useState } from 'react';
import { useSudoku } from '../utils/SudokuContext';
import SudokuCell from './SudokuCell';
import NumberSelector from './NumberSelector';
import { EMPTY_CELL } from '../utils/sudokuUtils';

// Define the pencil mode types
type PencilModeType = 'off' | 'manual' | 'auto';

const SudokuBoard: React.FC = () => {
  const { 
    grid, 
    initialGrid, 
    fillCell, 
    clearCell, 
    selectedCell, 
    checkCompletion, 
    setSelectedCell,
    selectedNumber, 
    setSelectedNumber,
    findFirstAvailableCellForNumber,
    findNextIncompleteNumber,
    findNextAvailableCellForNumber,
    togglePencilMark
  } = useSudoku();
  
  // Enhanced pencil mode state with 3 options: off, manual, auto
  const [pencilMode, setPencilMode] = useState<PencilModeType>('off');
  
  // State to track auto-selection animation
  const [showAutoSelectEffect, setShowAutoSelectEffect] = useState(false);
  
  // Track previous selected number to detect auto-selection
  const [prevSelectedNumber, setPrevSelectedNumber] = useState<number | null>(null);
  
  // Cycle through pencil modes: off -> manual -> auto -> off
  const cyclePencilMode = () => {
    setPencilMode(current => {
      if (current === 'off') return 'manual';
      if (current === 'manual') return 'auto';
      return 'off';
    });
  };
  
  // Effect to detect when a number is automatically selected
  useEffect(() => {
    if (selectedNumber !== prevSelectedNumber) {
      // If the number changed and we didn't manually clear it
      if (selectedNumber !== null && prevSelectedNumber !== null) {
        // This was likely an auto-selection
        setShowAutoSelectEffect(true);
        
        // Clear the effect after a short delay
        const timer = setTimeout(() => {
          setShowAutoSelectEffect(false);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
      
      // Update the previous number
      setPrevSelectedNumber(selectedNumber);
    }
  }, [selectedNumber, prevSelectedNumber]);
  
  // Jump to the first or next available cell for the selected number
  const jumpToAvailableCell = (cycleToNext: boolean = false, reverse: boolean = false) => {
    if (selectedNumber) {
      let cell;
      
      if (cycleToNext && selectedCell) {
        // Find the next available cell after the current one
        cell = findNextAvailableCellForNumber(selectedNumber, selectedCell, reverse);
      } else {
        // Find the first available cell for this number
        cell = findFirstAvailableCellForNumber(selectedNumber);
      }
      
      if (cell) {
        setSelectedCell(cell);
      } else {
        // No available cell for this number, perhaps it's already completed
        console.log(`No available spot for ${selectedNumber}`);
        
        // Try to find the next incomplete number
        const nextNumber = findNextIncompleteNumber();
        if (nextNumber) {
          setSelectedNumber(nextNumber);
          
          // After setting the new number, jump to its first available cell
          setTimeout(() => {
            const nextCell = findFirstAvailableCellForNumber(nextNumber);
            if (nextCell) {
              setSelectedCell(nextCell);
            }
          }, 0);
        }
      }
    }
  };
  
  // Check for completion on render and after any grid changes
  useEffect(() => {
    // Small delay to allow the grid state to fully update
    const timer = setTimeout(() => {
      checkCompletion();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [grid, checkCompletion]);
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ESC key - remove selection state
      if (e.key === 'Escape') {
        if (selectedCell) {
          // If a cell is selected, clear cell selection
          setSelectedCell(null);
        } else if (selectedNumber) {
          // If no cell is selected but a number is, clear number selection
          setSelectedNumber(null);
        }
        return;
      }
      
      // Toggle pencil mode with 'p' key
      if (e.key === 'p' || e.key === 'P') {
        cyclePencilMode();
        return;
      }
      
      // TAB key - cycle through available cells for selected number
      if (e.key === 'Tab' && selectedNumber) {
        e.preventDefault(); // Prevent default tab behavior
        
        // If a cell is already selected, cycle to the next one
        // Direction depends on whether Shift is pressed
        const reverse = e.shiftKey;
        jumpToAvailableCell(selectedCell !== null, reverse);
        return;
      }
      
      // ENTER key - submit the selected number into the selected cell
      if (e.key === 'Enter') {
        e.preventDefault();
        
        // If both a cell and a number are selected, fill the cell with the number
        if (selectedCell && selectedNumber) {
          // Store the current number before filling the cell
          const currentNumber = selectedNumber;
          
          // In manual pencil mode, toggle the pencil mark
          if (pencilMode === 'manual') {
            const [row, col] = selectedCell;
            togglePencilMark(row, col, selectedNumber);
          } else {
            // Regular mode - fill the cell
            fillCell(selectedNumber);
          }
          
          return;
        }
        
        // If only a number is selected (no cell), jump to first available cell
        if (!selectedCell && selectedNumber) {
          jumpToAvailableCell(false);
          return;
        }
      }
      
      // Number keys for highlighting or inputting numbers (1-9)
      if (e.key >= '1' && e.key <= '9' && !e.ctrlKey && !e.metaKey) {
        const num = parseInt(e.key);
        
        // Shift key for pencil marks when a cell is selected
        if (e.shiftKey && selectedCell) {
          const [row, col] = selectedCell;
          togglePencilMark(row, col, num);
          return;
        }
        
        // If not actively editing a cell (no cell selected) or if Shift key is pressed without a cell selected,
        // treat number keys as number selection for highlighting
        if (!selectedCell) {
          // Toggle number selection (if already selected, deselect it)
          setSelectedNumber(selectedNumber === num ? null : num);
          return;
        }
        
        // Otherwise, input the number or toggle pencil mark depending on mode
        if (selectedCell) {
          if (pencilMode === 'manual') {
            const [row, col] = selectedCell;
            togglePencilMark(row, col, num);
          } else {
            fillCell(num);
          }
        }
      }
      // Handle backspace and delete keys for clearing
      else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedCell) {
          clearCell();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, selectedNumber, fillCell, clearCell, setSelectedCell, setSelectedNumber, jumpToAvailableCell, pencilMode, togglePencilMark]);
  
  // Get the label for the pencil mode button
  const getPencilModeLabel = () => {
    switch (pencilMode) {
      case 'off': return 'Pencil: Off';
      case 'manual': return 'Pencil: Manual';
      case 'auto': return 'Pencil: Auto';
      default: return 'Pencil Mode';
    }
  };
  
  return (
    <div>
      <div 
        className="sudoku-board"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(9, 40px)',
          gridTemplateRows: 'repeat(9, 40px)',
          gap: '0px',
          border: '2px solid #333',
          width: 'fit-content',
          margin: '0 auto',
        }}
      >
        {grid.map((row, rowIndex) => 
          row.map((value, colIndex) => (
            <SudokuCell
              key={`${rowIndex}-${colIndex}`}
              row={rowIndex}
              col={colIndex}
              value={value}
              isInitial={initialGrid[rowIndex][colIndex] !== EMPTY_CELL}
              autoPencilMode={pencilMode === 'auto'}
              pencilMode={pencilMode}
            />
          ))
        )}
      </div>
      <NumberSelector showAutoSelectEffect={showAutoSelectEffect} />
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', gap: '10px' }}>
        <button 
          onClick={cyclePencilMode}
          className={`pencil-mode-button ${pencilMode !== 'off' ? 'active' : ''} ${pencilMode === 'auto' ? 'auto' : ''}`}
        >
          {getPencilModeLabel()} (P)
        </button>
      </div>
      <div className="keyboard-instructions">
        Click a cell and use numbers 1-9 to input. Press Backspace or Delete to clear.
        <br />
        Or select a number below to highlight cells. Press ESC to clear selection.
        <br />
        <strong>Keyboard shortcuts:</strong> Press 1-9 without cell selection to highlight numbers, ESC to clear selection.
        <br />
        Press <strong>Tab</strong> to cycle forward through available cells, <strong>Shift+Tab</strong> to cycle backwards.
        <br />
        Press <strong>Enter</strong> to fill the selected cell with the highlighted number and move to next available cell.
        <br />
        Press <strong>P</strong> to toggle pencil modes: Off → Manual → Auto. <strong>Shift+Number</strong> to add/remove a pencil mark.
        {showAutoSelectEffect && (
          <div 
            style={{ 
              color: '#1890ff', 
              fontWeight: 'bold',
              marginTop: '5px',
              animation: 'fadeIn 0.3s ease-in-out'
            }}
          >
            Number completed! Automatically selected next number.
          </div>
        )}
      </div>
    </div>
  );
};

export default SudokuBoard; 