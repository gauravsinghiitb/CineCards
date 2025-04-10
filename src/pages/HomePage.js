// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import GenreSection from '../components/GenreSection';
import MovieGrid from '../components/MovieGrid';
import './HomePage.css';
import '../styles/combined.css';

const TMDB_API_URL = 'https://api.themoviedb.org/3';
const AUTH_TOKEN = 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3ODBlZGNlNWU0ZmY4MTYyMjczODEyZmY1OTE1NmI5OCIsIm5iZiI6MTc0MzI3MzgwNy45MzI5OTk4LCJzdWIiOiI2N2U4M2Y0ZjBlOGVlNjc4MTU2N2M4YmMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.2V2RtxiTXu0YAWqiIkzNYeKlNX6SyXHUBibGyXgAdNs';

function HomePage() {
  const [genresWithMovies, setGenresWithMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load genres and top movies per genre
  useEffect(() => {
    if (searchQuery.trim() === '') {
      async function fetchGenresAndMovies() {
        setLoading(true);
        try {
          const genresRes = await fetch(
            `${TMDB_API_URL}/genre/movie/list?language=en-US`,
            {
              headers: {
                Authorization: AUTH_TOKEN,
                'Content-Type': 'application/json;charset=utf-8',
              },
            }
          );
          const genresData = await genresRes.json();
          const genres = genresData.genres || [];

          const genresMoviesPromises = genres.map(async (genre) => {
            const moviesRes = await fetch(
              `${TMDB_API_URL}/discover/movie?with_genres=${genre.id}&sort_by=popularity.desc&language=en-US&page=1`,
              {
                headers: {
                  Authorization: AUTH_TOKEN,
                  'Content-Type': 'application/json;charset=utf-8',
                },
              }
            );
            const moviesData = await moviesRes.json();
            const movies = (moviesData.results || []).slice(0, 10);
            const detailedMovies = await Promise.all(
              movies.map(async (movie) => {
                const detailRes = await fetch(
                  `${TMDB_API_URL}/movie/${movie.id}?append_to_response=credits`,
                  {
                    headers: {
                      Authorization: AUTH_TOKEN,
                      'Content-Type': 'application/json;charset=utf-8',
                    },
                  }
                );
                return await detailRes.json();
              })
            );
            return { genre, movies: detailedMovies };
          });

          const genresMovies = await Promise.all(genresMoviesPromises);
          setGenresWithMovies(genresMovies);
        } catch (error) {
          console.error('Error fetching genres or movies:', error);
        }
        setLoading(false);
      }

      fetchGenresAndMovies();
    }
  }, [searchQuery]);

  // Search for both movies and TV shows
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      async function fetchSearchResults() {
        setLoading(true);
        try {
          const [movieRes, tvRes] = await Promise.all([
            fetch(
              `${TMDB_API_URL}/search/movie?query=${encodeURIComponent(searchQuery)}&language=en-US&page=1`,
              {
                headers: {
                  Authorization: AUTH_TOKEN,
                  'Content-Type': 'application/json;charset=utf-8',
                },
              }
            ),
            fetch(
              `${TMDB_API_URL}/search/tv?query=${encodeURIComponent(searchQuery)}&language=en-US&page=1`,
              {
                headers: {
                  Authorization: AUTH_TOKEN,
                  'Content-Type': 'application/json;charset=utf-8',
                },
              }
            ),
          ]);

          const [movieData, tvData] = await Promise.all([
            movieRes.json(),
            tvRes.json(),
          ]);

          const combinedResults = [
            ...(movieData.results || []),
            ...(tvData.results || []),
          ].slice(0, 10);

          // Fetch genres for movie and TV
          const [movieGenresRes, tvGenresRes] = await Promise.all([
            fetch(`${TMDB_API_URL}/genre/movie/list?language=en-US`, {
              headers: {
                Authorization: AUTH_TOKEN,
                'Content-Type': 'application/json;charset=utf-8',
              },
            }),
            fetch(`${TMDB_API_URL}/genre/tv/list?language=en-US`, {
              headers: {
                Authorization: AUTH_TOKEN,
                'Content-Type': 'application/json;charset=utf-8',
              },
            }),
          ]);

          const movieGenresData = await movieGenresRes.json();
          const tvGenresData = await tvGenresRes.json();

          const genreMap = {};
          [...(movieGenresData.genres || []), ...(tvGenresData.genres || [])].forEach(
            (g) => {
              genreMap[g.id] = g.name;
            }
          );

          const detailedMovies = await Promise.all(
            combinedResults.map(async (item) => {
              const isMovie = !!item.title;
              const endpoint = `${TMDB_API_URL}/${isMovie ? 'movie' : 'tv'}/${item.id}?append_to_response=credits`;

              const detailRes = await fetch(endpoint, {
                headers: {
                  Authorization: AUTH_TOKEN,
                  'Content-Type': 'application/json;charset=utf-8',
                },
              });
              const detailData = await detailRes.json();
              detailData.genre_names =
                detailData.genres?.map((g) => g.name) ||
                item.genre_ids?.map((id) => genreMap[id]) ||
                [];
              return detailData;
            })
          );

          setSearchResults(detailedMovies);
        } catch (error) {
          console.error('Error fetching search results:', error);
        }
        setLoading(false);
      }

      fetchSearchResults();
    }
  }, [searchQuery]);

  return (
    <div className="full-width-container" style={{ padding: '20px' }}>
      <input
        type="text"
        placeholder="Search movies or TV shows..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {loading ? (
        <p className='loading'>Loading...</p>
      ) : searchQuery.trim() !== '' ? (
        <div>
          <h2
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              textTransform: 'uppercase',
              marginBottom: '15px',
            }}
          >
            Search Results
          </h2>
          <MovieGrid movies={searchResults} />
        </div>
      ) : (
        genresWithMovies.map(({ genre, movies }) => (
          <GenreSection key={genre.id} genre={genre} movies={movies} />
        ))
      )}
    </div>
  );
}

export default HomePage;
