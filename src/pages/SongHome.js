// src/pages/SongHome.js
import React, { useEffect, useState } from 'react';
import SongGrid from '../components/SongGrid';
import './SongHome.css';

const SPOTIFY_CLIENT_ID = 'cb0e3470ea594552be77c98ff842bf00';
const SPOTIFY_CLIENT_SECRET = '44d59ee58643452ca03133ce352fcc1a';

// Helper to fetch Spotify token using client credentials flow
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

// Fetch songs based on a search query. If query starts with 'artist:',\n// search by artist name; otherwise, search by track name.
async function fetchSongs(token, query) {
  let searchQuery = query;
  if (query.toLowerCase().startsWith('artist:')) {
    // Remove the 'artist:' prefix and trim the query
    const artistQuery = query.substring(7).trim();
    searchQuery = `artist:${artistQuery}`;
  }
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=10`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();
  return data.tracks ? data.tracks.items : [];
}

// Fetch songs for a given genre (10 songs)
async function fetchGenreSongs(token, genre) {
  const res = await fetch(
    `https://api.spotify.com/v1/search?q=genre:${encodeURIComponent(genre)}&type=track&limit=10`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = await res.json();
  return data.tracks ? data.tracks.items : [];
}

const genres = ['pop', 'rock', 'jazz', 'hip-hop', 'classical'];

function SongHome() {
  const [songsByGenre, setSongsByGenre] = useState({});
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);

  // Fetch genre-based songs on initial load
  useEffect(() => {
    async function getSongs() {
      setLoadingGenres(true);
      try {
        const token = await fetchSpotifyToken();
        const genreSongs = {};
        for (const genre of genres) {
          genreSongs[genre] = await fetchGenreSongs(token, genre);
        }
        setSongsByGenre(genreSongs);
      } catch (error) {
        console.error('Error fetching genre songs:', error);
      }
      setLoadingGenres(false);
    }
    getSongs();
  }, []);

  // Search functionality: update search results when query changes
  useEffect(() => {
    async function searchSongs() {
      if (!searchQuery) {
        setSearchResults([]);
        return;
      }
      setLoadingSearch(true);
      try {
        const token = await fetchSpotifyToken();
        const results = await fetchSongs(token, searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Error fetching search results:', error);
      }
      setLoadingSearch(false);
    }
    const debounceSearch = setTimeout(searchSongs, 500);
    return () => clearTimeout(debounceSearch);
  }, [searchQuery]);

  return (
    <div className="song-home-container">
      <h2 className="page-title">Songs</h2>
      
      {/* Search Bar */}
      <form className="search-form" onSubmit={(e) => e.preventDefault()}>
        <input
          type="text"
          placeholder="Search by song name or artist (e.g. artist: Adele)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        
      </form>

      {/* If there's a search query, display search results */}
      {searchQuery && (
        <div className="search-results">
          <h3 className="search-title">Search Results</h3>
          {loadingSearch ? <p className='loading'>Loading...</p> : <SongGrid songs={searchResults} />}
        </div>
      )}

      {/* Genre Grid Section (remains visible regardless of search) */}
      {loadingGenres ? (
        <p className='loading-genres'>Loading genres... </p>
      ) : (
        genres.map((genre) => (
          <div key={genre} className="genre-section">
            <h3 className="genre-title">{genre.toUpperCase()}</h3>
            <SongGrid songs={songsByGenre[genre] || []} />
          </div>
        ))
      )}
    </div>
  );
}

export default SongHome;
