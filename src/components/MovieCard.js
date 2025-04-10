// src/components/MovieCard.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart, faDownload } from '@fortawesome/free-solid-svg-icons';
import './MovieCard.css';

function MovieCard({ movie, likeCount: externalLikeCount, setLikeCount: externalSetLikeCount }) {
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // If external like count is provided, use that; otherwise, use internal state
  const [internalLikeCount, setInternalLikeCount] = useState(() => {
    return parseInt(localStorage.getItem(`likeCount-${movie.id}`)) || 0;
  });

  const likeCount = typeof externalLikeCount === 'number' ? externalLikeCount : internalLikeCount;
  const setLikeCount = externalSetLikeCount || setInternalLikeCount;

  // Persist the like count in localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(`likeCount-${movie.id}`, likeCount);
  }, [likeCount, movie.id]);

 const posterUrl = movie.poster_path
  ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
  : 'https://via.placeholder.com/400x400';

const runningTime = movie.runtime
  ? `${movie.runtime} MINUTES`
  : movie.episode_run_time?.[0]
  ? `${movie.episode_run_time[0]} MINUTES`
  : 'N/A';

const director =
  movie.credits?.crew?.find(member => member.job === 'Director')?.name || 'N/A';

const producers = movie.production_companies?.map(pc => pc.name).join('  ') || 'N/A';

const cast =
  movie.credits?.cast?.slice(0, 3).map(member => member.name).join(', ') || 'N/A';

const title = movie.title || movie.name || 'UNKNOWN';

const year = movie.release_date
  ? movie.release_date.split('-')[0]
  : movie.first_air_date
  ? movie.first_air_date.split('-')[0]
  : 'N/A';


  const handleLike = (e) => {
    e.stopPropagation();
    setLikeCount(likeCount + 1);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          useCORS: true,
          scale: 8,
        });
        const link = document.createElement("a");
        link.download = `${title}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error("Download failed", error);
      }
    }
  };

  const handleCardClick = () => {
    navigate(`/movies/${movie.id}`);
  };

  return (
    <div className="whiplash-card" onClick={handleCardClick} ref={cardRef}>
      <div className="whiplash-poster-container">
        <img src={posterUrl} alt={title} className="whiplash-poster" crossOrigin="anonymous" />
        <div className="card-overlay">
          <button className="overlay-btn" onClick={handleLike}>
            <FontAwesomeIcon icon={faHeart} /> {likeCount}
          </button>
          <button className="overlay-btn" onClick={handleDownload}>
            <FontAwesomeIcon icon={faDownload} />
          </button>
        </div>
      </div>
      <h1 className="whiplash-title">
        {title} <span className="whiplash-year">{year}</span>
      </h1>
      <div className="whiplash-details">
        <p><strong>running time </strong><span>{runningTime}</span></p>
        <p><strong>directed by </strong><span>{director}</span></p>
        <p><strong>produced by</strong> <span>{producers}</span></p>
        <p><strong>starring </strong><span>{cast}</span></p>
      </div>
    </div>
  );
}

export default MovieCard;
