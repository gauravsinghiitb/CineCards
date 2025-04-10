// src/components/SongGrid.js
import React, { useEffect } from 'react';
import Masonry from 'react-masonry-css';
import SongCard from './SongCard';
import './SongGrid.css';
import imagesLoaded from 'imagesloaded';

function SongGrid({ songs }) {
  const breakpointColumnsObj = {
    default: 5,
    1600: 5,
    1400:4,
    1200: 3,
    1000: 2,
    800: 1,
  };

  useEffect(() => {
    const grid = document.querySelector('.my-masonry-grid');
    if (grid) {
      imagesLoaded(grid, () => {
        window.dispatchEvent(new Event('resize'));
      });
    }
  }, [songs]);

  return (
    <Masonry
      breakpointCols={breakpointColumnsObj}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {songs.map(song => (
        <SongCard key={song.id} song={song} />
      ))}
    </Masonry>
  );
}

export default SongGrid;
