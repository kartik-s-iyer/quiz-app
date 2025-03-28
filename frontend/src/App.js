import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import QuizSetup from './components/QuizSetup';
import TeamSetup from './components/TeamSetup';
import QuizRunner from './components/QuizRunner';
import QuizStats from './components/QuizStats';
import { QuizProvider } from './contexts/QuizContext';

function App() {
  return (
    <div className="App">
      <QuizProvider>
        <Routes>
          <Route path="/" element={<QuizSetup />} />
          <Route path="/team-setup" element={<TeamSetup />} />
          <Route path="/quiz" element={<QuizRunner />} />
          <Route path="/stats" element={<QuizStats />} />
        </Routes>
      </QuizProvider>
    </div>
  );
}

export default App; 