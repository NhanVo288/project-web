const Book = require('../models/bookModel');
const Borrow = require('../models/borrowModel');

// Get all books
exports.getAllBooks = async (req, res) => {
    try {
        const books = await Book.find()
            .sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get book by ID
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(book);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new book
exports.createBook = async (req, res) => {
    try {
        const {
            bookCode,
            title,
            authors,
            category,
            publisher,
            publishYear,
            price,
            quantity,
            description
        } = req.body;

        // Validate required fields
        if (!bookCode || !title || !authors || !category || !publisher || !publishYear || !price || !quantity) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if book code already exists
        const existingBook = await Book.findOne({ bookCode });
        if (existingBook) {
            return res.status(400).json({ message: 'Book code already exists' });
        }

        // Create new book
        const book = new Book({
            bookCode,
            title,
            authors,
            category,
            publisher,
            publishYear,
            price,
            quantity,
            availableQuantity: quantity,
            description
        });

        const savedBook = await book.save();
        res.status(201).json(savedBook);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update book
exports.updateBook = async (req, res) => {
    try {
        const {
            title,
            authors,
            category,
            publisher,
            publishYear,
            price,
            quantity,
            description
        } = req.body;

        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Calculate new available quantity
        const borrowedCount = await Borrow.countDocuments({
            book: book._id,
            status: 'borrowed'
        });
        const newAvailableQuantity = quantity - borrowedCount;

        if (newAvailableQuantity < 0) {
            return res.status(400).json({ message: 'New quantity cannot be less than number of borrowed books' });
        }

        // Update book
        book.title = title || book.title;
        book.authors = authors || book.authors;
        book.category = category || book.category;
        book.publisher = publisher || book.publisher;
        book.publishYear = publishYear || book.publishYear;
        book.price = price || book.price;
        book.quantity = quantity || book.quantity;
        book.availableQuantity = newAvailableQuantity;
        book.description = description || book.description;

        const updatedBook = await book.save();
        res.status(200).json(updatedBook);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete book
exports.deleteBook = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).json({ message: 'Book not found' });
        }

        // Check if book is currently borrowed
        const borrowedCount = await Borrow.countDocuments({
            book: book._id,
            status: 'borrowed'
        });

        if (borrowedCount > 0) {
            return res.status(400).json({ message: 'Cannot delete book that is currently borrowed' });
        }

        await Book.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Book deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Search books
exports.searchBooks = async (req, res) => {
    try {
        const q = req.query.q || '';
        const books = await Book.find({
            $or: [
                { title: { $regex: q, $options: 'i' } },
                { bookCode: { $regex: q, $options: 'i' } }
            ]
        }).sort({ createdAt: -1 });
        res.status(200).json(books);
    } catch (error) {
        console.error('SEARCH BOOKS ERROR:', error);
        res.status(500).json({ message: error.message });
    }
}; 