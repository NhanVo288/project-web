const express = require('express');
const router = express.Router();
const borrowController = require('../controllers/borrowController');

// Get all borrows
router.get('/', borrowController.getAllBorrows);

// Get borrow by ID
router.get('/:id', borrowController.getBorrowById);

// Create new borrow
router.post('/', borrowController.createBorrow);

// Return book
router.put('/:id/return', borrowController.returnBook);

// Get member's borrows
router.get('/member/:memberId', borrowController.getMemberBorrows);

// Get book's borrows
router.get('/book/:bookId', borrowController.getBookBorrows);

// Get overdue borrows
router.get('/overdue', borrowController.getOverdueBorrows);

// Thêm route cập nhật tiền đã trả
router.patch('/:id/update-paid', borrowController.updatePaid);

module.exports = router; 