import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import '../components/SongCard.css';

const SPOTIFY_CLIENT_ID = 'cb0e3470ea594552be77c98ff842bf00';
const SPOTIFY_CLIENT_SECRET = '44d59ee58643452ca03133ce352fcc1a';

// Helper to fetch Spotify token (this is a minimal example; consider caching the token)
async function fetchSpotifyToken() {
  const creds = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);
  const res = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${creds}`,
    },
    body: 'grant_type=client_credentials',
  });
  const data = await res.json();
  return data.access_token;
}

// Fetch artist details by ID using the Spotify API
async function fetchArtistGenres(artistId, token) {
  const res = await fetch(`https://api.spotify.com/v1/artists/${artistId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data.genres;
}

function SongCard({ song }) {
  const [likeCount, setLikeCount] = useState(0);
  const [inferredGenre, setInferredGenre] = useState('Unknown Genre');
  const navigate = useNavigate();
  const cardRef = useRef(null);

  // Extract basic song details from the track data
  const posterUrl = song.album?.images?.[0]?.url || 'https://via.placeholder.com/360x360';
  const songName = song.name || 'Untitled';
  const releaseYear = song.album?.release_date ? song.album.release_date.split('-')[0] : 'N/A';
  const artistName = song.artists?.map(artist => artist.name).join(', ') || 'Unknown Artist';
  const albumName = song.album?.name || 'Unknown Album';
  const durationMs = song.duration_ms || 0;
  const durationMin = Math.floor(durationMs / 60000);
  const durationSec = Math.floor((durationMs % 60000) / 1000);
  const formattedDuration = `${durationMin}:${durationSec < 10 ? '0' : ''}${durationSec}`;

  // Genre extraction logic: try track, then album, then artist
  // Assume song.genre might be present (rarely), if not, fallback to album, then artist.
  let genre = song.genre || (song.album?.genres ? song.album.genres[0] : null);
  
  // If genre is still not available, fetch from first artist's details.
  useEffect(() => {
    async function getArtistGenre() {
      if (!genre && song.artists && song.artists.length > 0) {
        try {
          const token = await fetchSpotifyToken();
          const genres = await fetchArtistGenres(song.artists[0].id, token);
          if (genres && genres.length > 0) {
            setInferredGenre(genres[0]);
          }
        } catch (error) {
          console.error('Error fetching artist genres:', error);
        }
      } else if (genre) {
        setInferredGenre(genre);
      }
    }
    getArtistGenre();
  }, [genre, song.artists]);

  const handleLike = (e) => {
    e.stopPropagation();
    setLikeCount(prev => prev + 1);
  };

  const handleDownload = async (e) => {
    e.stopPropagation();
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, { useCORS: true , scale: 10});
        const link = document.createElement('a');
        link.download = `${songName}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      } catch (error) {
        console.error("Download failed", error);
      }
    }
  };

  const handleClick = () => {
    navigate(`/songs/${song.id}`);
  };

  return (
    <div className="song-card" onClick={handleClick} ref={cardRef}>
      <div className="song-poster-container">
        <img src={posterUrl} alt={songName} className="song-card-image" crossOrigin="anonymous" />
        <div className="song-overlay">
          <button className="overlay-btn" onClick={handleLike}>
            <FontAwesomeIcon icon={farHeart} /> ({likeCount})
          </button>
          <button className="overlay-btn" onClick={handleDownload}>
            <FontAwesomeIcon icon={faDownload} />
          </button>
        </div>
      </div>
      <div className="song-card-content">
        <h3 className="song-title">
          {songName} <span className="song-year" >{releaseYear}</span>
        </h3>
        <div className="song-details">
          <p><strong>Artist:</strong> <span>{artistName}</span></p>
          <p><strong>Album:</strong> <span>{albumName}</span></p>
          <p><strong>Genre:</strong> <span>{inferredGenre}</span></p>
          <p><strong>Duration:</strong> <span>{formattedDuration} minutes</span></p>
        </div>
      </div>
    </div>
  );
}

export default SongCard;
