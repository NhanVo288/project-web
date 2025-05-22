import express from 'express';
import {
  getBorrows,
  getBorrowById,
  createBorrow,
  returnBook,
  deleteBorrow
} from '../controllers/borrowController.js';

const router = express.Router();

router.get('/', getBorrows);
router.get('/:id', getBorrowById);
router.post('/', createBorrow);
router.patch('/:id/return', returnBook);
router.delete('/:id', deleteBorrow);

export default router; 