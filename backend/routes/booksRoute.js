import express from 'express';
import { Book } from '../models/bookModel.js';
import BookCopy from '../models/bookCopyModel.js';

const router = express.Router();

// Function to process and save tags
const processAndSaveTags = async (tags) => {
  if (!tags || tags.length === 0) {
    return [];
  }
  const savedTags = [];
  for (const tagName of tags) {
    // Find or create the tag
    const tag = await Tag.findOneAndUpdate(
      { name: tagName },
      { name: tagName },
      { upsert: true, new: true }
    );
    savedTags.push(tag.name);
  }
  return savedTags;
};

// Route for Save a new Book
router.post('/', async (request, response) => {
  try {
    const {
      code,
      title,
      authors,
      category,
      publisher,
      publishYear,
      price,
      quantity,
      description
    } = request.body;
    if (!code || !title || !authors || !Array.isArray(authors) || authors.length === 0 || !category || !publisher || !publishYear || !price || !quantity) {
      return response.status(400).send({
        message: 'Send all required fields: code, title, authors (array), category, publisher, publishYear, price, quantity',
      });
    }
    const newBook = {
      code,
      title,
      authors,
      category,
      publisher,
      publishYear,
      price,
      description: description || '',
    };
    const book = await Book.create(newBook);
    // Tạo các bản copy
    const copies = [];
    for (let i = 1; i <= quantity; i++) {
      copies.push({
        bookId: book._id,
        copyNumber: i,
        barcode: `${book.title.replace(/\s+/g, '').toUpperCase()}-${i}`,
      });
    }
    await BookCopy.insertMany(copies);
    return response.status(201).send(book);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Get All Books from database
router.get('/', async (request, response) => {
  try {
    const books = await Book.find({});

    return response.status(200).json({
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Get One Book from database by id
router.get('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const book = await Book.findById(id);

    return response.status(200).json(book);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Update a Book
router.put('/:id', async (request, response) => {
  try {
    if (
      !request.body.title ||
      !request.body.author ||
      !request.body.publishYear
    ) {
      return response.status(400).send({
        message: 'Send all required fields: title, author, publishYear',
      });
    }

    const { id } = request.params;

    const updatedBookData = {
      title: request.body.title,
      author: request.body.author,
      publishYear: request.body.publishYear,
      description: request.body.description || '',
      tags: request.body.tags || [],
    };

    // Process and save tags first
    if (updatedBookData.tags && updatedBookData.tags.length > 0) {
      updatedBookData.tags = await processAndSaveTags(updatedBookData.tags);
    }

    const result = await Book.findByIdAndUpdate(id, updatedBookData, { new: true });

    if (!result) {
      return response.status(404).json({ message: 'Book not found' });
    }

    return response.status(200).send({ message: 'Book updated successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Route for Delete a book
router.delete('/:id', async (request, response) => {
  try {
    const { id } = request.params;

    const result = await Book.findByIdAndDelete(id);

    if (!result) {
      return response.status(404).json({ message: 'Book not found' });
    }

    return response.status(200).send({ message: 'Book deleted successfully' });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

// Lấy tổng số và số available copies cho một Book
router.get('/:id/copies', async (req, res) => {
  try {
    const { id } = req.params;
    const total = await BookCopy.countDocuments({ bookId: id });
    const available = await BookCopy.countDocuments({ bookId: id, status: 'available' });
    const copies = await BookCopy.find({ bookId: id });
    res.json({ total, available, copies });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Thêm bản copy mới cho Book
router.post('/:id/copies', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    // Tìm số copy hiện tại
    const currentCount = await BookCopy.countDocuments({ bookId: id });
    const copyNumber = currentCount + 1;
    const barcode = `${book.title.replace(/\s+/g, '').toUpperCase()}-${copyNumber}`;
    const newCopy = await BookCopy.create({ bookId: id, copyNumber, barcode });
    res.status(201).json(newCopy);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Xóa bản copy theo copyId
router.delete('/copies/:copyId', async (req, res) => {
  try {
    const { copyId } = req.params;
    const deleted = await BookCopy.findByIdAndDelete(copyId);
    if (!deleted) return res.status(404).json({ message: 'Copy not found' });
    res.json({ message: 'Copy deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a new route to get all tags
router.get('/tags', async (request, response) => {
  try {
    const tags = await Tag.find({});
    const tagNames = tags.map(tag => tag.name);
    return response.status(200).json(tagNames);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

export default router;
