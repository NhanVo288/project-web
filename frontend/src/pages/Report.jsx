import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/reports';

const Report = () => {
  const [borrowStats, setBorrowStats] = useState([]);
  const [lateStats, setLateStats] = useState([]);
  const [month, setMonth] = useState('');
  const [date, setDate] = useState('');

  const fetchBorrowStats = async () => {
    const res = await axios.get(`${API_URL}/borrow-stats${month ? `?month=${month}` : ''}`);
    setBorrowStats(res.data);
  };
  const fetchLateStats = async () => {
    const res = await axios.get(`${API_URL}/late-return-stats${date ? `?date=${date}` : ''}`);
    setLateStats(res.data);
  };

  useEffect(() => { fetchBorrowStats(); fetchLateStats(); }, []);

  // Tính tổng số lượt mượn
  const totalBorrowCount = borrowStats.reduce((sum, s) => sum + (s.borrowCount || 0), 0);
  // Tính tổng số sách trả trễ
  const totalLateCount = lateStats.length;

  // Hàm format ngày
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('vi-VN');
  };

  return (
    <div className='p-4'>
      {/* BM7.1 */}
      <div className='mb-12'>
        <div className='border w-full max-w-3xl mx-auto'>
          <div className='flex'>
            <div className='bg-black text-white font-bold px-4 py-2 border-r'>BM7.1</div>
            <div className='bg-black text-white font-bold flex-1 px-4 py-2'>Báo Cáo Thống Kê Tình Hình Mượn Sách Theo Thể Loại</div>
          </div>
          <div className='border-b px-4 py-2'>
            Tháng: <input value={month} onChange={e => setMonth(e.target.value)} placeholder='MM-YYYY' className='border px-2 mx-2' />
            <button onClick={fetchBorrowStats} className='bg-gray-400 px-2 py-1 rounded'>Lọc</button>
          </div>
          <table className='w-full border'>
            <thead>
              <tr className='bg-black text-white'>
                <th className='border px-2 py-1'>STT</th>
                <th className='border px-2 py-1'>Tên Thể Loại</th>
                <th className='border px-2 py-1'>Số Lượt Mượn</th>
                <th className='border px-2 py-1'>Tỉ Lệ</th>
              </tr>
            </thead>
            <tbody>
              {borrowStats.map((s, i) => (
                <tr key={i} className='border-t'>
                  <td className='border px-2 py-1 text-center'>{i + 1}</td>
                  <td className='border px-2 py-1'>{s.category}</td>
                  <td className='border px-2 py-1 text-center'>{s.borrowCount}</td>
                  <td className='border px-2 py-1 text-center'>{s.ratio}</td>
                </tr>
              ))}
              {borrowStats.length === 0 && (
                <tr><td colSpan={4} className='text-center py-2 text-gray-500'>Không có dữ liệu cho tháng này.</td></tr>
              )}
            </tbody>
          </table>
          <div className='px-4 py-2 text-right border-t'>Tổng số lượt mượn: <span className='font-semibold'>{totalBorrowCount}</span></div>
        </div>
      </div>
      {/* BM7.2 */}
      <div className='mb-12'>
        <div className='border w-full max-w-3xl mx-auto'>
          <div className='flex'>
            <div className='bg-black text-white font-bold px-4 py-2 border-r'>BM7.2</div>
            <div className='bg-black text-white font-bold flex-1 px-4 py-2'>Báo Cáo Thống Kê Sách Trả Trễ</div>
          </div>
          <div className='border-b px-4 py-2'>
            Ngày: <input value={date} onChange={e => setDate(e.target.value)} placeholder='YYYY-MM-DD' className='border px-2 mx-2' />
            <button onClick={fetchLateStats} className='bg-gray-400 px-2 py-1 rounded'>Lọc</button>
          </div>
          <table className='w-full border'>
            <thead>
              <tr className='bg-black text-white'>
                <th className='border px-2 py-1'>STT</th>
                <th className='border px-2 py-1'>Tên Sách</th>
                <th className='border px-2 py-1'>Ngày Mượn</th>
                <th className='border px-2 py-1'>Số Ngày Trả Trễ</th>
              </tr>
            </thead>
            <tbody>
              {lateStats.map((s, i) => (
                <tr key={i} className='border-t'>
                  <td className='border px-2 py-1 text-center'>{i + 1}</td>
                  <td className='border px-2 py-1'>{s.bookTitle}</td>
                  <td className='border px-2 py-1 text-center'>{formatDate(s.borrowDate)}</td>
                  <td className='border px-2 py-1 text-center text-red-600 font-bold'>{s.lateDays}</td>
                </tr>
              ))}
              {lateStats.length === 0 && (
                <tr><td colSpan={4} className='text-center py-2 text-gray-500'>Không có sách trả trễ cho ngày này.</td></tr>
              )}
            </tbody>
          </table>
          <div className='px-4 py-2 text-right border-t'>Tổng số sách trả trễ: <span className='font-semibold text-red-600'>{totalLateCount}</span></div>
        </div>
      </div>
    </div>
  );
};

export default Report; 