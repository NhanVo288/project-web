const express = require('express');
const router = express.Router();
const fineReceiptController = require('../controllers/fineReceiptController');

// Get all fine receipts
router.get('/', fineReceiptController.getAllFineReceipts);

// Get fine receipt by ID
router.get('/:id', fineReceiptController.getFineReceiptById);

// Create new fine receipt
router.post('/', fineReceiptController.createFineReceipt);

// Update fine receipt
router.put('/:id', fineReceiptController.updateFineReceipt);

// Get member's fine receipts
router.get('/member/:memberId', fineReceiptController.getMemberFineReceipts);

// Get unpaid fine receipts
router.get('/unpaid', fineReceiptController.getUnpaidFineReceipts);

// Get fine statistics
router.get('/stats', fineReceiptController.getFineStats);

module.exports = router; 