// src/components/MovieGrid.js
import React, { useEffect } from 'react';
import Masonry from 'react-masonry-css';
import MovieCard from './MovieCard';
import './MovieGrid.css';
import imagesLoaded from 'imagesloaded';

function MovieGrid({ movies }) {
  const breakpointColumnsObj = {
    default: 5,
    1600: 5,
    1400:4,
    1200: 3,
    1000: 2,
    800: 1,
  };

  useEffect(() => {
    // Wait for images to load before triggering a layout recalculation
    const grid = document.querySelector('.my-masonry-grid');
    if (grid) {
      imagesLoaded(grid, () => {
        window.dispatchEvent(new Event('resize'));
      });
    }
  }, [movies]);

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </Masonry>
  );
}

export default MovieGrid;
