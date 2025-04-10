// src/components/GenreSection.js
import React from 'react';
import MovieGrid from './MovieGrid';
import './GenreSection.css';

function GenreSection({ genre, movies }) {
  return (
    <div className="genre-section">
      <h2 className="genre-title">{genre.name}</h2>
      <MovieGrid movies={movies} />
    </div>
  );
}

export default GenreSection;
