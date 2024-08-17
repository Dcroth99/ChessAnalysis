// src/App.js

import { BrowserRouter as Router, Route, Routes, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import GameAnalysis from './components/GameAnalysis';
import './App.css'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/analysis" element={<GameAnalysis />} />
      </Routes>
    </Router>
  );
};

export default App;