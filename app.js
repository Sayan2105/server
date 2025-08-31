const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
 
app.use(cors());
app.use(express.json());
   
// Import routes
const genresRouter = require('./routes/genres');
const moviesRouter = require('./routes/movies');


console.log('genresRouter:', genresRouter);
console.log('moviesRouter:', moviesRouter);

// Use routes with /api prefix
app.use('/api/genres', genresRouter);
app.use('/api/movies', moviesRouter);

module.exports = app;
