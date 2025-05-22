const mongoose = require('mongoose');

const fineReceiptSchema = new mongoose.Schema({
    member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Member',
        required: true
    },
    borrow: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Borrow',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    reason: {
        type: String,
        required: true,
        trim: true
    },
    issueDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'cancelled'],
        default: 'pending'
    },
    paymentDate: {
        type: Date
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'card', 'transfer'],
        required: function() {
            return this.status === 'paid';
        }
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

// Middleware kiểm tra ngày thanh toán
fineReceiptSchema.pre('save', function(next) {
    if (this.status === 'paid' && !this.paymentDate) {
        this.paymentDate = new Date();
    }
    if (this.paymentDate && this.paymentDate < this.issueDate) {
        next(new Error('Payment date cannot be before issue date'));
    }
    next();
});

const FineReceipt = mongoose.model('FineReceipt', fineReceiptSchema);

module.exports = FineReceipt; 