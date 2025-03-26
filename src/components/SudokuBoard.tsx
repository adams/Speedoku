import React, { useEffect, useState } from 'react';
import { useSudoku } from '../utils/SudokuContext';
import SudokuCell from './SudokuCell';
import NumberSelector from './NumberSelector';
import Timer from './Timer';
import UnsolvableModal from './UnsolvableModal';
import { EMPTY_CELL } from '../utils/sudokuUtils';

const SudokuBoard: React.FC = () => {
  const { 
    grid, 
    initialGrid, 
    fillCell, 
    clearCell, 
    selectedCell, 
    checkSolution,
    setSelectedCell,
    selectedNumber, 
    setSelectedNumber,
    findFirstAvailableCellForNumber,
    findNextIncompleteNumber,
    findNextAvailableCellForNumber,
    togglePencilMark,
    pencilMode,
    cyclePencilMode,
    isUnsolvable,
    generateNewGame
  } = useSudoku();
  
  // State to track auto-selection animation
  const [showAutoSelectEffect, setShowAutoSelectEffect] = useState(false);
  
  // Track previous selected number to detect auto-selection
  const [prevSelectedNumber, setPrevSelectedNumber] = useState<number | null>(null);
  
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
        cell = findNextAvailableCellForNumber(selectedNumber, reverse);
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
    console.log("Grid changed, checking solution after delay...");
    const timer = setTimeout(() => {
      console.log("Calling checkSolution after grid change");
      checkSolution();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [grid, checkSolution]);
  
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
      
      // 'N' key - start a new game
      if (e.key === 'n' || e.key === 'N') {
        generateNewGame();
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
          const [row, col] = selectedCell;
          
          // Regular mode - fill the cell
          fillCell(row, col, selectedNumber);
          
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
          const [row, col] = selectedCell;
          fillCell(row, col, num);
        }
      }
      // Handle backspace and delete keys for clearing
      else if (e.key === 'Backspace' || e.key === 'Delete') {
        if (selectedCell) {
          const [row, col] = selectedCell;
          clearCell(row, col);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    
    // Cleanup
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedCell, selectedNumber, fillCell, clearCell, setSelectedCell, setSelectedNumber, jumpToAvailableCell, pencilMode, togglePencilMark, cyclePencilMode]);
  
  return (
    <div className="game-layout">
      <div className="game-main-content">
        <div 
          className="sudoku-board-container"
          style={{
            position: 'relative',
            width: 'fit-content',
            margin: '0 auto',
          }}
        >
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
          {isUnsolvable && (
            <UnsolvableModal 
              onNewGame={generateNewGame} 
            />
          )}
        </div>
        <NumberSelector showAutoSelectEffect={showAutoSelectEffect} />
      </div>
      
      <div className="game-sidebar">
        <Timer isGameOver={isUnsolvable} />
        <div className="keyboard-instructions">
          <div className="shortcuts-grid">
            <div className="shortcut-group">
              <div><span className="keyboard-shortcut">Tab</span> Next available cell</div>
              <div><span className="keyboard-shortcut">Shift</span> + <span className="keyboard-shortcut">Tab</span> Previous cell</div>
              <div><span className="keyboard-shortcut">Esc</span> Clear selection</div>
            </div>
            
            <div className="shortcut-group">
              <div><span className="keyboard-shortcut">1</span>-<span className="keyboard-shortcut">9</span> Select/input number</div>
              <div><span className="keyboard-shortcut">Enter</span> Confirm number & move next</div>
              <div><span className="keyboard-shortcut">Backspace</span> Clear selected cell</div>
            </div>
            
            <div className="shortcut-group">
              <div><span className="keyboard-shortcut">P</span> Toggle pencil mode</div>
            </div>
            
            <div className="shortcut-group">
              <div><span className="keyboard-shortcut">N</span> New game</div>
            </div>
          </div>
          {showAutoSelectEffect && (
            <div 
              style={{ 
                color: 'var(--primary-color)', 
                fontWeight: 'bold',
                marginTop: '10px',
                animation: 'fadeIn 0.3s ease-in-out',
                padding: '5px 10px',
                backgroundColor: 'rgba(41, 98, 255, 0.1)',
                borderRadius: '4px'
              }}
            >
              Number completed! Automatically selected next number.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SudokuBoard; 