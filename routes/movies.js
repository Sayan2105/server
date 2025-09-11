const express = require("express");
const router = express.Router();
const axios = require("axios");

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// GET /api/movies/:id - get movie details by ID
router.get("/:id", async (req, res) => {
  const movieId = req.params.id;
  const appendToResponse =
    req.query.append_to_response || "credits,videos,recommendations";

  try {
    const url = `${TMDB_BASE_URL}/movie/${movieId}`;
    const params = {
      api_key: TMDB_API_KEY,
      append_to_response: appendToResponse,
    };

    const response = await axios.get(url, { params });
    res.json(response.data);
  } catch (error) {
    console.error(
      "Error fetching movie details:",
      error.response?.data || error.message
    );

    if (error.response?.status === 404) {
      res.status(404).json({ error: "Movie not found" });
    } else {
      res.status(500).json({ error: "Failed to fetch movie details" });
    }
  }
});

// POST /api/movies/discover - discover movies with filters
router.post("/discover", async (req, res) => {
  const filters = req.body || {};
  const page = filters.page || 1;
  const genres = Array.isArray(filters.genres) ? filters.genres.join(",") : "";
  const minRating = filters.min_rating || 1;
  const minRuntime = filters.min_runtime;
  const maxRuntime = filters.max_runtime;

  const includeAdult = filters.adult === true ? true : false;

  const params = {
    api_key: TMDB_API_KEY,
    sort_by: "popularity.desc",
    include_adult: includeAdult,
    page,
    "vote_average.gte": minRating,
  };

  if (genres) {
    params.with_genres = genres;
  }
  if (minRuntime) {
    params["with_runtime.gte"] = minRuntime;
  }
  if (maxRuntime) {
    params["with_runtime.lte"] = maxRuntime;
  }

  try {
    const url = `${TMDB_BASE_URL}/discover/movie`;
    const response = await axios.get(url, { params });
    res.json({ success: true, ...response.data });
  } catch (error) {
    console.error(
      "Error fetching movies:",
      error.response?.data || error.message
    );
    res.status(500).json({ success: false, error: "Failed to fetch movies" });
  }
});

// POST /api/movies/search - search movies by query string
router.post("/search", async (req, res) => {
  const query = req.body.query;
  const page = req.body.page || 1;

  if (!query || typeof query !== "string") {
    return res
      .status(400)
      .json({ success: false, error: "Invalid or missing search query" });
  }

  const params = {
    api_key: TMDB_API_KEY,
    query,
    page,
    include_adult: false,
  };

  try {
    const url = `${TMDB_BASE_URL}/search/movie`;
    const response = await axios.get(url, { params });
    res.json({ success: true, ...response.data });
  } catch (error) {
    console.error(
      "Error searching movies:",
      error.response?.data || error.message
    );
    res.status(500).json({ success: false, error: "Failed to search movies" });
  }
});

module.exports = router;
