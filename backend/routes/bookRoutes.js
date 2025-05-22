const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// Search books (phải đặt trước)
router.get('/search', bookController.searchBooks);

// Get all books
router.get('/', bookController.getAllBooks);

// Get book by ID
router.get('/:id', bookController.getBookById);

// Create new book
router.post('/', bookController.createBook);

// Update book
router.put('/:id', bookController.updateBook);

// Delete book
router.delete('/:id', bookController.deleteBook);

module.exports = router; 