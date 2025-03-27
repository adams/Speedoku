import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { createEmptyGrid, generatePuzzle, isValid, EMPTY_CELL, GRID_SIZE, BOX_SIZE, isBoardSolvable } from './sudokuUtils';

export interface SudokuContextType {
  grid: number[][];
  initialGrid: number[][];
  selectedCell: [number, number] | null;
  setSelectedCell: (cell: [number, number] | null) => void;
  selectedNumber: number | null;
  isComplete: boolean;
  isGameComplete: boolean;
  setIsComplete: (value: boolean) => void;
  isUnsolvable: boolean;
  setIsUnsolvable: (value: boolean) => void;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  setDifficulty: (difficulty: 'easy' | 'medium' | 'hard' | 'expert') => void;
  setSelectedNumber: (num: number | null) => void;
  generateNewGame: () => void;
  selectCell: (row: number, col: number) => void;
  selectNumber: (num: number) => void;
  fillCell: (row: number, col: number, value: number) => void;
  clearCell: (row: number, col: number) => void;
  checkSolution: () => void;
  isValidPlacement: (row: number, col: number, num: number) => boolean;
  isSameHouseRowOrColumn: (row: number, col: number, num: number) => boolean;
  findFirstAvailableCellForNumber: (num: number) => [number, number] | null;
  findNextIncompleteNumber: () => number | null;
  findNextAvailableCellForNumber: (num: number, reverse?: boolean) => void;
  isCellAvailableForNumber: (row: number, col: number, num: number) => boolean;
  pencilMarks: Record<string, number[]>;
  togglePencilMark: (row: number, col: number, num: number) => void;
  getPencilMarks: (row: number, col: number) => number[];
  clearPencilMarks: (row: number, col: number) => void;
  getValidCandidates: (row: number, col: number) => number[];
  checkIsSolvable: () => boolean;
  startTime: number | null;
  setStartTime: (time: number | null) => void;
  pencilMode: 'off' | 'auto';
  cyclePencilMode: () => void;
}

const SudokuContext = createContext<SudokuContextType | undefined>(undefined);

export const useSudoku = () => {
  const context = useContext(SudokuContext);
  if (!context) {
    throw new Error('useSudoku must be used within a SudokuProvider');
  }
  return context;
};

interface SudokuProviderProps {
  children: ReactNode;
}

const validateSudoku = (grid: number[][]): boolean => {
  // Check each row, column, and box for validity
  const size = grid.length;
  
  // Check rows
  for (let row = 0; row < size; row++) {
    const seen = new Set<number>();
    for (let col = 0; col < size; col++) {
      const value = grid[row][col];
      if (value !== EMPTY_CELL) {
        if (seen.has(value)) return false;
        seen.add(value);
      }
    }
  }
  
  // Check columns
  for (let col = 0; col < size; col++) {
    const seen = new Set<number>();
    for (let row = 0; row < size; row++) {
      const value = grid[row][col];
      if (value !== EMPTY_CELL) {
        if (seen.has(value)) return false;
        seen.add(value);
      }
    }
  }
  
  // Check boxes
  const boxSize = Math.sqrt(size);
  for (let boxRow = 0; boxRow < boxSize; boxRow++) {
    for (let boxCol = 0; boxCol < boxSize; boxCol++) {
      const seen = new Set<number>();
      
      for (let row = boxRow * boxSize; row < (boxRow + 1) * boxSize; row++) {
        for (let col = boxCol * boxSize; col < (boxCol + 1) * boxSize; col++) {
          const value = grid[row][col];
          if (value !== EMPTY_CELL) {
            if (seen.has(value)) return false;
            seen.add(value);
          }
        }
      }
    }
  }
  
  return true;
};

