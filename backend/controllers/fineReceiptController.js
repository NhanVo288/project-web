const FineReceipt = require('../models/fineReceiptModel');
const Member = require('../models/memberModel');
const Borrow = require('../models/borrowModel');

exports.createFineReceipt = async (req, res) => {
  try {
    const {
      member,
      borrow,
      amount,
      reason,
      note
    } = req.body;

    // Validate required fields
    if (!member || !amount || !reason) {
      return res.status(400).json({ message: 'Member, amount and reason are required' });
    }

    // Check if member exists
    const memberExists = await Member.findById(member);
    if (!memberExists) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Check if borrow exists if provided
    if (borrow) {
      const borrowExists = await Borrow.findById(borrow);
      if (!borrowExists) {
        return res.status(404).json({ message: 'Borrow record not found' });
      }
    }

    // Create new fine receipt
    const fineReceipt = new FineReceipt({
      member,
      borrow,
      amount,
      reason,
      note,
      issueDate: new Date()
    });

    const savedFineReceipt = await fineReceipt.save();
    res.status(201).json(savedFineReceipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllFineReceipts = async (req, res) => {
  try {
    const fineReceipts = await FineReceipt.find()
      .populate('member', 'fullName email phone')
      .populate('borrow', 'book borrowDate dueDate')
      .sort({ createdAt: -1 });
    res.status(200).json(fineReceipts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFineReceiptById = async (req, res) => {
  try {
    const fineReceipt = await FineReceipt.findById(req.params.id)
      .populate('member', 'fullName email phone')
      .populate('borrow', 'book borrowDate dueDate');
    if (!fineReceipt) {
      return res.status(404).json({ message: 'Fine receipt not found' });
    }
    res.status(200).json(fineReceipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMemberFineReceipts = async (req, res) => {
  try {
    const memberId = req.params.memberId;
    const fineReceipts = await FineReceipt.find({ member: memberId })
      .populate('borrow', 'book borrowDate dueDate')
      .sort({ createdAt: -1 });
    res.status(200).json(fineReceipts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUnpaidFineReceipts = async (req, res) => {
  try {
    const fineReceipts = await FineReceipt.find({ status: 'pending' })
      .populate('member', 'fullName email phone')
      .populate('borrow', 'book borrowDate dueDate')
      .sort({ issueDate: 1 });
    res.status(200).json(fineReceipts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFineStats = async (req, res) => {
  try {
    const stats = await FineReceipt.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = {
      total: 0,
      paid: 0,
      pending: 0,
      cancelled: 0
    };

    stats.forEach(stat => {
      result[stat._id] = stat.total;
      result.total += stat.total;
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateFineReceipt = async (req, res) => {
  try {
    const {
      amount,
      reason,
      status,
      paymentMethod,
      note
    } = req.body;

    const fineReceipt = await FineReceipt.findById(req.params.id);
    if (!fineReceipt) {
      return res.status(404).json({ message: 'Fine receipt not found' });
    }

    // Check if fine receipt is already paid
    if (fineReceipt.status === 'paid') {
      return res.status(400).json({ message: 'Cannot update paid fine receipt' });
    }

    // Update fine receipt
    fineReceipt.amount = amount || fineReceipt.amount;
    fineReceipt.reason = reason || fineReceipt.reason;
    fineReceipt.status = status || fineReceipt.status;
    fineReceipt.paymentMethod = paymentMethod || fineReceipt.paymentMethod;
    fineReceipt.note = note || fineReceipt.note;

    // Set payment date if status is changed to paid
    if (status === 'paid' && fineReceipt.status !== 'paid') {
      fineReceipt.paymentDate = new Date();
    }

    const updatedFineReceipt = await fineReceipt.save();
    res.status(200).json(updatedFineReceipt);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 