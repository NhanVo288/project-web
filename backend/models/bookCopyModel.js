const mongoose = require('mongoose');

const bookCopySchema = mongoose.Schema({
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  copyNumber: { type: Number, required: true },
  status: { type: String, enum: ['available', 'borrowed', 'lost', 'damaged'], default: 'available' },
  barcode: { type: String },
  borrowId: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrow' }
}, { timestamps: true });

const BookCopy = mongoose.model('BookCopy', bookCopySchema);

module.exports = BookCopy; 