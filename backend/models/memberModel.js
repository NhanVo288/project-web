const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    memberType: {
        type: String,
        required: true,
        enum: ['student', 'teacher', 'staff', 'other'],
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid phone number']
    },
    cardIssueDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    cardExpiryDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    note: {
        type: String,
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

// Middleware kiểm tra ngày hết hạn thẻ
memberSchema.pre('save', function(next) {
    if (this.cardExpiryDate <= this.cardIssueDate) {
        next(new Error('Card expiry date must be after issue date'));
    }
    next();
});

const Member = mongoose.model('Member', memberSchema);

module.exports = Member; 