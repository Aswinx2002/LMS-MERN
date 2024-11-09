const express = require('express');
const genreController = require('../controllers/genre-controller'); // Adjust the path as necessary
const router = express.Router();

// Route to create a new genre
router.post('/', genreController.createGenre);

// Route to update a genre by ID
router.patch('/:id', genreController.updateGenre);

// Route to delete a genre by ID
router.delete('/:id', genreController.deleteGenre);

// Route to get a genre by ID
router.get('/:id', genreController.getGenreById);

// Route to get all genres
router.get('/', genreController.getAllGenres);

module.exports = router;
