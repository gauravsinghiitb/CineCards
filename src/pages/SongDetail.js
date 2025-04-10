import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import SongCard from '../components/SongCard';
import html2canvas from 'html2canvas';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { faDownload } from '@fortawesome/free-solid-svg-icons';
import './SongDetail.css';

const SPOTIFY_CLIENT_ID = 'cb0e3470ea594552be77c98ff842bf00';
const SPOTIFY_CLIENT_SECRET = '44d59ee58643452ca03133ce352fcc1a';

// Fetch Spotify access token
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

// Fetch song details from Spotify
async function fetchSongDetail(token, id) {
  const res = await fetch(`https://api.spotify.com/v1/tracks/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data;
}

// Fetch similar songs from Spotify
async function fetchSimilarSongs(token, id) {
  const res = await fetch(`https://api.spotify.com/v1/recommendations?seed_tracks=${id}&limit=10`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  return data.tracks || [];
}

function SongDetail() {
  const { id } = useParams();
  const [song, setSong] = useState(null);
  const [likeCount, setLikeCount] = useState(0);
  const [similarSongs, setSimilarSongs] = useState([]);
  const [youtubeEmbedUrl, setYoutubeEmbedUrl] = useState('');
  const cardRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    async function getSong() {
      try {
        const token = await fetchSpotifyToken();
        const songData = await fetchSongDetail(token, id);
        setSong(songData);

        const similar = await fetchSimilarSongs(token, id);
        setSimilarSongs(similar);

        // Construct YouTube search query without API
        const artistNames = songData.artists.map(artist => artist.name).join(' ');
        const searchQuery = encodeURIComponent(`${songData.name} ${artistNames} official video`);
        setYoutubeEmbedUrl(`https://www.youtube.com/embed?listType=search&list=${searchQuery}`);
      } catch (error) {
        console.error('Error fetching song:', error);
      }
    }
    getSong();
  }, [id]);

  const handleLike = () => {
    setLikeCount(prev => prev + 1);
  };

  const handleDownload = async () => {
    if (cardRef.current) {
      try {
        const canvas = await html2canvas(cardRef.current, {
          backgroundColor: null,
          scale: 8,
          useCORS: true,
          scrollX: 0,
          scrollY: -window.scrollY,
        });
        const link = document.createElement('a');
        link.download = `${song.name}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('Download failed', error);
      }
    }
  };

  const scroll = (offset) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!song) return <div className="loading">Loading song details...</div>;

  const artistName = song.artists?.map(a => a.name).join(', ') || 'Unknown Artist';
  const albumName = song.album?.name || 'Unknown Album';
  const releaseYear = song.album?.release_date?.split('-')[0] || 'N/A';
  const durationMin = Math.floor(song.duration_ms / 60000);
  const durationSec = Math.floor((song.duration_ms % 60000) / 1000);
  const formattedDuration = `${durationMin}:${durationSec < 10 ? '0' : ''}${durationSec}`;

  return (
    <div className="song-detail-layout">
      <div className="song-main">
        <div className="song-card-left" ref={cardRef}>
          <SongCard song={song} compact={true} />
        </div>
        <div className="song-info">
          <h2>{song.name}</h2>
          <p><strong>Artist:</strong> {artistName}</p>
          <p><strong>Album:</strong> {albumName}</p>
          <p><strong>Released:</strong> {releaseYear}</p>
          <p><strong>Duration:</strong> {formattedDuration} minutes</p>
          <div className="song-buttons">
            
            <button className="download-button" onClick={handleDownload}>
              <FontAwesomeIcon icon={faDownload} /> Download
            </button>
          </div>
        </div>
      </div>

      {youtubeEmbedUrl && (
        <div className="video-section">
          <h2>Music Video</h2>
          <div className="video-container">
            <iframe
              src={youtubeEmbedUrl}
              allowFullScreen
              title="Music Video"
              width="100%"
              height="360"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}

      {similarSongs.length > 0 && (
        <div className="similar-songs-section">
          <h2>Similar Songs</h2>
          <div className="scroll-container">
            <button className="scroll-button left" onClick={() => scroll(-300)}>‹</button>
            <div className="similar-songs-scroll" ref={scrollRef}>
              {similarSongs.map(similarSong => (
                <div className="scroll-item" key={similarSong.id}>
                  <SongCard song={similarSong} compact={true} />
                </div>
              ))}
            </div>
            <button className="scroll-button right" onClick={() => scroll(300)}>›</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SongDetail;