export const SudokuProvider: React.FC<SudokuProviderProps> = ({ children }) => {
  const [grid, setGrid] = useState<number[][]>(createEmptyGrid());
  const [initialGrid, setInitialGrid] = useState<number[][]>(createEmptyGrid());
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [isUnsolvable, setIsUnsolvable] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | 'expert'>('medium');
  const [pencilMarks, setPencilMarks] = useState<Record<string, number[]>>({});
  const [startTime, setStartTime] = useState<number | null>(null);
  const [pencilMode, setPencilMode] = useState<'off' | 'auto'>('auto');

  const generateNewGame = () => {
    // First completely reset the unsolvable state to ensure clean start
    setIsUnsolvable(false);
    
    // Generate new puzzle and reset all states
    const newPuzzle = generatePuzzle(difficulty);
    setGrid(JSON.parse(JSON.stringify(newPuzzle)));
    setInitialGrid(JSON.parse(JSON.stringify(newPuzzle)));
    setSelectedCell(null);
    setIsComplete(false);
    setPencilMarks({});
    setStartTime(Date.now());
    
    // After setting up the new game, find and select the first incomplete number
    setTimeout(() => {
      const nextNumber = findNextIncompleteNumberInGrid(newPuzzle);
      if (nextNumber) {
        setSelectedNumber(nextNumber);
        
        // Find the first available cell for this number and select it
        const firstAvailableCell = findFirstAvailableCellForNumberInGrid(nextNumber, newPuzzle);
        if (firstAvailableCell) {
          setSelectedCell(firstAvailableCell);
        }
      }
    }, 0);
  };

  const selectCell = (row: number, col: number) => {
    setSelectedCell([row, col]);
  };

  const fillCell = (row: number, col: number, value: number) => {
    if (!selectedCell) return;
    
    // Use the passed row and col parameters
    // Don't allow modifying initial puzzle cells
    if (initialGrid[row][col] !== EMPTY_CELL) {
      return;
    }
    
    // Create a new copy of the grid
    const newGrid = grid.map(gridRow => [...gridRow]);
    
    // If the value is valid or empty, update the cell
    if (value === EMPTY_CELL || isValid(newGrid, row, col, value)) {
      // Store the current number before filling the cell
      const currentNumber = selectedNumber;
      
      // Clear pencil marks for this cell
      clearPencilMarks(row, col);
      
      // Update the grid
      newGrid[row][col] = value;
      
      // We need to update the grid state before finding the next cell
      setGrid(newGrid);
      
      // Check if the board is still solvable after this move
      if (value !== EMPTY_CELL) {
        // When making a real move (not clearing), check solvability
        setTimeout(() => {
          const solvable = isBoardSolvable(newGrid);
          setIsUnsolvable(!solvable);
          
          if (!solvable) {
            console.warn("The board is now unsolvable!");
          }
        }, 0);
        
        // Count occurrences of the number after filling
        let count = 0;
        for (let r = 0; r < GRID_SIZE; r++) {
          for (let c = 0; c < GRID_SIZE; c++) {
            if (newGrid[r][c] === value) {
              count++;
            }
          }
        }
        
        // If this number is complete and it's the currently selected number,
        // automatically select the next sequential number
        if (count === 9 && selectedNumber === value) {
          // Find the next sequential number that isn't complete
          let nextNumber = null;
          
          // Start with the next sequential number after the current one
          for (let i = 1; i <= 9; i++) {
            // Try numbers in sequence, starting from the next one after the current value
            const nextSeq = ((value + i - 1) % 9) + 1;
            
            // Check if this number is already complete
            let numCount = 0;
            for (let r = 0; r < GRID_SIZE; r++) {
              for (let c = 0; c < GRID_SIZE; c++) {
                if (newGrid[r][c] === nextSeq) {
                  numCount++;
                }
              }
            }
            
            // If not complete, use this number
            if (numCount < 9) {
              nextNumber = nextSeq;
              break;
            }
          }
          
          if (nextNumber) {
            setSelectedNumber(nextNumber);
            
            // Important: After selecting the next number, we need to find and select
            // the first available cell for that number
            setTimeout(() => {
              const firstAvailableCell = findFirstAvailableCellForNumberInGrid(nextNumber, newGrid);
              if (firstAvailableCell) {
                setSelectedCell(firstAvailableCell);
              }
            }, 0);
          } else {
            setSelectedNumber(null);
          }
        }
        
        // Immediately check completion after grid update
        Promise.resolve().then(() => {
          checkCompletionWithGrid(newGrid);
        });
        
        // After filling, try to find next available cell if the number is still selected
        if (currentNumber === value) {
          // Use the updated grid for finding the next cell
          // We delay this to ensure the UI updates first but use the already-updated grid
          setTimeout(() => {
            if (selectedNumber === currentNumber) {
              // Find the next available cell for this number using the new grid
              const nextCell = findNextAvailableCellForNumberInGrid(currentNumber, selectedCell, newGrid);
              if (nextCell) {
                setSelectedCell(nextCell);
              }
            }
          }, 0);
        }
      }
    }
  };

  // Helper function to find the next incomplete number using a specific grid state
  const findNextIncompleteNumberInGrid = (gridState: number[][]): number | null => {
    // Array to track count of each number (1-9)
    const counts = Array(10).fill(0); // Index 0 is unused
    
    // Count occurrences of each number
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const value = gridState[row][col];
        if (value !== EMPTY_CELL) {
          counts[value]++;
        }
      }
    }
    
    // Find the next number that isn't complete (9 occurrences)
    for (let num = 1; num <= 9; num++) {
      if (counts[num] < 9) {
        return num;
      }
    }
    
    return null; // All numbers are complete
  };
  
  // Helper function to check completion with a specific grid
  const checkCompletionWithGrid = (gridState: number[][]): boolean => {
    // First check if there are any empty cells
    let hasEmptyCells = false;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (gridState[row][col] === EMPTY_CELL) {
          hasEmptyCells = true;
          break;
        }
      }
      if (hasEmptyCells) break;
    }
    
    if (hasEmptyCells) {
      setIsComplete(false);
      return false;
    }
    
    // If no empty cells, validate the solution
    const isValid = validateSudoku(gridState);
    if (isValid) {
      setIsComplete(true);
      console.log("🎉 Puzzle completed! 🎉");
      return true;
    } else {
      setIsComplete(false);
      return false;
    }
  };
  
  // Helper function that finds the next available cell using a specific grid state
  const findNextAvailableCellForNumberInGrid = (
    num: number, 
    currentCell: [number, number] | null,
    gridState: number[][]
  ): [number, number] | null => {
    // If no current cell or number is complete, find the first available cell
    if (!currentCell) {
      return findFirstAvailableCellForNumberInGrid(num, gridState);
    }
    
    // First check if the number is already complete
    let count = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (gridState[row][col] === num) {
          count++;
        }
      }
    }
    
    if (count >= 9) {
      return null; // Number is already filled completely
    }
    
    const [currentRow, currentCol] = currentCell;
    
    // Get current house (box) coordinates
    const currentBoxRow = Math.floor(currentRow / BOX_SIZE);
    const currentBoxCol = Math.floor(currentCol / BOX_SIZE);
    
    // Create an ordering of all house coordinates (0,0) through (2,2)
    const houseCoords: [number, number][] = [];
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        houseCoords.push([boxRow, boxCol]);
      }
    }
    
    // Find the index of the current house
    const currentHouseIndex = houseCoords.findIndex(
      ([row, col]) => row === currentBoxRow && col === currentBoxCol
    );
    
    // First, search within the current house
    const validCellsInCurrentHouse: [number, number][] = [];
    
    // Collect all valid cells in the current house
    for (let r = 0; r < BOX_SIZE; r++) {
      for (let c = 0; c < BOX_SIZE; c++) {
        const row = currentBoxRow * BOX_SIZE + r;
        const col = currentBoxCol * BOX_SIZE + c;
        
        // Skip the current cell itself
        if (row === currentRow && col === currentCol) {
          continue;
        }
        
        // Check if cell is empty and valid for this number
        if (gridState[row][col] === EMPTY_CELL && isValid(gridState, row, col, num)) {
          validCellsInCurrentHouse.push([row, col]);
        }
      }
    }
    
    // Sort cells in proper order: top-to-bottom, left-to-right
    validCellsInCurrentHouse.sort((a, b) => {
      const [rowA, colA] = a;
      const [rowB, colB] = b;
      
      if (rowA !== rowB) return rowA - rowB;
      return colA - colB;
    });
    
    // Find cells that come after the current one in the house
    for (const [row, col] of validCellsInCurrentHouse) {
      if (row < currentRow || (row === currentRow && col < currentCol)) {
        continue; // Skip cells before the current one
      }
      
      return [row, col];
    }
    
    // If we've checked all cells in the current house, move to other houses
    // Check houses in order, starting from the next house
    for (let i = 1; i < houseCoords.length; i++) {
      const nextHouseIndex = (currentHouseIndex + i) % houseCoords.length;
      const [boxRow, boxCol] = houseCoords[nextHouseIndex];
      
      // Collect all valid cells in this house
      const validCellsInHouse: [number, number][] = [];
      
      for (let r = 0; r < BOX_SIZE; r++) {
        for (let c = 0; c < BOX_SIZE; c++) {
          const row = boxRow * BOX_SIZE + r;
          const col = boxCol * BOX_SIZE + c;
          
          // Check if cell is empty and valid for this number
          if (gridState[row][col] === EMPTY_CELL && isValid(gridState, row, col, num)) {
            validCellsInHouse.push([row, col]);
          }
        }
      }
      
      // Sort cells by row then column
      validCellsInHouse.sort((a, b) => {
        const [rowA, colA] = a;
        const [rowB, colB] = b;
        
        if (rowA !== rowB) return rowA - rowB;
        return colA - colB;
      });
      
      if (validCellsInHouse.length > 0) {
        return validCellsInHouse[0];
      }
    }
    
    // If we've gone through all houses and found nothing, 
    // cycle back to the first available cell
    return findFirstAvailableCellForNumberInGrid(num, gridState);
  };
  
  // Helper function to find the first available cell for a number using a specific grid state
  const findFirstAvailableCellForNumberInGrid = (num: number, gridState: number[][]): [number, number] | null => {
    // First check if the number is already complete
    let count = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (gridState[row][col] === num) {
          count++;
        }
      }
    }
    
    if (count >= 9) {
      return null; // Number is already filled completely
    }
    
    // Scan the grid for the first available cell for this number
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (gridState[row][col] === EMPTY_CELL && isValid(gridState, row, col, num)) {
          return [row, col];
        }
      }
    }
    
    return null; // No available spots for this number
  };

  const clearCell = (row: number, col: number) => {
    if (!selectedCell) return;
    
    // Use the passed row and col parameters
    // Don't allow clearing initial puzzle cells
    if (initialGrid[row][col] !== EMPTY_CELL) {
      return;
    }
    
    // Create a new copy of the grid
    const newGrid = grid.map(gridRow => [...gridRow]);
    newGrid[row][col] = EMPTY_CELL;
    setGrid(newGrid);
    setIsComplete(false);
  };

  const checkSolution = () => {
    // Check if the current grid is valid and complete
    const isValid = validateSudoku(grid);
    const isFilled = grid.every(row => row.every(cell => cell !== EMPTY_CELL));
    
    console.log("Check Solution - isValid:", isValid, "isFilled:", isFilled);
    
    if (isValid && isFilled) {
      console.log("SOLUTION IS VALID AND COMPLETE - Setting isComplete to true");
      setIsComplete(true);
    } else {
      // Grid is either invalid or not complete
      console.log("Grid is not complete or invalid");
      setIsComplete(false);
    }
  };

  // Check if placement is valid based on Sudoku rules
  const isValidPlacement = (row: number, col: number, num: number): boolean => {
    return isValid(grid, row, col, num);
  };

  // Check if number exists in same house, row, or column
  const isSameHouseRowOrColumn = (row: number, col: number, num: number): boolean => {
    if (grid[row][col] !== EMPTY_CELL) {
      return false; // Cell already has a number
    }
    
    // Check row
    for (let x = 0; x < GRID_SIZE; x++) {
      if (grid[row][x] === num) {
        return true;
      }
    }

    // Check column
    for (let y = 0; y < GRID_SIZE; y++) {
      if (grid[y][col] === num) {
        return true;
      }
    }

    // Check box
    const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
    const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
    
    for (let y = 0; y < BOX_SIZE; y++) {
      for (let x = 0; x < BOX_SIZE; x++) {
        if (grid[boxRow + y][boxCol + x] === num) {
          return true;
        }
      }
    }

    return false;
  };

  // Find the first available cell for a given number
  const findFirstAvailableCellForNumber = (num: number): [number, number] | null => {
    // First check if the number is already complete
    let count = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] === num) {
          count++;
        }
      }
    }
    
    if (count >= 9) {
      return null; // Number is already filled completely
    }
    
    // Find first available cell, house by house
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        // Check cells within this house (3x3 box)
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const row = boxRow * 3 + r;
            const col = boxCol * 3 + c;
            
            // Skip cells that are already filled
            if (grid[row][col] !== EMPTY_CELL) {
              continue;
            }
            
            // Check if the number can be placed here
            if (isValid(grid, row, col, num)) {
              return [row, col];
            }
          }
        }
      }
    }
    
    return null; // No available cell found
  };

  // Find the next incomplete number
  const findNextIncompleteNumber = (): number | null => {
    // Get counts of all numbers
    const counts: Record<number, number> = {};
    
    // Initialize counts
    for (let num = 1; num <= 9; num++) {
      counts[num] = 0;
    }
    
    // Count occurrences
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const value = grid[row][col];
        if (value > 0) {
          counts[value]++;
        }
      }
    }
    
    // Find next incomplete number after the currently selected one
    let startNum = selectedNumber ? selectedNumber + 1 : 1;
    if (startNum > 9) startNum = 1;
    
    // Try to find a number starting from the next one after selected
    for (let i = 0; i < 9; i++) {
      const num = ((startNum - 1 + i) % 9) + 1;
      if (counts[num] < 9 && findFirstAvailableCellForNumber(num) !== null) {
        return num;
      }
    }
    
    return null; // No incomplete numbers found
  };

  // Find the next available cell for a given number, cycling through houses
  const findNextAvailableCellForNumber = (num: number, reverse?: boolean) => {
    // If no current cell or number is complete, find the first available cell
    if (!selectedCell) {
      return findFirstAvailableCellForNumber(num);
    }
    
    // First check if the number is already complete
    let count = 0;
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        if (grid[row][col] === num) {
          count++;
        }
      }
    }
    
    if (count >= 9) {
      return null; // Number is already filled completely
    }
    
    const [currentRow, currentCol] = selectedCell;
    
    // Get current house (box) coordinates
    const currentBoxRow = Math.floor(currentRow / BOX_SIZE);
    const currentBoxCol = Math.floor(currentCol / BOX_SIZE);
    
    // Create an ordering of all house coordinates (0,0) through (2,2)
    const houseCoords: [number, number][] = [];
    for (let boxRow = 0; boxRow < 3; boxRow++) {
      for (let boxCol = 0; boxCol < 3; boxCol++) {
        houseCoords.push([boxRow, boxCol]);
      }
    }
    
    // Find the index of the current house
    const currentHouseIndex = houseCoords.findIndex(
      ([row, col]) => row === currentBoxRow && col === currentBoxCol
    );
    
    // First, search within the current house
    // If going in reverse, we need to search cells in reverse order
    const validCellsInCurrentHouse: [number, number][] = [];
    
    // Collect all valid cells in the current house
    for (let r = 0; r < BOX_SIZE; r++) {
      for (let c = 0; c < BOX_SIZE; c++) {
        const row = currentBoxRow * BOX_SIZE + r;
        const col = currentBoxCol * BOX_SIZE + c;
        
        // Skip the current cell itself
        if (row === currentRow && col === currentCol) {
          continue;
        }
        
        // Check if cell is empty and valid for this number
        if (grid[row][col] === EMPTY_CELL && isValid(grid, row, col, num)) {
          validCellsInCurrentHouse.push([row, col]);
        }
      }
    }
    
    // Sort cells in proper order based on direction
    // For forward: top-to-bottom, left-to-right
    // For reverse: bottom-to-top, right-to-left
    validCellsInCurrentHouse.sort((a, b) => {
      const [rowA, colA] = a;
      const [rowB, colB] = b;
      
      if (reverse) {
        // First by row (bottom to top), then by column (right to left)
        if (rowA !== rowB) return rowB - rowA;
        return colB - colA;
      } else {
        // First by row (top to bottom), then by column (left to right)
        if (rowA !== rowB) return rowA - rowB;
        return colA - colB;
      }
    });
    
    // Find cells that come after/before the current one in the house
    for (const [row, col] of validCellsInCurrentHouse) {
      if (reverse) {
        // In reverse, we want cells that come before the current one
        if (row > currentRow || (row === currentRow && col > currentCol)) {
          continue; // Skip cells after the current one
        }
      } else {
        // In forward, we want cells that come after the current one
        if (row < currentRow || (row === currentRow && col < currentCol)) {
          continue; // Skip cells before the current one
        }
      }
      
      return [row, col];
    }
    
    // If we've checked all cells in the current house, move to other houses
    // Check houses in order (forward or reverse), starting from the next/prev house
    const houseCheckOrder = [...Array(houseCoords.length - 1).keys()].map(i => {
      if (reverse) {
        // Go backwards
        return (currentHouseIndex - 1 - i + houseCoords.length) % houseCoords.length;
      } else {
        // Go forwards
        return (currentHouseIndex + 1 + i) % houseCoords.length;
      }
    });
    
    for (const nextHouseIndex of houseCheckOrder) {
      const [boxRow, boxCol] = houseCoords[nextHouseIndex];
      
      // Collect all valid cells in this house
      const validCellsInHouse: [number, number][] = [];
      
      for (let r = 0; r < BOX_SIZE; r++) {
        for (let c = 0; c < BOX_SIZE; c++) {
          const row = boxRow * BOX_SIZE + r;
          const col = boxCol * BOX_SIZE + c;
          
          // Check if cell is empty and valid for this number
          if (grid[row][col] === EMPTY_CELL && isValid(grid, row, col, num)) {
            validCellsInHouse.push([row, col]);
          }
        }
      }
      
      // Sort cells in proper order based on direction
      validCellsInHouse.sort((a, b) => {
        const [rowA, colA] = a;
        const [rowB, colB] = b;
        
        if (reverse) {
          // First by row (bottom to top), then by column (right to left)
          if (rowA !== rowB) return rowB - rowA;
          return colB - colA;
        } else {
          // First by row (top to bottom), then by column (left to right)
          if (rowA !== rowB) return rowA - rowB;
          return colA - colB;
        }
      });
      
      if (validCellsInHouse.length > 0) {
        // In reverse mode, get the last cell; in forward mode, get the first cell
        return reverse ? validCellsInHouse[validCellsInHouse.length - 1] : validCellsInHouse[0];
      }
    }
    
    // If we've gone through all houses and found nothing, 
    // cycle back to the first available cell
    return findFirstAvailableCellForNumber(num);
  };

  // Generate a key for storing pencil marks
  const getPencilMarkKey = (row: number, col: number): string => {
    return `${row},${col}`;
  };

  // Toggle a pencil mark for a cell
  const togglePencilMark = (row: number, col: number, num: number) => {
    // Don't allow pencil marks on filled or initial cells
    if (grid[row][col] !== EMPTY_CELL || initialGrid[row][col] !== EMPTY_CELL) {
      return;
    }
    
    const key = getPencilMarkKey(row, col);
    const currentMarks = pencilMarks[key] || [];
    
    setPencilMarks(prev => {
      if (currentMarks.includes(num)) {
        // Remove the mark if it already exists
        return {
          ...prev,
          [key]: currentMarks.filter(mark => mark !== num)
        };
      } else {
        // Add the mark if it doesn't exist
        return {
          ...prev,
          [key]: [...currentMarks, num].sort()
        };
      }
    });
  };

  // Get pencil marks for a cell
  const getPencilMarks = (row: number, col: number): number[] => {
    const key = getPencilMarkKey(row, col);
    return pencilMarks[key] || [];
  };

  // Clear all pencil marks for a cell
  const clearPencilMarks = (row: number, col: number) => {
    const key = getPencilMarkKey(row, col);
    setPencilMarks(prev => {
      const newMarks = { ...prev };
      delete newMarks[key];
      return newMarks;
    });
  };

  // Calculate all valid numbers that could go into a cell
  const getValidCandidates = (row: number, col: number): number[] => {
    // If the cell is already filled, return empty array
    if (grid[row][col] !== EMPTY_CELL) {
      return [];
    }
    
    // Start with all numbers 1-9
    const candidates: number[] = [];
    
    // Check each number 1-9
    for (let num = 1; num <= 9; num++) {
      if (isValid(grid, row, col, num)) {
        candidates.push(num);
      }
    }
    
    return candidates;
  };

  // Check if the current board is solvable
  const checkIsSolvable = () => {
    const solvable = isBoardSolvable(grid);
    setIsUnsolvable(!solvable);
    return solvable;
  };
  
  // Cycle through pencil modes: off -> auto -> off
  const cyclePencilMode = () => {
    setPencilMode(current => current === 'off' ? 'auto' : 'off');
  };

  // Start a new game when the component mounts but don't start timer
  useEffect(() => {
    const newPuzzle = generatePuzzle(difficulty);
    setGrid(JSON.parse(JSON.stringify(newPuzzle)));
    setInitialGrid(JSON.parse(JSON.stringify(newPuzzle)));
    setSelectedCell(null);
    setIsComplete(false);
    setIsUnsolvable(false);
    setPencilMarks({});
    
    // After setting up the new game, find and select the first incomplete number
    setTimeout(() => {
      const nextNumber = findNextIncompleteNumberInGrid(newPuzzle);
      if (nextNumber) {
        setSelectedNumber(nextNumber);
        
        // Find the first available cell for this number and select it
        const firstAvailableCell = findFirstAvailableCellForNumberInGrid(nextNumber, newPuzzle);
        if (firstAvailableCell) {
          setSelectedCell(firstAvailableCell);
        }
      }
    }, 0);
  }, []);

  // Add isCellAvailableForNumber function
  const isCellAvailableForNumber = (row: number, col: number, num: number): boolean => {
    // Check if the cell is empty and we can place the number there
    return grid[row][col] === EMPTY_CELL && isValid(grid, row, col, num);
  };

  return (
    <SudokuContext.Provider
      value={{
        grid,
        initialGrid,
        selectedCell,
        setSelectedCell,
        selectedNumber,
        isComplete,
        isGameComplete: isComplete && !isUnsolvable,
        setIsComplete,
        isUnsolvable,
        setIsUnsolvable,
        difficulty,
        setDifficulty,
        setSelectedNumber,
        generateNewGame,
        selectCell,
        selectNumber: (num: number) => setSelectedNumber(num),
        fillCell,
        clearCell,
        checkSolution,
        isValidPlacement,
        isSameHouseRowOrColumn,
        findFirstAvailableCellForNumber,
        findNextIncompleteNumber,
        findNextAvailableCellForNumber,
        isCellAvailableForNumber,
        pencilMarks,
        togglePencilMark,
        getPencilMarks,
        clearPencilMarks,
        getValidCandidates,
        checkIsSolvable,
        startTime,
        setStartTime,
        pencilMode,
        cyclePencilMode,
      }}
    >
      {children}
    </SudokuContext.Provider>
  );
}; 