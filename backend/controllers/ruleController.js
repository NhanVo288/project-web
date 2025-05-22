const Rule = require('../models/ruleModel');

// Get all rules
exports.getAllRules = async (req, res) => {
    try {
        const rules = await Rule.find()
            .sort({ createdAt: -1 });
        res.status(200).json(rules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get rule by ID
exports.getRuleById = async (req, res) => {
    try {
        const rule = await Rule.findById(req.params.id);
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }
        res.status(200).json(rule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new rule
exports.createRule = async (req, res) => {
    try {
        const {
            name,
            value,
            type,
            description,
            effectiveDate,
            expiryDate,
            createdBy
        } = req.body;

        // Validate required fields
        if (!name || !value || !type || !description || !createdBy) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if rule name already exists
        const existingRule = await Rule.findOne({ name });
        if (existingRule) {
            return res.status(400).json({ message: 'Rule name already exists' });
        }

        // Create new rule
        const rule = new Rule({
            name,
            value,
            type,
            description,
            effectiveDate: effectiveDate || new Date(),
            expiryDate,
            createdBy,
            updatedBy: createdBy
        });

        const savedRule = await rule.save();
        res.status(201).json(savedRule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update rule
exports.updateRule = async (req, res) => {
    try {
        const {
            value,
            description,
            effectiveDate,
            expiryDate,
            isActive,
            updatedBy
        } = req.body;

        const rule = await Rule.findById(req.params.id);
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }

        // Update rule
        rule.value = value || rule.value;
        rule.description = description || rule.description;
        rule.effectiveDate = effectiveDate || rule.effectiveDate;
        rule.expiryDate = expiryDate || rule.expiryDate;
        rule.isActive = isActive !== undefined ? isActive : rule.isActive;
        rule.updatedBy = updatedBy || rule.updatedBy;

        const updatedRule = await rule.save();
        res.status(200).json(updatedRule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete rule
exports.deleteRule = async (req, res) => {
    try {
        const rule = await Rule.findById(req.params.id);
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }

        await Rule.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Rule deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get active rules
exports.getActiveRules = async (req, res) => {
    try {
        const now = new Date();
        const rules = await Rule.find({
            isActive: true,
            effectiveDate: { $lte: now },
            $or: [
                { expiryDate: { $gt: now } },
                { expiryDate: null }
            ]
        }).sort({ createdAt: -1 });
        res.status(200).json(rules);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get rule by name
exports.getRuleByName = async (req, res) => {
    try {
        const rule = await Rule.findOne({ name: req.params.name });
        if (!rule) {
            return res.status(404).json({ message: 'Rule not found' });
        }
        res.status(200).json(rule);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 