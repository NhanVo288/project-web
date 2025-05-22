const mongoose = require('mongoose');

// BM7.1: Báo cáo thống kê mượn sách theo thể loại
const borrowStatsSchema = mongoose.Schema({
  month: { type: String, required: true }, // "MM-YYYY"
  category: { type: String, enum: ['A', 'B', 'C'], required: true },
  borrowCount: { type: Number, required: true },
  ratio: { type: Number, required: true }
});

// BM7.2: Báo cáo thống kê sách trả trễ
const lateReturnStatsSchema = mongoose.Schema({
  date: { type: Date, required: true },
  bookTitle: { type: String, required: true },
  borrowDate: { type: Date, required: true },
  lateDays: { type: Number, required: true }
});

const BorrowStats = mongoose.model('BorrowStats', borrowStatsSchema);
const LateReturnStats = mongoose.model('LateReturnStats', lateReturnStatsSchema);

const reportSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
        trim: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    data: {
        totalBooks: { type: Number, default: 0 },
        totalBorrows: { type: Number, default: 0 },
        totalReturns: { type: Number, default: 0 },
        totalFines: { type: Number, default: 0 },
        totalMembers: { type: Number, default: 0 },
        categoryStats: [{ category: String, count: Number }],
        memberTypeStats: [{ type: String, count: Number }],
        fineStats: { total: Number, paid: Number, pending: Number }
    },
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
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
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Middleware kiểm tra ngày báo cáo
reportSchema.pre('save', function(next) {
    if (this.endDate <= this.startDate) {
        next(new Error('End date must be after start date'));
    }
    next();
});

// Middleware tính toán thống kê
reportSchema.pre('save', function(next) {
    if (this.isModified('data')) {
        // Tính tổng số tiền phạt
        this.data.fineStats.total = this.data.fineStats.paid + this.data.fineStats.pending;
    }
    next();
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
module.exports.BorrowStats = BorrowStats;
module.exports.LateReturnStats = LateReturnStats; 