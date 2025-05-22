import express from 'express';
import { getRule, updateRule } from '../controllers/ruleController.js';

const router = express.Router();

router.get('/', getRule);
router.put('/', updateRule);

export default router; 