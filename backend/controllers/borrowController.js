const Borrow = require('../models/borrowModel');
const Book = require('../models/bookModel');
const BookCopy = require('../models/bookCopyModel');
const Member = require('../models/memberModel');
const FineReceipt = require('../models/fineReceiptModel');

// Lấy danh sách mượn trả
exports.getBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find()
      .populate('member', 'fullName email phone')
      .populate('book', 'bookCode title category authors')
      .sort({ createdAt: -1 });
    res.status(200).json({ count: borrows.length, data: borrows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thông tin mượn trả theo ID
exports.getBorrowById = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id)
      .populate('member', 'fullName email phone')
      .populate('book', 'bookCode title category authors');
    if (!borrow) return res.status(404).json({ message: 'Borrow record not found' });
    res.status(200).json(borrow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo mới bản ghi mượn sách (theo BookCopy)
exports.createBorrow = async (req, res) => {
  try {
    console.log('BORROW DATA:', req.body);
    const { member, books, borrowDate, dueDate, note, prepaid } = req.body;
    if (!member || !Array.isArray(books) || books.length === 0 || !dueDate) {
      return res.status(400).json({ message: 'Member, books and due date are required' });
    }
    const memberExists = await Member.findById(member);
    if (!memberExists) {
      return res.status(404).json({ message: 'Member not found' });
    }
    if (memberExists.status !== 'active') {
      return res.status(400).json({ message: 'Member is not active' });
    }
    // Đếm số lượng sách đang mượn
    const activeBorrows = await Borrow.countDocuments({
      member,
      status: 'borrowed'
    });
    let totalBorrow = activeBorrows;
    let createdBorrows = [];
    let prepaidLeft = prepaid || 0;
    for (const [bookIdx, b] of books.entries()) {
      const { bookId, quantity } = b;
      const bookExists = await Book.findById(bookId);
      if (!bookExists) {
        return res.status(404).json({ message: `Book not found: ${bookId}` });
      }
      if (bookExists.availableQuantity < (quantity || 1)) {
        return res.status(400).json({ message: `Book is not available: ${bookExists.title}` });
      }
      // Phân bổ tiền trả trước cho từng sách
      let paid = 0;
      if (prepaidLeft > 0) {
        const totalPrice = (bookExists.price || 0) * (quantity || 1);
        paid = Math.min(prepaidLeft, totalPrice);
        prepaidLeft -= paid;
      }
      const borrow = new Borrow({
        member,
        book: bookId,
        borrowDate: borrowDate ? new Date(borrowDate) : new Date(),
        dueDate,
        note,
        prepaid: paid,
        paid: paid,
        price: bookExists.price || 0,
        quantity: quantity || 1
      });
      bookExists.availableQuantity -= (quantity || 1);
      await bookExists.save();
      const savedBorrow = await borrow.save();
      createdBorrows.push(savedBorrow);
      totalBorrow += (quantity || 1);
    }
    res.status(201).json(createdBorrows);
  } catch (error) {
    console.error('CREATE BORROW ERROR:', error);
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật bản ghi mượn (trả sách)
exports.returnBook = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ message: 'Borrow record not found' });
    }
    // Kiểm tra còn nợ không
    const total = (borrow.price || 0) * (borrow.quantity || 1) + (borrow.fine || 0);
    const paid = typeof borrow.paid === 'number' ? borrow.paid : (borrow.prepaid || 0);
    const totalOwed = Math.max(0, total - paid);
    if (totalOwed > 0) {
      return res.status(400).json({ message: 'Chưa trả đủ nợ, không thể trả sách' });
    }
    if (borrow.status === 'returned') {
      return res.status(400).json({ message: 'Book has already been returned' });
    }
    const returnDate = new Date();
    const dueDate = new Date(borrow.dueDate);
    let fine = 0;
    if (returnDate > dueDate) {
      const daysLate = Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24));
      fine = daysLate * 1000;
      const fineReceipt = new FineReceipt({
        member: borrow.member,
        borrow: borrow._id,
        amount: fine,
        reason: `Late return: ${daysLate} days`,
        issueDate: returnDate
      });
      await fineReceipt.save();
    }
    borrow.returnDate = returnDate;
    borrow.status = 'returned';
    borrow.fine = fine;
    await borrow.save();
    const book = await Book.findById(borrow.book);
    book.availableQuantity += borrow.quantity || 1;
    await book.save();
    res.status(200).json(borrow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa bản ghi mượn
exports.deleteBorrow = async (req, res) => {
  try {
    const deletedBorrow = await Borrow.findByIdAndDelete(req.params.id);
    if (!deletedBorrow) return res.status(404).json({ message: 'Borrow record not found' });
    res.status(200).json({ message: 'Borrow record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all borrows
exports.getAllBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find()
      .populate('member', 'fullName email phone')
      .populate('book', 'bookCode title category authors')
      .sort({ createdAt: -1 });
    res.status(200).json(borrows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get member's borrows
exports.getMemberBorrows = async (req, res) => {
  try {
    const memberId = req.params.memberId;
    const borrows = await Borrow.find({ member: memberId })
      .populate('book', 'bookCode title category authors')
      .sort({ createdAt: -1 });
    res.status(200).json(borrows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get book's borrows
exports.getBookBorrows = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    const borrows = await Borrow.find({ book: bookId })
      .populate('member', 'fullName email phone')
      .sort({ createdAt: -1 });
    res.status(200).json(borrows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get overdue borrows
exports.getOverdueBorrows = async (req, res) => {
  try {
    const now = new Date();
    const borrows = await Borrow.find({
      status: 'borrowed',
      dueDate: { $lt: now }
    })
      .populate('member', 'fullName email phone')
      .populate('book', 'bookCode title authors')
      .sort({ dueDate: 1 });
    res.status(200).json(borrows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Thêm route cập nhật tiền đã trả
exports.updatePaid = async (req, res) => {
  try {
    const { paid } = req.body;
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) return res.status(404).json({ message: 'Borrow not found' });
    borrow.paid = paid;
    await borrow.save();
    // Populate lại thông tin book và member để trả về dữ liệu đầy đủ cho frontend
    const populatedBorrow = await Borrow.findById(borrow._id)
      .populate('book', 'bookCode title category authors price')
      .populate('member', 'fullName email phone');
    res.json(populatedBorrow);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 