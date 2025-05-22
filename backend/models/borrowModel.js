const mongoose = require('mongoose');

const borrowSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
        required: true
    },
    borrowDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    returnDate: {
        type: Date
    },
    status: {
        type: String,
        enum: ['borrowed', 'returned', 'overdue'],
        default: 'borrowed'
    },
    fine: {
        type: Number,
        default: 0,
        min: 0
    },
    prepaid: {
        type: Number,
        default: 0,
        min: 0
    },
    paid: {
        type: Number,
        default: 0,
        min: 0
    },
    price: {
        type: Number,
        default: 0,
        min: 0
    },
    note: {
        type: String,
        trim: true
    },
    quantity: {
        type: Number,
        default: 1,
        min: 1
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

// Middleware kiểm tra ngày trả
borrowSchema.pre('save', function(next) {
    if (this.dueDate <= this.borrowDate) {
        next(new Error('Due date must be after borrow date'));
    }
    if (this.returnDate && this.returnDate < this.borrowDate) {
        next(new Error('Return date cannot be before borrow date'));
    }
    next();
});

// Middleware cập nhật trạng thái
borrowSchema.pre('save', function(next) {
    const now = new Date();
    if (this.status === 'borrowed' && now > this.dueDate) {
        this.status = 'overdue';
    }
    next();
});

const Borrow = mongoose.model('Borrow', borrowSchema);

module.exports = Borrow; 