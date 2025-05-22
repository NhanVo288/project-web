import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/fine-receipts';

const FineReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [memberId, setMemberId] = useState('');
  const [form, setForm] = useState({ memberId: '', totalDebt: '', amountPaid: '', remainingDebt: '' });

  const fetchReceipts = async () => {
    const res = await axios.get(API_URL);
    setReceipts(res.data);
  };

  const fetchByMember = async () => {
    if (!memberId) return;
    const res = await axios.get(`${API_URL}/member/${memberId}`);
    setReceipts(res.data);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await axios.post(API_URL, form);
    setForm({ memberId: '', totalDebt: '', amountPaid: '', remainingDebt: '' });
    fetchReceipts();
  };

  useEffect(() => { fetchReceipts(); }, []);

  return (
    <div className='p-4'>
      <h1 className='text-2xl mb-4'>Penalty tickett</h1>
      <form onSubmit={handleSubmit} className='mb-4 flex gap-2'>
        <input name='memberId' value={form.memberId} onChange={handleChange} placeholder='Mã độc giả' required className='border px-2'/>
        <input name='totalDebt' value={form.totalDebt} onChange={handleChange} placeholder='Tổng nợ' required className='border px-2'/>
        <input name='amountPaid' value={form.amountPaid} onChange={handleChange} placeholder='Số tiền thu' required className='border px-2'/>
        <input name='remainingDebt' value={form.remainingDebt} onChange={handleChange} placeholder='Còn lại' required className='border px-2'/>
        <button type='submit' className='bg-blue-500 text-white px-3 py-1 rounded'>Tạo phiếu</button>
      </form>
      <div className='mb-4'>
        <input value={memberId} onChange={e => setMemberId(e.target.value)} placeholder='Tìm theo mã độc giả' className='border px-2'/>
        <button onClick={fetchByMember} className='ml-2 bg-gray-400 px-2 py-1 rounded'>Tìm</button>
        <button onClick={fetchReceipts} className='ml-2 bg-gray-200 px-2 py-1 rounded'>Tất cả</button>
      </div>
      <table className='w-full border'>
        <thead>
          <tr className='bg-gray-200'>
            <th>Mã phiếu</th>
            <th>Mã độc giả</th>
            <th>Tổng nợ</th>
            <th>Số tiền thu</th>
            <th>Còn lại</th>
            <th>Ngày lập</th>
          </tr>
        </thead>
        <tbody>
          {receipts.map(r => (
            <tr key={r._id} className='border-t'>
              <td>{r._id}</td>
              <td>{r.memberId?._id || r.memberId}</td>
              <td>{r.totalDebt}</td>
              <td>{r.amountPaid}</td>
              <td>{r.remainingDebt}</td>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FineReceipts; 