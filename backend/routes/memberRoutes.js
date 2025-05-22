const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// Get all members
router.get('/', memberController.getAllMembers);

// Search members
router.get('/search', memberController.searchMembers);

// Get member by ID
router.get('/:id', memberController.getMemberById);

// Create new member
router.post('/', memberController.createMember);

// Update member
router.put('/:id', memberController.updateMember);

// Delete member
router.delete('/:id', memberController.deleteMember);

// Get member statistics
router.get('/:id/stats', memberController.getMemberStats);

module.exports = router; 