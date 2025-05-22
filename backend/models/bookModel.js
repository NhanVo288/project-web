const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    bookCode: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    authors: [{
        type: String,
        required: true,
        trim: true
    }],
    category: {
        type: String,
        required: true,
        trim: true
    },
    publisher: {
        type: String,
        required: true,
        trim: true
    },
    publishYear: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    quantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    availableQuantity: {
        type: Number,
        required: true,
        min: 0,
        default: 0
    },
    status: {
        type: String,
        enum: ['available', 'unavailable'],
        default: 'available'
    },
    description: {
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

// Middleware kiểm tra ràng buộc năm xuất bản và số lượng tác giả
bookSchema.pre('save', function(next) {
  const now = new Date();
  if (now.getFullYear() - this.publishYear > 8) {
    return next(new Error('Chỉ nhận các sách xuất bản trong vòng 8 năm.'));
  }
  if (this.authors.length > 100) {
    return next(new Error('Tối đa 100 tác giả cho một cuốn sách.'));
  }
  next();
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
