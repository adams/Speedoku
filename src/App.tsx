import React, { useState, useEffect } from 'react'
import './App.css'
import { SudokuProvider, useSudoku } from './utils/SudokuContext'
import SudokuBoard from './components/SudokuBoard'
import GameControls from './components/GameControls'
import Celebration from './components/Celebration'

const AppContent: React.FC = () => {
  const [showCelebration, setShowCelebration] = useState(false);
  const { isComplete } = useSudoku();
  
  useEffect(() => {
    // When the game is complete, show the celebration
    if (isComplete) {
      setShowCelebration(true);
    }
  }, [isComplete]);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Speedoku</h1>
        <p className="tagline">Race against time. Master the grid.</p>
      </header>

      <main className="app-main">
        <GameControls />
        <div className="game-content">
          <SudokuBoard />
        </div>
        
        {showCelebration && <Celebration onComplete={() => setShowCelebration(false)} />}
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Speedoku - The fastest way to solve Sudoku</p>
      </footer>
    </div>
  )
}

const App: React.FC = () => {
  useEffect(() => {
    // Update the document title
    document.title = 'Speedoku - Solve Puzzles at Lightning Speed';
  }, []);

  return (
    <SudokuProvider>
      <AppContent />
    </SudokuProvider>
  )
}

export default App
