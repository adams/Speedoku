import { useEffect } from 'react'
import './App.css'
import { SudokuProvider } from './utils/SudokuContext'
import SudokuBoard from './components/SudokuBoard'
import GameControls from './components/GameControls'
import Celebration from './components/Celebration'

function App() {
  return (
    <SudokuProvider>
      <div className="app-container">
        <h1>Sudoku</h1>
        <GameControls />
        <SudokuBoard />
        <Celebration />
      </div>
    </SudokuProvider>
  )
}

export default App
