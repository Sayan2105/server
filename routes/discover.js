// POST /api/movies/discover - discover movies with filters
router.post("/discover", async (req, res) => {
  const filters = req.body || {};
  const page = filters.page || 1;
  const genres = Array.isArray(filters.genres) ? filters.genres.join(",") : "";
  const minRating = filters.min_rating || 1;
  const minRuntime = filters.min_runtime;
  const maxRuntime = filters.max_runtime;

  // IMPORTANT: Default to false for adult content unless explicitly set
  const includeAdult = filters.adult === true ? true : false;

  const params = {
    api_key: TMDB_API_KEY,
    sort_by: "popularity.desc",
    include_adult: includeAdult, // This filters out adult content
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
