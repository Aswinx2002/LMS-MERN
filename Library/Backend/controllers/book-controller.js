const fs = require('fs');
const path = require('path');
const Books = require('../model/Books'); // Adjust the path as necessary
const HttpError = require('../model/http-error'); // Adjust the path as necessary
const Genre = require('../model/Genres')

// Create a new book
exports.createBook = async (req, res, next) => {
    const { name, author, genre, publication, description, price } = req.body;

    console.log(req.body)

    const image = req.file ? req.file.path : null;
    if (!image) {
        return next(new HttpError('No image provided.', 422));
    }
    

    const rentalcost = price ? price * 0.005 : 0;
    try {
        const existingbook = await Books.findOne({ name });
        if (existingbook) {
        return next(new HttpError('Book already exists, please check again.', 422));
        }

        const bookgenre = await Genre.findOne({ name: genre });
        if (!bookgenre) {
        return next(new HttpError('Genre not found, please provide a valid genre.', 422));
        }

        const imagePath = req.file.path.replace(/\\/g, '/');

        const book = new Books({
            name,
            author,
            genre:bookgenre._id,
            publication,
            description,
            price,
            rentalcost,
            image: `http://localhost:5000/${imagePath}`,
        });
        await book.save();
        res.status(201).json(book);
    } catch (error) {
        return next(new HttpError(error.message, 400));
    }
};


// Update an existing book
exports.updateBook = async (req, res, next) => {
    const { id } = req.params;
    const { name, author, genre, publication, description, price } = req.body;
    const imagePath = req.file ? req.file.path : null;

    try {
        const book = await Books.findById(id);
        if (!book) {
            return next(new HttpError('Book not found', 404));
        }

        book.name = name;
        book.author = author;
        
        const bookgenre = await Genre.findOne({ name: genre });
        if (!bookgenre) {
        return next(new HttpError('Genre not found, please provide a valid genre.', 422));
        }

        book.genre = bookgenre._id;
        book.publication = publication;
        book.description = description;
        book.price = price;

        // Recalculate rental cost as 0.5% of price
        book.rentalcost = price ? price * 0.005 : 0;

        // If a new image is uploaded, delete the old one
        if (imagePath) {
            // Delete the image file if it exists
            if (book.image) {
                // Extract the relative path from the URL
                const imagePath = book.image.replace(/^http:\/\/localhost:5000/, ''); // This gets the relative path
                // Construct the absolute path
                const absolutePath = path.join('images', '..', imagePath); 
                fs.unlink(absolutePath, (err) => {
                    if (err) {
                    console.error('Failed to delete image:', err);
                    }
                });
            }
            const imagePath = req.file.path.replace(/\\/g, '/');

            book.image = `http://localhost:5000/${imagePath}`;
        }

        book.updatedOn = Date.now();
        await book.save();
        res.status(200).json(book);
    } catch (error) {
        return next(new HttpError(error.message, 400));
    }
};

// Delete a book and its image
exports.deleteBook = async (req, res, next) => {
    const { id } = req.params;

    try {
        const book = await Books.findByIdAndDelete(id);
        if (!book) {
            return next(new HttpError('Book not found', 404));
        }

        // Delete the image file if it exists
        if (book.image) {
            // Extract the relative path from the URL
            const imagePath = book.image.replace(/^http:\/\/localhost:5000/, ''); // This gets the relative path
        
            // Construct the absolute path
            const absolutePath = path.join('images', '..', imagePath); 
        
            fs.unlink(absolutePath, (err) => {
                if (err) {
                console.error('Failed to delete image:', err);
                }
            });
        }

        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        return next(new HttpError(error.message, 400));
    }
};

// Get a book by ID
exports.getBookById = async (req, res, next) => {
    try {
        const book = await Books.findById(req.params.id).populate('genre');
        if (!book) {
            return next(new HttpError('Book not found', 404));
        }
        res.status(200).json(book);
    } catch (error) {
        return next(new HttpError(error.message, 400));
    }
};

// Get all books
exports.getAllBooks = async (req, res, next) => {
    try {
        const books = await Books.find().populate('genre');
        
        if (!books || books.length === 0) {
            return next(new HttpError('No Books found.', 404));
          }

        res.status(200).json(books);
    } catch (error) {
        return next(new HttpError(error.message, 400));
    }
};


exports.searchBooks = async (req, res, next) => {
    const { name, author, genre, priceRange, publication } = req.body;

    let books;
    try {
        const query = {};

        // Add filters based on the provided criteria
        if (name) query.name = new RegExp(name, 'i'); // Case-insensitive search
        if (author) query.author = new RegExp(author, 'i'); // Case-insensitive search
        if (genre) query.genre = genre;
        if (publication) query.publication = new RegExp(publication, 'i'); // Case-insensitive search

        // Filter based on the price range if provided
        if (priceRange) {
            const [minPrice, maxPrice] = priceRange.split('-').map(Number);
            query.price = { $gte: minPrice, $lte: maxPrice };
        }

        console.log("Query being built:", query); // Log the constructed query for debugging

        // Fetch books based on the constructed query
        books = await Books.find(query).populate('genre'); // Populate genre if needed

        if (!books || books.length === 0) {
            return res.status(404).json({ message: 'No books found for the given criteria.' });
        }

    } catch (err) {
        console.error(err); // Log error for debugging
        return next(new HttpError('Searching books failed: ' + err.message, 500));
    }

    // Return the found books
    res.json({ books: books.map(book => book.toObject({ getters: true })) });
};
