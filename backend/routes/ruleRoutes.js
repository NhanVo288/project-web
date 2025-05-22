const express = require('express');
const router = express.Router();
const ruleController = require('../controllers/ruleController');

// Get all rules
router.get('/', ruleController.getAllRules);

// Get rule by ID
router.get('/:id', ruleController.getRuleById);

// Create new rule
router.post('/', ruleController.createRule);

// Update rule
router.put('/:id', ruleController.updateRule);

// Delete rule
router.delete('/:id', ruleController.deleteRule);

// Get active rules
router.get('/active', ruleController.getActiveRules);

// Get rule by name
router.get('/name/:name', ruleController.getRuleByName);

// Route tạo rule mẫu nhanh
router.post('/init-sample', async (req, res) => {
  try {
    const Rule = require('../models/ruleModel');
    const existed = await Rule.findOne({ name: 'system_rule' });
    if (existed) return res.status(200).json({ message: 'Sample rule already exists' });
    const rule = await Rule.create({
      name: 'system_rule',
      value: [{
        minAge: 18,
        maxAge: 55,
        cardDurationMonths: 6,
        categories: ['A', 'B', 'C'],
        maxAuthors: 3,
        maxPublishYearGap: 5,
        maxBooksPerBorrow: 5,
        maxBorrowDays: 4,
        finePerDay: 1000
      }],
      type: 'array',
      description: 'Quy định hệ thống thư viện',
      createdBy: 'admin',
      updatedBy: 'admin'
    });
    res.status(201).json(rule);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 