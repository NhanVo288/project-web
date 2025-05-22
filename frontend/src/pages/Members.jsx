import React, { useEffect, useState } from 'react';
import Table from '../components/Table';
import Search from '../components/Search';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import Alert from '../components/Alert';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Card from '../components/Card';
import { getAllMembers, createMember, updateMember, deleteMember, searchMembers, getMemberStats } from '../services/memberService';
import axios from 'axios';

const initialForm = {
  fullName: '',
  memberType: '',
  dateOfBirth: '',
  address: '',
  email: '',
  phone: '',
  cardIssueDate: '',
  cardExpiryDate: '',
  note: ''
};

const memberTypeOptions = [
  { value: 'student', label: 'Sinh viên' },
  { value: 'teacher', label: 'Giáo viên' },
  { value: 'staff', label: 'Nhân viên' },
  { value: 'other', label: 'Khác' }
];

const statusOptions = [
  { value: 'active', label: 'Hoạt động' },
  { value: 'inactive', label: 'Ngừng' },
  { value: 'suspended', label: 'Tạm khóa' }
];

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' | 'edit' | 'detail'
  const [selectedMember, setSelectedMember] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [editingStatusId, setEditingStatusId] = useState(null);
  const [memberStats, setMemberStats] = useState(null);
  const [rule, setRule] = useState(null);

  // Fetch members
  const fetchMembers = async () => {
    setLoading(true);
    try {
      const data = await getAllMembers();
      setMembers(data);
    } catch (e) {
      setError('Không thể tải danh sách độc giả');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Search members
  const handleSearch = async (value) => {
    setSearch(value);
    if (!value) {
      fetchMembers();
      return;
    }
    setLoading(true);
    try {
      const data = await searchMembers(value);
      setMembers(data);
    } catch (e) {
      setError('Lỗi tìm kiếm độc giả');
    }
    setLoading(false);
  };

  // Pagination
  const pagedMembers = members.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(members.length / pageSize);

  // Modal open/close
  const openCreateModal = () => {
    setForm(initialForm);
    setModalType('create');
    setShowModal(true);
    setError('');
  };
  const openEditModal = (member) => {
    setForm({
      ...member,
      dateOfBirth: member.dateOfBirth ? member.dateOfBirth.substring(0, 10) : '',
      cardIssueDate: member.cardIssueDate ? member.cardIssueDate.substring(0, 10) : '',
      cardExpiryDate: member.cardExpiryDate ? member.cardExpiryDate.substring(0, 10) : ''
    });
    setSelectedMember(member);
    setModalType('edit');
    setShowModal(true);
    setError('');
  };
  const openDetailModal = async (member) => {
    setSelectedMember(member);
    setModalType('detail');
    setShowModal(true);
    setError('');
    setMemberStats(null);
    try {
      const stats = await getMemberStats(member._id);
      setMemberStats(stats);
    } catch (e) {
      setMemberStats(null);
    }
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedMember(null);
    setError('');
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newForm = { ...form, [name]: value };
    // Nếu chọn ngày cấp thẻ thì tự động set ngày hết hạn = ngày cấp + 6 tháng
    if (name === 'cardIssueDate' && value) {
      const issueDate = new Date(value);
      const expiryDate = new Date(issueDate);
      expiryDate.setMonth(expiryDate.getMonth() + 6);
      // Format yyyy-mm-dd
      const expiryStr = expiryDate.toISOString().substring(0, 10);
      newForm.cardExpiryDate = expiryStr;
    }
    setForm(newForm);
  };

  // Lấy rule hệ thống khi mở modal thêm/sửa
  const fetchRule = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/rules');
      let data = Array.isArray(res.data) ? res.data[0] : res.data;
      if (!data) return;
      if (data.type === 'array' && Array.isArray(data.value)) setRule(data.value[0]);
      else if (data.value) setRule(data.value);
      else setRule(data);
    } catch {}
  };
  useEffect(() => {
    if (showModal && (modalType === 'create' || modalType === 'edit')) fetchRule();
  }, [showModal, modalType]);

  // Hàm tính tuổi
  const calcAge = (dob) => {
    if (!dob) return 0;
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  };

  // Create member
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Kiểm tra tuổi
    if (rule) {
      const age = calcAge(form.dateOfBirth);
      if (age < rule.minAge || age > rule.maxAge) {
        setError(`Độ tuổi độc giả phải từ ${rule.minAge} đến ${rule.maxAge}`);
        setLoading(false);
        return;
      }
    }
    try {
      const data = {
        ...form,
        dateOfBirth: form.dateOfBirth,
        cardIssueDate: form.cardIssueDate || new Date().toISOString().substring(0, 10),
        cardExpiryDate: form.cardExpiryDate
      };
      await createMember(data);
      setSuccess('Thêm độc giả thành công');
      setShowModal(false);
      fetchMembers();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi khi thêm độc giả');
    }
    setLoading(false);
  };

  // Update member
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // Kiểm tra tuổi
    if (rule) {
      const age = calcAge(form.dateOfBirth);
      if (age < rule.minAge || age > rule.maxAge) {
        setError(`Độ tuổi độc giả phải từ ${rule.minAge} đến ${rule.maxAge}`);
        setLoading(false);
        return;
      }
    }
    try {
      const data = {
        ...form,
        dateOfBirth: form.dateOfBirth,
        cardIssueDate: form.cardIssueDate,
        cardExpiryDate: form.cardExpiryDate
      };
      await updateMember(selectedMember._id, data);
      setSuccess('Cập nhật độc giả thành công');
      setShowModal(false);
      fetchMembers();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi khi cập nhật độc giả');
    }
    setLoading(false);
  };

  // Delete member
  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await deleteMember(deleteId);
      setSuccess('Xóa độc giả thành công');
      setShowConfirm(false);
      fetchMembers();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi khi xóa độc giả');
    }
    setLoading(false);
  };

  const handleStatusChange = async (member, newStatus) => {
    setLoading(true);
    setError('');
    try {
      await updateMember(member._id, { ...member, status: newStatus });
      setSuccess('Cập nhật trạng thái thành công');
      fetchMembers();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi khi cập nhật trạng thái');
    }
    setEditingStatusId(null);
    setLoading(false);
  };

  // Table columns
  const columns = [
    { key: 'fullName', label: 'Họ tên' },
    { key: 'memberType', label: 'Loại', render: (item) => memberTypeOptions.find(opt => opt.value === item.memberType)?.label || item.memberType },
    { key: 'dateOfBirth', label: 'Ngày sinh', render: (item) => item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString() : '' },
    { key: 'address', label: 'Địa chỉ' },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'SĐT' },
    { key: 'cardIssueDate', label: 'Ngày cấp', render: (item) => item.cardIssueDate ? new Date(item.cardIssueDate).toLocaleDateString() : '' },
    { key: 'cardExpiryDate', label: 'Ngày hết hạn', render: (item) => item.cardExpiryDate ? new Date(item.cardExpiryDate).toLocaleDateString() : '' },
    {
      key: 'status',
      label: 'Trạng thái',
      render: (item) =>
        editingStatusId === item._id ? (
          <select
            value={item.status}
            onChange={e => handleStatusChange(item, e.target.value)}
            onBlur={() => setEditingStatusId(null)}
            className="border rounded px-2 py-1"
            autoFocus
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : (
          <span onClick={() => setEditingStatusId(item._id)} style={{ cursor: 'pointer' }}>
            <Badge variant={item.status === 'active' ? 'success' : item.status === 'suspended' ? 'warning' : 'error'}>
              {statusOptions.find(opt => opt.value === item.status)?.label || item.status}
            </Badge>
          </span>
        )
    },
  ];

  return (
    <Card title="Quản lý Độc giả">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <Search value={search} onChange={handleSearch} placeholder="Tìm kiếm độc giả..." />
        <Button variant="primary" onClick={openCreateModal}>+ Thêm độc giả</Button>
      </div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {loading ? (
        <Loading />
      ) : members.length === 0 ? (
        <EmptyState title="Không có độc giả" description="Chưa có dữ liệu độc giả trong hệ thống." action={<Button onClick={openCreateModal}>Thêm độc giả mới</Button>} />
      ) : (
        <>
          <Table
            columns={columns}
            data={pagedMembers}
            onEdit={openEditModal}
            onDelete={(item) => {
              if (item.status !== 'active') {
                setDeleteId(item._id); setShowConfirm(true);
              }
            }}
            onRowClick={openDetailModal}
          />
          <div className="flex justify-center mt-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </>
      )}
      {/* Modal Thêm/Sửa/Xem chi tiết */}
      <Modal isOpen={showModal} onClose={closeModal} title={modalType === 'create' ? 'Thêm độc giả' : modalType === 'edit' ? 'Cập nhật độc giả' : 'Chi tiết độc giả'}>
        {modalType === 'detail' && selectedMember ? (
          <div className="space-y-2">
            <div><b>Họ tên:</b> {selectedMember.fullName}</div>
            <div><b>Loại:</b> {memberTypeOptions.find(opt => opt.value === selectedMember.memberType)?.label || selectedMember.memberType}</div>
            <div><b>Ngày sinh:</b> {selectedMember.dateOfBirth ? new Date(selectedMember.dateOfBirth).toLocaleDateString() : ''}</div>
            <div><b>Địa chỉ:</b> {selectedMember.address}</div>
            <div><b>Email:</b> {selectedMember.email}</div>
            <div><b>SĐT:</b> {selectedMember.phone}</div>
            <div><b>Ngày cấp thẻ:</b> {selectedMember.cardIssueDate ? new Date(selectedMember.cardIssueDate).toLocaleDateString() : ''}</div>
            <div><b>Ngày hết hạn:</b> {selectedMember.cardExpiryDate ? new Date(selectedMember.cardExpiryDate).toLocaleDateString() : ''}</div>
            <div><b>Trạng thái:</b> <Badge variant={selectedMember.status === 'active' ? 'success' : selectedMember.status === 'suspended' ? 'warning' : 'error'}>{statusOptions.find(opt => opt.value === selectedMember.status)?.label || selectedMember.status}</Badge></div>
            <div><b>Số lượng sách còn lại:</b> {memberStats ? memberStats.remainingBooks ?? 'Không rõ' : 'Đang tải...'}</div>
            <div><b>Ghi chú:</b> {selectedMember.note}</div>
          </div>
        ) : (
          <form onSubmit={modalType === 'create' ? handleCreate : handleUpdate} className="space-y-4">
            {/* Hiển thị lỗi trong modal bằng Alert popup */}
            {error && <Alert type="error" message={error} onClose={() => setError('')} />}
            <div>
              <label className="block text-sm font-medium">Họ tên</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Loại độc giả</label>
              <select name="memberType" value={form.memberType} onChange={handleChange} required className="w-full border rounded px-2 py-1">
                <option value="">Chọn loại...</option>
                {memberTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">Ngày sinh</label>
              <input name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required type="date" className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Địa chỉ</label>
              <input name="address" value={form.address} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Email</label>
              <input name="email" value={form.email} onChange={handleChange} required type="email" className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Số điện thoại</label>
              <input name="phone" value={form.phone} onChange={handleChange} required type="text" pattern="[0-9]{10}" className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Ngày cấp thẻ</label>
              <input name="cardIssueDate" value={form.cardIssueDate} onChange={handleChange} type="date" className="w-full border rounded px-2 py-1" />
            </div>
            {/* Ẩn trường nhập ngày hết hạn khi thêm mới */}
            {modalType !== 'create' && (
              <div>
                <label className="block text-sm font-medium">Ngày hết hạn thẻ</label>
                <input name="cardExpiryDate" value={form.cardExpiryDate} onChange={handleChange} required type="date" className="w-full border rounded px-2 py-1" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium">Ghi chú</label>
              <textarea name="note" value={form.note} onChange={handleChange} className="w-full border rounded px-2 py-1 min-h-[60px]" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="submit" variant="primary">{modalType === 'create' ? 'Thêm' : 'Cập nhật'}</Button>
              <Button type="button" variant="secondary" onClick={closeModal}>Hủy</Button>
            </div>
          </form>
        )}
      </Modal>
      {/* Confirm xóa */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa độc giả"
        message="Bạn có chắc chắn muốn xóa độc giả này?"
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
      />
    </Card>
  );
};

export default Members; 