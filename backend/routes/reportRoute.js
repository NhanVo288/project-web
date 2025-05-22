import express from 'express';
import { createBorrowStats, getBorrowStats, createLateReturnStats, getLateReturnStats } from '../controllers/reportController.js';

const router = express.Router();

// BM7.1
router.post('/borrow-stats', createBorrowStats);
router.get('/borrow-stats', getBorrowStats);

// BM7.2
router.post('/late-return-stats', createLateReturnStats);
router.get('/late-return-stats', getLateReturnStats);

export default router; 