const Member = require('../models/memberModel');
const Borrow = require('../models/borrowModel');
const FineReceipt = require('../models/fineReceiptModel');

// Lấy danh sách thành viên
exports.getAllMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thành viên theo ID
exports.getMemberById = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ message: 'Member not found' });
    res.status(200).json(member);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo thành viên mới
exports.createMember = async (req, res) => {
  try {
    const {
      fullName,
      memberType,
      dateOfBirth,
      address,
      email,
      phone,
      cardIssueDate,
      cardExpiryDate,
      note
    } = req.body;

    // Validate required fields
    if (!fullName || !memberType || !dateOfBirth || !address || !email || !phone || !cardExpiryDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if email already exists
    const existingMember = await Member.findOne({ email });
    if (existingMember) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create new member
    const member = new Member({
      fullName,
      memberType,
      dateOfBirth,
      address,
      email,
      phone,
      cardIssueDate: cardIssueDate || new Date(),
      cardExpiryDate,
      note
    });

    const savedMember = await member.save();
    res.status(201).json(savedMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật thành viên
exports.updateMember = async (req, res) => {
  try {
    const {
      fullName,
      memberType,
      dateOfBirth,
      address,
      email,
      phone,
      cardExpiryDate,
      status,
      note
    } = req.body;

    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Check if email is being changed and already exists
    if (email && email !== member.email) {
      const existingMember = await Member.findOne({ email });
      if (existingMember) {
        return res.status(400).json({ message: 'Email already exists' });
      }
    }

    // Update member
    member.fullName = fullName || member.fullName;
    member.memberType = memberType || member.memberType;
    member.dateOfBirth = dateOfBirth || member.dateOfBirth;
    member.address = address || member.address;
    member.email = email || member.email;
    member.phone = phone || member.phone;
    member.cardExpiryDate = cardExpiryDate || member.cardExpiryDate;
    member.status = status || member.status;
    member.note = note || member.note;

    const updatedMember = await member.save();
    res.status(200).json(updatedMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa thành viên
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found' });
    }

    // Check if member has any active borrows
    const activeBorrows = await Borrow.countDocuments({
      member: member._id,
      status: 'borrowed'
    });

    if (activeBorrows > 0) {
      return res.status(400).json({ message: 'Cannot delete member with active borrows' });
    }

    // Check if member has any unpaid fines
    const unpaidFines = await FineReceipt.countDocuments({
      member: member._id,
      status: 'pending'
    });

    if (unpaidFines > 0) {
      return res.status(400).json({ message: 'Cannot delete member with unpaid fines' });
    }

    await Member.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Member deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tìm kiếm thành viên
exports.searchMembers = async (req, res) => {
  try {
    const q = req.query.q || '';
    const members = await Member.find({
      $or: [
        { fullName: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { address: { $regex: q, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy thống kê thành viên
exports.getMemberStats = async (req, res) => {
  try {
    const memberId = req.params.id;
    const totalBorrows = await Borrow.countDocuments({ member: memberId });
    const activeBorrows = await Borrow.countDocuments({ member: memberId, status: 'borrowed' });
    const overdueBorrows = await Borrow.countDocuments({ member: memberId, status: 'overdue' });
    const totalFines = await FineReceipt.aggregate([
      { $match: { member: memberId } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const unpaidFines = await FineReceipt.aggregate([
      { $match: { member: memberId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    res.status(200).json({
      totalBorrows,
      activeBorrows,
      overdueBorrows,
      totalFines: totalFines[0]?.total || 0,
      unpaidFines: unpaidFines[0]?.total || 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 