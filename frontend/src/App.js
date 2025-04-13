import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IndexPage from './pages/IndexPage';
import QuestionPage from './pages/QuestionPage';
import MoviePage from './pages/MoviePage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/questions" element={<QuestionPage />} />
        <Route path="/movie" element={<MoviePage />} />
      </Routes>
    </Router>
  );
}

export default App;
