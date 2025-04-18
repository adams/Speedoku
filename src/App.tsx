import React, { useEffect, useRef } from 'react'
import './App.css'
import { SudokuProvider } from './utils/SudokuContext'
import SudokuBoard, { SudokuBoardHandle } from './components/SudokuBoard'

const AppContent: React.FC = () => {
  // Reference to the SudokuBoard component
  const sudokuBoardRef = useRef<SudokuBoardHandle>(null);

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Speedoku</h1>
      </header>

      <main className="app-main">
        <div className="game-content">
          <SudokuBoard ref={sudokuBoardRef} />
        </div>
      </main>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Speedoku - A rogue-like puzzle game by Mike Adams</p>
      </footer>
    </div>
  )
}

const App: React.FC = () => {
  useEffect(() => {
    // Update the document title
    document.title = 'Speedoku';
  }, []);

  return (
    <SudokuProvider>
      <AppContent />
    </SudokuProvider>
  )
}

export default App
