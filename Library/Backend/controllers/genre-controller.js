const Genre = require('../model/Genres'); // Adjust the path as necessary
const HttpError = require('../model/http-error'); // Adjust the path as necessary

// Create a new genre
exports.createGenre = async (req, res, next) => {
    try {
        const { name, details } = req.body;
        const genre = new Genre({ name, details });
        await genre.save();
        res.status(201).json(genre);
    } catch (error) {
        return next(new HttpError(error.message, 400));
    }
};

// Update an existing genre
exports.updateGenre = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, details } = req.body;
        const genre = await Genre.findByIdAndUpdate(id, { name, details }, { new: true });
        if (!genre) {
            return next(new HttpError('Genre not found', 404));
        }
        res.status(200).json(genre);
    } catch (error) {
        return next(new HttpError(error.message, 400));
    }
};

// Delete a genre
exports.deleteGenre = async (req, res, next) => {
    try {
        const { id } = req.params;
        const genre = await Genre.findByIdAndDelete(id);
        if (!genre) {
            return next(new HttpError('Genre not found', 404));
        }
        res.status(200).json({ message: 'Genre deleted successfully' });
    } catch (error) {
        return next(new HttpError(error.message, 400));
    }
};

// Get a genre by ID
exports.getGenreById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const genre = await Genre.findById(id);
        if (!genre) {
            return next(new HttpError('Genre not found', 404));
        }
        res.status(200).json(genre);
    } catch (error) {
        return next(new HttpError(error.message, 400));
    }
};

// Get all genres
exports.getAllGenres = async (req, res, next) => {
    try {
        const genres = await Genre.find();

        if (!genres || genres.length === 0) {
            return next(new HttpError('No Genres found.', 404));
          }

        res.status(200).json(genres);
    } catch (error) {
        return next(new HttpError(error.message, 400));
    }
};
