const express = require('express');
const booksController = require('../controllers/book-controller'); // Adjust the path as necessary
const router = express.Router();
const bookUpload = require('../middleware/book-upload');  // Multer file upload middleware


// Route to create a new book (with image upload)
router.post('/',bookUpload.single('image'), booksController.createBook);

// Route to update an existing book (with image upload)
router.patch('/:id', bookUpload.single('image'), booksController.updateBook);

// Route to delete a book
router.delete('/:id', booksController.deleteBook);

// Route to get a book by ID
router.get('/:id', booksController.getBookById);

// Route to get all books
router.get('/', booksController.getAllBooks);

router.post('/search',booksController.searchBooks)

module.exports = router;
