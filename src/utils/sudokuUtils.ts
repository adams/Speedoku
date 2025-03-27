// Constants
export const GRID_SIZE = 9;
export const BOX_SIZE = 3;
export const EMPTY_CELL = 0;

// Create an empty grid
export const createEmptyGrid = (): number[][] => {
  return Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(EMPTY_CELL));
};

// Check if a number can be placed at the specified position
export const isValid = (grid: number[][], row: number, col: number, num: number): boolean => {
  // Check row
  for (let x = 0; x < GRID_SIZE; x++) {
    if (grid[row][x] === num) {
      return false;
    }
  }

  // Check column
  for (let y = 0; y < GRID_SIZE; y++) {
    if (grid[y][col] === num) {
      return false;
    }
  }

  // Check box
  const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE;
  const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE;
  
  for (let y = 0; y < BOX_SIZE; y++) {
    for (let x = 0; x < BOX_SIZE; x++) {
      if (grid[boxRow + y][boxCol + x] === num) {
        return false;
      }
    }
  }

  return true;
};

// Generate a solved Sudoku grid
export const generateSolvedGrid = (): number[][] => {
  const grid = createEmptyGrid();
  solveSudoku(grid);
  return grid;
};

// Solve a Sudoku grid using backtracking
const solveSudoku = (grid: number[][]): boolean => {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === EMPTY_CELL) {
        // Shuffle array of numbers 1-9
        const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);
        
        for (const num of nums) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            
            if (solveSudoku(grid)) {
              return true;
            }
            
            grid[row][col] = EMPTY_CELL;
          }
        }
        
        return false;
      }
    }
  }
  
  return true;
};

// Generate a Sudoku puzzle by removing numbers from a solved grid
export const generatePuzzle = (difficulty: 'easy' | 'medium' | 'hard' | 'expert'): number[][] => {
  const solvedGrid = generateSolvedGrid();
  const puzzle = JSON.parse(JSON.stringify(solvedGrid)); // Deep copy
  
  // Define how many cells to remove based on difficulty
  const cellsToRemove = {
    easy: 30,
    medium: 40,
    hard: 50,
    expert: 55
  };
  
  let count = 0;
  const totalToRemove = cellsToRemove[difficulty];
  
  // For expert level, we'll try to create a more challenging puzzle
  // by ensuring we don't leave too many numbers in any single row/column/box
  if (difficulty === 'expert') {
    // First, remove numbers evenly across the grid
    for (let box = 0; box < 9; box++) {
      const boxRow = Math.floor(box / 3) * 3;
      const boxCol = (box % 3) * 3;
      
      // Remove 6-7 numbers from each box
      let boxCount = 0;
      while (boxCount < 6) {
        const row = boxRow + Math.floor(Math.random() * 3);
        const col = boxCol + Math.floor(Math.random() * 3);
        
        if (puzzle[row][col] !== EMPTY_CELL) {
          puzzle[row][col] = EMPTY_CELL;
          boxCount++;
          count++;
        }
      }
    }
    
    // Then remove remaining numbers randomly
    while (count < totalToRemove) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      
      if (puzzle[row][col] !== EMPTY_CELL) {
        puzzle[row][col] = EMPTY_CELL;
        count++;
      }
    }
  } else {
    // For other difficulties, use the original random removal method
    while (count < totalToRemove) {
      const row = Math.floor(Math.random() * GRID_SIZE);
      const col = Math.floor(Math.random() * GRID_SIZE);
      
      if (puzzle[row][col] !== EMPTY_CELL) {
        puzzle[row][col] = EMPTY_CELL;
        count++;
      }
    }
  }
  
  return puzzle;
};

// Check if the puzzle is solved correctly
export const isPuzzleSolved = (grid: number[][]): boolean => {
  // Check if there are any empty cells
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === EMPTY_CELL) {
        return false;
      }
    }
  }
  
  // Check if all rows, columns, and boxes are valid
  for (let i = 0; i < GRID_SIZE; i++) {
    if (!isRowValid(grid, i) || !isColValid(grid, i) || !isBoxValid(grid, i)) {
      return false;
    }
  }
  
  return true;
};

// Check if a row is valid
const isRowValid = (grid: number[][], row: number): boolean => {
  const seen = new Set();
  for (let col = 0; col < GRID_SIZE; col++) {
    const num = grid[row][col];
    if (num !== EMPTY_CELL && seen.has(num)) {
      return false;
    }
    seen.add(num);
  }
  return true;
};

// Check if a column is valid
const isColValid = (grid: number[][], col: number): boolean => {
  const seen = new Set();
  for (let row = 0; row < GRID_SIZE; row++) {
    const num = grid[row][col];
    if (num !== EMPTY_CELL && seen.has(num)) {
      return false;
    }
    seen.add(num);
  }
  return true;
};

// Check if a box is valid
const isBoxValid = (grid: number[][], index: number): boolean => {
  const seen = new Set();
  const boxRow = Math.floor(index / BOX_SIZE) * BOX_SIZE;
  const boxCol = (index % BOX_SIZE) * BOX_SIZE;
  
  for (let row = 0; row < BOX_SIZE; row++) {
    for (let col = 0; col < BOX_SIZE; col++) {
      const num = grid[boxRow + row][boxCol + col];
      if (num !== EMPTY_CELL && seen.has(num)) {
        return false;
      }
      seen.add(num);
    }
  }
  return true;
};

// Check if the current board state is still solvable
export const isBoardSolvable = (grid: number[][]): boolean => {
  // Create a deep copy of the grid for solving attempts
  const gridCopy = grid.map(row => [...row]);
  
  // Try to solve the current grid state
  return checkSolvability(gridCopy);
};

// Solver using backtracking algorithm to check solvability
function checkSolvability(grid: number[][]): boolean {
  const emptyCell = findEmptyCell(grid);
  
  // If no empty cell is found, the puzzle is solved
  if (!emptyCell) {
    return true;
  }
  
  const [row, col] = emptyCell;
  
  // Try placing each number 1-9
  for (let num = 1; num <= 9; num++) {
    // Check if placing this number is valid
    if (isValid(grid, row, col, num)) {
      // Place the number
      grid[row][col] = num;
      
      // Recursively try to solve the rest of the puzzle
      if (checkSolvability(grid)) {
        return true;
      }
      
      // If placing this number doesn't lead to a solution, backtrack
      grid[row][col] = 0;
    }
  }
  
  // If no number leads to a solution, this configuration is unsolvable
  return false;
}

// Helper function to find an empty cell in the grid
function findEmptyCell(grid: number[][]): [number, number] | null {
  for (let row = 0; row < GRID_SIZE; row++) {
    for (let col = 0; col < GRID_SIZE; col++) {
      if (grid[row][col] === EMPTY_CELL) {
        return [row, col];
      }
    }
  }
  return null;
} 