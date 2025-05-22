const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Get all reports
router.get('/', reportController.getAllReports);

// Get report by ID
router.get('/:id', reportController.getReportById);

// Create new report
router.post('/', reportController.createReport);

// Update report
router.put('/:id', reportController.updateReport);

// Delete report
router.delete('/:id', reportController.deleteReport);

// Get reports by type
router.get('/type/:type', reportController.getReportsByType);

// Get reports by date range
router.get('/date-range', reportController.getReportsByDateRange);

module.exports = router; 