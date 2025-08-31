const express = require('express');
const router = express.Router();
const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// GET /api/genres - returns combined movie and TV genres
router.get('/', async (req, res) => {
  try {
    const [movieGenresRes, tvGenresRes] = await Promise.all([
      axios.get(`${TMDB_BASE_URL}/genre/movie/list`, { params: { api_key: TMDB_API_KEY } }),
      axios.get(`${TMDB_BASE_URL}/genre/tv/list`, { params: { api_key: TMDB_API_KEY } }),
    ]);

    const movieGenres = movieGenresRes.data.genres || [];
    const tvGenres = tvGenresRes.data.genres || [];
    // Merge and dedupe genres by id
    const allGenresMap = new Map();

    [...movieGenres, ...tvGenres].forEach((genre) => {
      if (!allGenresMap.has(genre.id)) {
        allGenresMap.set(genre.id, genre);
      }
    });

    const allGenres = Array.from(allGenresMap.values());

    res.json({ success: true, genres: allGenres });
  } catch (error) {
    console.error('Error fetching genres:', error.message);
    res.status(500).json({ success: false, error: 'Failed to fetch genres' });
  }
});

module.exports = router;
