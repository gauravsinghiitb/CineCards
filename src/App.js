// src/App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import HomePage from './pages/HomePage';
import MovieDetails from './pages/MovieDetails';
import SongHome from './pages/SongHome';
import SongDetail from './pages/SongDetail'; // optional

function App() {
  return (
    <>
      <NavBar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/movies/:id" element={<MovieDetails />} />
        <Route path="/songs" element={<SongHome />} />
        <Route path="/songs/:id" element={<SongDetail />} />
      </Routes>
    </>
  );
}

export default App;
