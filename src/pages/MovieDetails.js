import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import './MovieDetails.css';
import MovieCard from '../components/MovieCard';
import html2canvas from 'html2canvas';

const MovieDetail = () => {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [trailer, setTrailer] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [userRating, setUserRating] = useState('');
  const [providers, setProviders] = useState([]);
  const [showAllCast, setShowAllCast] = useState(false);
  const scrollRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const fetchMovieDetails = async () => {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=780edce5e4ff8162273812ff59156b98&append_to_response=videos,credits,similar`);
      const data = await res.json();
      setMovie(data);
      setCast(data.credits.cast);
      const trailerVideo = data.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
      setTrailer(trailerVideo);

      const similarDetailed = await Promise.all(
        data.similar.results.map(async (m) => {
          const res = await fetch(`https://api.themoviedb.org/3/movie/${m.id}?api_key=780edce5e4ff8162273812ff59156b98&append_to_response=credits`);
          return await res.json();
        })
      );
      setSimilarMovies(similarDetailed);
    };

    const fetchWatchProviders = async () => {
      const res = await fetch(`https://api.themoviedb.org/3/movie/${id}/watch/providers?api_key=780edce5e4ff8162273812ff59156b98`);
      const data = await res.json();
      const regionData = data.results?.['IN'];
      setProviders(regionData?.flatrate || []);
    };

    fetchMovieDetails();
    fetchWatchProviders();
  }, [id]);

  const handleCommentSubmit = () => {
    if (newComment.trim()) {
      setComments([...comments, newComment]);
      setNewComment('');
    }
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, { useCORS: true, scale: 2 });
        const link = document.createElement('a');
        link.download = `${movie.title}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error("Download failed", error);
      }
    }
  };

  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const visibleCast = showAllCast ? cast : cast.slice(0, 12);

  if (!movie) return <div>Loading...</div>;

  return (
    <div>
      <div className="movie-detail-container">
        <div className="movie-detail-card" ref={cardRef}>
          <MovieCard movie={movie} />
        </div>
        <div className="movie-detail-info">
          <h1>{movie.title}</h1>
          <p><strong>Release Year:</strong> {movie.release_date?.split('-')[0]}</p>
          <p><strong>Runtime:</strong> {movie.runtime} mins</p>
          <p><strong>Rating:</strong> {Number(movie.vote_average).toFixed(1)}</p>
          <p><strong>Overview:</strong> {movie.overview}</p>

          {providers.length > 0 && (
            <div className="watch-providers">
              <h2>Watch On</h2>
              <div className="provider-logos">
                {providers.map((p, idx) => (
                  <img key={idx} src={`https://image.tmdb.org/t/p/w92${p.logo_path}`} alt={p.provider_name} title={p.provider_name} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      

      <div className="additional-details">
        <div className="cast-section">
          <h2>Cast</h2>
          <div className="cast-grid">
            {visibleCast.map(actor => (
              <div className="cast-card" key={actor.cast_id}>
                <img src={`https://image.tmdb.org/t/p/w185${actor.profile_path}`} alt={actor.name} />
                <p><strong>{actor.name}</strong></p>
                <p>as {actor.character}</p>
              </div>
            ))}
          </div>
          {cast.length > 12 && (
            <button className="toggle-cast-button" onClick={() => setShowAllCast(prev => !prev)}>
              {showAllCast ? 'Show Less' : 'Show More'}
            </button>
          )}
        </div>

        {trailer && (
          <div className="trailer-section">
            <h2>Trailer</h2>
            <div className="trailer-container">
              <iframe src={`https://www.youtube.com/embed/${trailer.key}`} allowFullScreen title="Trailer" />
            </div>
          </div>
        )}

        <div className="similar-movies-section">
          <h2>Similar Movies</h2>
          <div className="scroll-container">
            <div className="scroll-arrow left" onClick={() => scroll(-320)}>&#8249;</div>
            <div className="similar-movies-scroll" ref={scrollRef}>
              {similarMovies.map(similar => (
                <div className="scroll-item" key={similar.id}>
                  <MovieCard movie={similar} showActualArtist />
                </div>
              ))}
            </div>
            <div className="scroll-arrow right" onClick={() => scroll(320)}>&#8250;</div>
          </div>
        </div>

        <div className="comments-section">
            <h2>Comments</h2>
            <div className="comment-box">
              <textarea
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault(); // Prevent newline
                    handleCommentSubmit();
                  }
                }}
                placeholder="Write your comment..."
              />
              <button onClick={handleCommentSubmit}>Submit Comment</button>
            </div>
            <div className="comment-list">
              {comments.map((c, i) => (
                <div key={i} className="comment-item">{c}</div>
              ))}
            </div>
          </div>


        <div className="rating-section">
          <h2>Rate this Movie (out of 100)</h2>
          <input
            type="number"
            min="1"
            max="10"
            value={userRating || ''}
            onChange={e => setUserRating(e.target.value)}
            placeholder="Enter rating 1-10"
          />
          {userRating && <p>Thanks for rating this movie {userRating}/100!</p>}
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
