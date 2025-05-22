import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AsyncSelect from 'react-select/async';
import { searchMembers } from '../services/memberService';
import { searchBooks } from '../services/bookService';
import Modal from '../components/Modal';
import Select from 'react-select';

const API_URL = 'http://localhost:5000/api/borrows';
const BOOKS_URL = 'http://localhost:5000/api/books';
const MEMBERS_URL = 'http://localhost:5000/api/members';

const inputStyle = {
  padding: '8px',
  marginRight: '8px',
  border: '1px solid #b3b3b3',
  borderRadius: '4px',
  minWidth: '120px',
};
const buttonStyle = {
  padding: '8px 16px',
  marginRight: '8px',
  border: 'none',
  borderRadius: '4px',
  background: '#4fc3f7',
  color: '#222',
  cursor: 'pointer',
};
const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  background: '#f8fbff',
};
const thtdStyle = {
  border: '1px solid #b3b3b3',
  padding: '8px',
};

const Borrows = () => {
  const [borrows, setBorrows] = useState([]);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ memberId: '', bookId: '', borrowDate: '', dueDate: '' });
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberBorrows, setMemberBorrows] = useState([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedBooks, setSelectedBooks] = useState([]);
  const [bookQuantities, setBookQuantities] = useState({});
  const [prepaid, setPrepaid] = useState('');
  const [editPaid, setEditPaid] = useState({});

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, mRes, brRes] = await Promise.all([
        axios.get(BOOKS_URL),
        axios.get(MEMBERS_URL),
        axios.get(API_URL)
      ]);
      setBooks(Array.isArray(bRes.data) ? bRes.data : []);
      setMembers(Array.isArray(mRes.data) ? mRes.data : []);
      setBorrows(Array.isArray(brRes.data) ? brRes.data : []);
    } catch (e) {
      setBooks([]);
      setMembers([]);
      setBorrows([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectBooks = (books) => {
    setSelectedBooks(books || []);
    const newQuantities = { ...bookQuantities };
    (books || []).forEach(b => {
      if (!newQuantities[b.value]) newQuantities[b.value] = 1;
    });
    Object.keys(newQuantities).forEach(id => {
      if (!(books || []).find(b => b.value === id)) delete newQuantities[id];
    });
    setBookQuantities(newQuantities);
  };

  const totalPrice = selectedBooks.reduce((sum, b) => {
    const book = books.find(x => x._id === b.value);
    const qty = bookQuantities[b.value] || 1;
    return sum + (book?.price || 0) * qty;
  }, 0);

  const handleQuantityChange = (bookId, qty) => {
    setBookQuantities(q => ({ ...q, [bookId]: Math.max(1, Number(qty)||1) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        member: form.memberId,
        books: selectedBooks.map(b => ({ bookId: b.value, quantity: bookQuantities[b.value] || 1 })),
        borrowDate: form.borrowDate,
        dueDate: form.dueDate,
        prepaid: prepaid
      };
      await axios.post(API_URL, data);
      setForm({ memberId: '', bookId: '', borrowDate: '', dueDate: '' });
      setSelectedBooks([]);
      setBookQuantities({});
      setPrepaid('');
      await fetchAll();
      setShowForm(false);
    } catch (e) {}
    setLoading(false);
  };

  const handleReturn = async (id) => {
    setLoading(true);
    await axios.put(`${API_URL}/${id}/return`);
    await fetchAll();
    setLoading(false);
  };

  const loadMemberOptions = async (inputValue) => {
    if (!inputValue) return [];
    const members = await searchMembers(inputValue);
    return members.map(m => ({ value: m._id, label: m.fullName }));
  };

  const loadBookOptions = async (inputValue) => {
    if (!inputValue) return [];
    const books = await searchBooks(inputValue);
    return books.map(b => ({ value: b._id, label: `${b.bookCode} - ${b.title}` }));
  };

  const handleMemberClick = async (memberId) => {
    setSelectedMember(members.find(m => m._id === memberId));
    const res = await axios.get(`${API_URL}/member/${memberId}`);
    setMemberBorrows(res.data);
    setShowMemberModal(true);
  };

  const handleEditPaidChange = (borrowId, value) => {
    setEditPaid(e => ({ ...e, [borrowId]: value }));
  };

  const handleUpdatePaid = async (borrowId) => {
    const value = Number(editPaid[borrowId] || 0);
    await axios.patch(`${API_URL}/${borrowId}/update-paid`, { paid: value });
    await handleMemberClick(selectedMember._id);
    await fetchAll();
  };

  // Hàm lọc borrow theo search
  const filteredBorrows = borrows.filter(br => {
    const memberName = (br.member?.fullName || '').toLowerCase();
    const bookTitle = (br.book?.title || '').toLowerCase();
    return (
      memberName.includes(search.toLowerCase()) ||
      bookTitle.includes(search.toLowerCase())
    );
  });

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: 24 }}>
      <h1 style={{fontSize:30,marginBottom:16}}>Borrow/Return Books</h1>
      <button style={{...buttonStyle, marginBottom: 16, float: 'right'}} onClick={()=>setShowForm(true)}>+ Thêm</button>
      <div style={{clear:'both'}}></div>
      <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="text"
          placeholder="Tìm theo tên độc giả hoặc tên sách..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, border: '1px solid #b3b3b3', borderRadius: 4, minWidth: 300 }}
        />
      </div>
      <Modal isOpen={showForm} onClose={()=>setShowForm(false)} title="Tạo phiếu mượn" style={{minWidth:700,maxWidth:900}}>
        <form onSubmit={handleSubmit} style={{ marginBottom: 24, background: '#e3f4fd', padding: 24, borderRadius: 12, display: 'flex', flexDirection: 'column', gap: 20, minWidth: 650, maxWidth: 850 }}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <label htmlFor="member-select">Độc giả:</label>
            <AsyncSelect
              inputId="member-select"
              cacheOptions
              loadOptions={loadMemberOptions}
              defaultOptions
              value={form.memberId ? { value: form.memberId, label: members.find(m => m._id === form.memberId)?.fullName } : null}
              onChange={opt => setForm(f => ({ ...f, memberId: opt?.value || '' }))}
              placeholder="Tìm độc giả..."
              styles={{ container: base => ({ ...base, minWidth: 220, marginRight: 8 }) }}
              isClearable
              formatOptionLabel={option => {
                const member = members.find(m => m._id === option.value);
                return (
                  <span>
                    {option.label}
                    {member && member.activeBorrows ? ` (Đang mượn: ${member.activeBorrows})` : ''}
                  </span>
                );
              }}
            />
          </div>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <label htmlFor="book-select">Sách:</label>
            <Select
              inputId="book-select"
              isMulti
              options={books.map(b => ({ value: b._id, label: `${b.bookCode} - ${b.title}` }))}
              value={selectedBooks}
              onChange={handleSelectBooks}
              placeholder="Chọn sách..."
              styles={{ container: base => ({ ...base, minWidth: 300, marginRight: 8 }) }}
            />
          </div>
          {selectedBooks.length > 0 && (
            <div style={{background:'#f4faff',padding:16,borderRadius:8,marginBottom:8}}>
              <div style={{display:'flex',fontWeight:'bold',marginBottom:8,gap:32}}>
                <span style={{minWidth:220}}>Tên sách</span>
                <span style={{minWidth:100}}>Số lượng</span>
                <span style={{minWidth:120}}>Đơn giá</span>
                <span style={{minWidth:140}}>Thành tiền</span>
              </div>
              {selectedBooks.map(b => {
                const book = books.find(x => x._id === b.value);
                return (
                  <div key={b.value} style={{display:'flex',alignItems:'center',gap:32,marginBottom:8}}>
                    <span style={{minWidth:220,whiteSpace:'normal'}}>{b.label}</span>
                    <input type="number" min="1" value={bookQuantities[b.value]||1} onChange={e=>handleQuantityChange(b.value, e.target.value)} style={{width:70,padding:4,border:'1px solid #b3b3b3',borderRadius:4}} />
                    <span style={{minWidth:120}}>{(book?.price||0).toLocaleString()} VNĐ</span>
                    <span style={{minWidth:140,fontWeight:'bold'}}>{((book?.price||0)*(bookQuantities[b.value]||1)).toLocaleString()} VNĐ</span>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <label htmlFor="borrow-date">Ngày mượn:</label>
            <input id="borrow-date" name="borrowDate" type="date" value={form.borrowDate} onChange={handleChange} required style={inputStyle} />
            <label htmlFor="due-date">Ngày trả:</label>
            <input id="due-date" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} required style={inputStyle} />
          </div>
          <div style={{display:'flex',alignItems:'center',gap:16,marginTop:8}}>
            <span><b>Tổng tiền:</b> {totalPrice.toLocaleString()} VNĐ</span>
            <label>Trả trước:</label>
            <input type="number" min="0" value={prepaid} onChange={e=>setPrepaid(e.target.value)} style={{padding:8,border:'1px solid #b3b3b3',borderRadius:4,width:120}} placeholder="Số tiền trả trước" />
          </div>
          <button type="submit" style={buttonStyle} disabled={loading}>Borrow</button>
        </form>
      </Modal>
      {loading ? <div>Loading...</div> : (
        Array.isArray(filteredBorrows) && filteredBorrows.length === 0 ? <div style={{marginTop: 24}}>No borrow records found.</div> : (
        <table style={{...tableStyle, marginTop: 24}}>
          <thead>
            <tr style={{background: '#000', color: '#fff'}}>
              <th style={thtdStyle}>STT</th>
              <th style={thtdStyle}>Mã Sách</th>
              <th style={thtdStyle}>Tên Sách</th>
              <th style={thtdStyle}>Thể Loại</th>
              <th style={thtdStyle}>Tác Giả</th>
              <th style={thtdStyle}>Số lượng</th>
              <th style={thtdStyle}>Độc Giả</th>
              <th style={thtdStyle}>Ngày Mượn</th>
              <th style={thtdStyle}>Ngày trả dự kiến</th>
              <th style={thtdStyle}>Ngày Trả</th>
              <th style={thtdStyle}>Tiền phạt</th>
              <th style={thtdStyle}>Tiền nợ</th>
              <th style={thtdStyle}>Trạng Thái</th>
              <th style={thtdStyle}>Thao Tác</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(filteredBorrows) ? filteredBorrows : []).map((br, idx) => {
              const price = typeof br.price === 'number' ? br.price : (br.book?.price || 0);
              const quantity = typeof br.quantity === 'number' ? br.quantity : 1;
              const fine = (br.fine || 0);
              const total = price * quantity;
              const paid = (typeof br.paid === 'number' ? br.paid : (br.prepaid ?? 0));
              const totalOwed = Math.max(0, total + fine - paid);
              const isReturned = br.status === 'returned';
              const isLate = isReturned && br.returnDate && br.dueDate && new Date(br.returnDate) > new Date(br.dueDate);
              let statusText = '';
              if (isReturned) statusText = isLate ? 'Trả muộn' : 'Đã trả';
              else statusText = 'Đang mượn';
              return (
                <tr key={br._id}>
                  <td style={thtdStyle}>{idx + 1}</td>
                  <td style={thtdStyle}>{br.book?.bookCode || br.bookId?.bookCode}</td>
                  <td style={thtdStyle}>{br.book?.title || br.bookId?.title}</td>
                  <td style={thtdStyle}>{br.book?.category || br.bookId?.category || '-'}</td>
                  <td style={thtdStyle}>{Array.isArray(br.book?.authors) ? br.book.authors.join(', ') : (Array.isArray(br.bookId?.authors) ? br.bookId.authors.join(', ') : '')}</td>
                  <td style={thtdStyle}>{typeof br.quantity === 'number' ? br.quantity : 1}</td>
                  <td style={thtdStyle}>
                    <div style={{display:'flex',alignItems:'center',gap:8,justifyContent:'center'}}>
                      <div style={{width:32,height:32,borderRadius:'50%',background:'#e3f4fd',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:'bold',fontSize:16,color:'#1976d2'}}>
                        {(br.member?.fullName || br.memberId?.fullName || '?').charAt(0).toUpperCase()}
                      </div>
                      <div style={{display:'flex',flexDirection:'column',alignItems:'flex-start'}}>
                        <span style={{fontWeight:'bold',color:'#1976d2',cursor:'pointer',textDecoration:'underline'}} onClick={()=>handleMemberClick((br.member?._id)||br.memberId?._id)}>
                          {br.member?.fullName || br.memberId?.fullName}
                        </span>
                        <span style={{fontSize:12,color:'#888'}}>{br.member?.email || br.memberId?.email || ''}</span>
                      </div>
                    </div>
                  </td>
                  <td style={thtdStyle}>{br.borrowDate ? new Date(br.borrowDate).toLocaleDateString() : ''}</td>
                  <td style={thtdStyle}>{br.dueDate ? new Date(br.dueDate).toLocaleDateString() : '-'}</td>
                  <td style={thtdStyle}>{br.returnDate ? new Date(br.returnDate).toLocaleDateString() : '-'}</td>
                  <td style={thtdStyle}>{fine > 0 ? fine.toLocaleString() + ' VNĐ' : '-'}</td>
                  <td style={thtdStyle}>{totalOwed.toLocaleString()} VNĐ</td>
                  <td style={thtdStyle}>{statusText}</td>
                  <td style={thtdStyle}>
                    {!isReturned && totalOwed === 0 && (
                      <button style={buttonStyle} onClick={() => handleReturn(br._id)} disabled={loading}>Trả sách</button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        )
      )}
      {showMemberModal && (
        <div className="modal-member-borrows" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.3)',zIndex:1000,display:'flex',justifyContent:'center',alignItems:'center'}} onClick={()=>setShowMemberModal(false)}>
          <div style={{background:'#fff',padding:24,borderRadius:8,minWidth:900}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:22,marginBottom:8}}>Phiếu Mượn Sách</h3>
            <div style={{marginBottom:8}}>Họ tên độc giả: <b>{selectedMember?.fullName}</b></div>
            <table style={{width:'100%',marginTop:8,borderCollapse:'collapse',background:'#f8fbff'}} border="1">
              <thead style={{background:'#e3f4fd'}}>
                <tr>
                  <th style={{textAlign:'center',padding:8}}>STT</th>
                  <th style={{textAlign:'center',padding:8}}>Mã Sách</th>
                  <th style={{textAlign:'center',padding:8}}>Tên Sách</th>
                  <th style={{textAlign:'center',padding:8}}>Thể Loại</th>
                  <th style={{textAlign:'center',padding:8}}>Tác Giả</th>
                  <th style={{textAlign:'center',padding:8}}>Số lượng</th>
                  <th style={{textAlign:'center',padding:8}}>Ngày mượn</th>
                  <th style={{textAlign:'center',padding:8}}>Tổng tiền</th>
                  <th style={{textAlign:'center',padding:8}}>Tiền đã trả</th>
                  <th style={{textAlign:'center',padding:8}}>Tiền còn nợ</th>
                  <th style={{textAlign:'center',padding:8}}>Trạng thái</th>
                  <th style={{textAlign:'center',padding:8}}>Cập nhật</th>
                </tr>
              </thead>
              <tbody>
                {memberBorrows.map((b, idx) => {
                  const price = typeof b.price === 'number' ? b.price : (b.book?.price || 0);
                  const quantity = typeof b.quantity === 'number' ? b.quantity : 1;
                  const fine = (b.fine || 0);
                  const total = price * quantity + fine;
                  const paid = editPaid[b._id] !== undefined ? Number(editPaid[b._id]) : (typeof b.paid === 'number' ? b.paid : (b.prepaid ?? 0));
                  const totalOwed = Math.max(0, total - paid);
                  return (
                    <tr key={b._id} style={{ textAlign: 'center' }}>
                      <td style={{ padding: 8 }}>{idx + 1}</td>
                      <td style={{ padding: 8 }}>{b.book?.bookCode}</td>
                      <td style={{ padding: 8 }}>{b.book?.title}</td>
                      <td style={{ padding: 8 }}>{b.book?.category}</td>
                      <td style={{ padding: 8 }}>{Array.isArray(b.book?.authors) ? b.book.authors.join(', ') : ''}</td>
                      <td style={{ padding: 8 }}>{quantity}</td>
                      <td style={{ padding: 8 }}>{b.borrowDate ? new Date(b.borrowDate).toLocaleDateString() : ''}</td>
                      <td style={{ padding: 8 }}>{total.toLocaleString()} VNĐ</td>
                      <td style={{ padding: 8 }}>
                        <input type="number" min="0" value={paid} onChange={e => handleEditPaidChange(b._id, e.target.value)} style={{ width: 80, textAlign: 'right', padding: 4 }} />
                      </td>
                      <td style={{ padding: 8, fontWeight: 'bold' }}>{totalOwed.toLocaleString()} VNĐ</td>
                      <td style={{ padding: 8 }}>{totalOwed <= 0 ? 'Đã hết nợ' : 'Còn nợ'}</td>
                      <td style={{ padding: 8 }}>
                        <button onClick={() => handleUpdatePaid(b._id)} style={{ padding: '2px 12px', borderRadius: 4, background: '#4fc3f7', color: '#222', border: 'none' }}>Lưu</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot style={{ background: '#e3f4fd', fontWeight: 'bold' }}>
                <tr>
                  <td colSpan={7} style={{ textAlign: 'right', padding: 8 }}>Tổng cộng:</td>
                  <td style={{ textAlign: 'center', padding: 8 }}>
                    {memberBorrows.reduce((sum, b) => {
                      const price = typeof b.price === 'number' ? b.price : (b.book?.price || 0);
                      const quantity = typeof b.quantity === 'number' ? b.quantity : 1;
                      const fine = (b.fine || 0);
                      return sum + (price * quantity + fine);
                    }, 0).toLocaleString()} VNĐ
                  </td>
                  <td style={{ textAlign: 'center', padding: 8 }}>
                    {memberBorrows.reduce((sum, b) => sum + (typeof b.paid === 'number' ? b.paid : (b.prepaid ?? 0)), 0).toLocaleString()} VNĐ
                  </td>
                  <td style={{ textAlign: 'center', padding: 8 }}>
                    {memberBorrows.reduce((sum, b) => {
                      const price = typeof b.price === 'number' ? b.price : (b.book?.price || 0);
                      const quantity = typeof b.quantity === 'number' ? b.quantity : 1;
                      const fine = (b.fine || 0);
                      const total = price * quantity + fine;
                      const paid = (typeof b.paid === 'number' ? b.paid : (b.prepaid ?? 0));
                      return sum + Math.max(0, total - paid);
                    }, 0).toLocaleString()} VNĐ
                  </td>
                  <td colSpan={2}></td>
                </tr>
              </tfoot>
            </table>
            <button onClick={()=>setShowMemberModal(false)} style={{marginTop:16}}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Borrows; 