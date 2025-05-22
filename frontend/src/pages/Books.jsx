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
import { getAllBooks, createBook, updateBook, deleteBook, searchBooks } from '../services/bookService';

const initialForm = {
  bookCode: '',
  title: '',
  authors: '',
  category: '',
  publisher: '',
  publishYear: '',
  price: '',
  quantity: '',
  description: ''
};

const Books = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' | 'edit' | 'detail'
  const [selectedBook, setSelectedBook] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch books
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const data = await getAllBooks();
      setBooks(data);
    } catch (e) {
      setError('Không thể tải danh sách sách');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // Search books
  const handleSearch = async (value) => {
    setSearch(value);
    if (!value) {
      fetchBooks();
      return;
    }
    setLoading(true);
    try {
      const data = await searchBooks(value);
      setBooks(data);
    } catch (e) {
      setError('Lỗi tìm kiếm sách');
    }
    setLoading(false);
  };

  // Pagination
  const pagedBooks = books.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const totalPages = Math.ceil(books.length / pageSize);

  // Modal open/close
  const openCreateModal = () => {
    setForm(initialForm);
    setModalType('create');
    setShowModal(true);
    setError('');
  };
  const openEditModal = (book) => {
    setForm({
      ...book,
      authors: Array.isArray(book.authors) ? book.authors.join(', ') : book.authors
    });
    setSelectedBook(book);
    setModalType('edit');
    setShowModal(true);
    setError('');
  };
  const openDetailModal = (book) => {
    setSelectedBook(book);
    setModalType('detail');
    setShowModal(true);
    setError('');
  };
  const closeModal = () => {
    setShowModal(false);
    setSelectedBook(null);
    setError('');
  };

  // Handle form change
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create book
  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = {
        ...form,
        authors: form.authors.split(',').map(a => a.trim()).filter(Boolean),
        publishYear: parseInt(form.publishYear),
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity)
      };
      await createBook(data);
      setSuccess('Thêm sách thành công');
      setShowModal(false);
      fetchBooks();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi khi thêm sách');
    }
    setLoading(false);
  };

  // Update book
  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = {
        ...form,
        authors: form.authors.split(',').map(a => a.trim()).filter(Boolean),
        publishYear: parseInt(form.publishYear),
        price: parseFloat(form.price),
        quantity: parseInt(form.quantity)
      };
      await updateBook(selectedBook._id, data);
      setSuccess('Cập nhật sách thành công');
      setShowModal(false);
      fetchBooks();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi khi cập nhật sách');
    }
    setLoading(false);
  };

  // Delete book
  const handleDelete = async () => {
    setLoading(true);
    setError('');
    try {
      await deleteBook(deleteId);
      setSuccess('Xóa sách thành công');
      setShowConfirm(false);
      fetchBooks();
    } catch (e) {
      setError(e.response?.data?.message || 'Lỗi khi xóa sách');
    }
    setLoading(false);
  };

  // Table columns
  const columns = [
    { key: 'bookCode', label: 'Mã sách' },
    { key: 'title', label: 'Tên sách' },
    { key: 'authors', label: 'Tác giả', render: (item) => (Array.isArray(item.authors) ? item.authors.join(', ') : item.authors) },
    { key: 'category', label: 'Thể loại' },
    { key: 'publisher', label: 'NXB' },
    { key: 'publishYear', label: 'Năm XB' },
    { key: 'price', label: 'Trị giá', render: (item) => item.price?.toLocaleString() + ' VNĐ' },
    { key: 'quantity', label: 'Số lượng' },
    { key: 'availableQuantity', label: 'Còn lại' },
    { key: 'status', label: 'Trạng thái', render: (item) => <Badge variant={item.status === 'available' ? 'success' : 'error'}>{item.status === 'available' ? 'Còn' : 'Hết'}</Badge> },
  ];

  return (
    <Card title="Quản lý Sách">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <Search value={search} onChange={handleSearch} placeholder="Tìm kiếm sách..." />
        <Button variant="primary" onClick={openCreateModal}>+ Thêm sách</Button>
      </div>
      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}
      {loading ? (
        <Loading />
      ) : books.length === 0 ? (
        <EmptyState title="Không có sách" description="Chưa có dữ liệu sách trong hệ thống." action={<Button onClick={openCreateModal}>Thêm sách mới</Button>} />
      ) : (
        <>
          <Table
            columns={columns}
            data={pagedBooks}
            onEdit={openEditModal}
            onDelete={(item) => { setDeleteId(item._id); setShowConfirm(true); }}
            onRowClick={openDetailModal}
          />
          <div className="flex justify-center mt-4">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </>
      )}
      {/* Modal Thêm/Sửa/Xem chi tiết */}
      <Modal isOpen={showModal} onClose={closeModal} title={modalType === 'create' ? 'Thêm sách' : modalType === 'edit' ? 'Cập nhật sách' : 'Chi tiết sách'}>
        {modalType === 'detail' && selectedBook ? (
          <div className="space-y-2">
            <div><b>Mã sách:</b> {selectedBook.bookCode}</div>
            <div><b>Tên sách:</b> {selectedBook.title}</div>
            <div><b>Tác giả:</b> {Array.isArray(selectedBook.authors) ? selectedBook.authors.join(', ') : selectedBook.authors}</div>
            <div><b>Thể loại:</b> {selectedBook.category}</div>
            <div><b>NXB:</b> {selectedBook.publisher}</div>
            <div><b>Năm XB:</b> {selectedBook.publishYear}</div>
            <div><b>Trị giá:</b> {selectedBook.price?.toLocaleString()} VNĐ</div>
            <div><b>Số lượng:</b> {selectedBook.quantity}</div>
            <div><b>Còn lại:</b> {selectedBook.availableQuantity}</div>
            <div><b>Trạng thái:</b> <Badge variant={selectedBook.status === 'available' ? 'success' : 'error'}>{selectedBook.status === 'available' ? 'Còn' : 'Hết'}</Badge></div>
            <div><b>Mô tả:</b> {selectedBook.description}</div>
          </div>
        ) : (
          <form onSubmit={modalType === 'create' ? handleCreate : handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Mã sách</label>
              <input name="bookCode" value={form.bookCode} onChange={handleChange} required disabled={modalType === 'edit'} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Tên sách</label>
              <input name="title" value={form.title} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Tác giả (cách nhau dấu phẩy)</label>
              <input name="authors" value={form.authors} onChange={handleChange} required className="w-full border rounded px-2 py-1" placeholder="Nguyễn Văn A, Trần B" />
            </div>
            <div>
              <label className="block text-sm font-medium">Thể loại</label>
              <input name="category" value={form.category} onChange={handleChange} required className="w-full border rounded px-2 py-1" placeholder="A, B, C..." />
            </div>
            <div>
              <label className="block text-sm font-medium">Nhà xuất bản</label>
              <input name="publisher" value={form.publisher} onChange={handleChange} required className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Năm xuất bản</label>
              <input name="publishYear" value={form.publishYear} onChange={handleChange} required type="number" min="1900" max={new Date().getFullYear()} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Trị giá (VNĐ)</label>
              <input name="price" value={form.price} onChange={handleChange} required type="number" min="0" className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Số lượng bản</label>
              <input name="quantity" value={form.quantity} onChange={handleChange} required type="number" min="1" className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Mô tả</label>
              <textarea name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-2 py-1 min-h-[60px]" />
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
        title="Xác nhận xóa sách"
        message="Bạn có chắc chắn muốn xóa sách này?"
        confirmText="Xóa"
        cancelText="Hủy"
        variant="danger"
      />
    </Card>
  );
};

export default Books; 