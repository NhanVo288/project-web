import express from 'express';
import { createFineReceipt, getAllFineReceipts, getFineReceiptsByMember } from '../controllers/fineReceiptController.js';

const router = express.Router();

router.post('/', createFineReceipt);
router.get('/', getAllFineReceipts);
router.get('/member/:memberId', getFineReceiptsByMember);

export default router; 