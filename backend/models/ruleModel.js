const mongoose = require('mongoose');

const ruleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    type: {
        type: String,
        enum: ['number', 'string', 'boolean', 'date', 'array'],
        required: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    effectiveDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    expiryDate: {
        type: Date
    },
    createdBy: {
        type: String,
        required: true,
        trim: true
    },
    updatedBy: {
        type: String,
        required: true,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Middleware kiểm tra ngày hết hạn
ruleSchema.pre('save', function(next) {
    if (this.expiryDate && this.expiryDate <= this.effectiveDate) {
        next(new Error('Expiry date must be after effective date'));
    }
    next();
});

// Middleware kiểm tra kiểu dữ liệu
ruleSchema.pre('save', function(next) {
    switch (this.type) {
        case 'number':
            if (typeof this.value !== 'number') {
                next(new Error('Value must be a number'));
            }
            break;
        case 'string':
            if (typeof this.value !== 'string') {
                next(new Error('Value must be a string'));
            }
            break;
        case 'boolean':
            if (typeof this.value !== 'boolean') {
                next(new Error('Value must be a boolean'));
            }
            break;
        case 'date':
            if (!(this.value instanceof Date)) {
                next(new Error('Value must be a date'));
            }
            break;
        case 'array':
            if (!Array.isArray(this.value)) {
                next(new Error('Value must be an array'));
            }
            break;
    }
    next();
});

const Rule = mongoose.model('Rule', ruleSchema);

module.exports = Rule; 