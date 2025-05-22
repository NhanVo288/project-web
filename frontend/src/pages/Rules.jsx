import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/rules';

const Rules = () => {
  const [rule, setRule] = useState(null);
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState({});
  const [error, setError] = useState('');

  const fetchRule = async () => {
    const res = await axios.get(API_URL);
    let data = Array.isArray(res.data) ? res.data[0] : res.data;
    if (!data) {
      setRule(null);
      setForm({});
      return;
    }
    if (data.type === 'array' && Array.isArray(data.value)) {
      setRule(data.value[0]);
      setForm(data.value[0]);
    } else if (data.value) {
      setRule(data.value);
      setForm(data.value);
    } else {
      setRule(data);
      setForm(data);
    }
  };

  useEffect(() => { fetchRule(); }, []);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === 'categories') {
      value = value.split(',').map(s => s.trim()).filter(Boolean);
    }
    setForm({ ...form, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.minAge || !form.maxAge || !form.cardDurationMonths) {
      setError('Vui lòng nhập đầy đủ các trường bắt buộc!');
      return;
    }
    try {
      await axios.put(API_URL, form);
      setEdit(false);
      fetchRule();
    } catch (err) {
      setError('Lưu thất bại!');
    }
  };

  if (rule === null) return <div className='text-center text-red-500 mt-10 text-xl'>Chưa có quy định hệ thống nào trong cơ sở dữ liệu!</div>;

  return (
    <div className='flex justify-center items-start min-h-[60vh]'>
      <div className='bg-white shadow-lg rounded-lg p-8 mt-8 w-full max-w-xl'>
        <h1 className='text-3xl font-bold mb-6 text-center'>Quy Định Hệ Thống</h1>
        {error && <div className='text-red-500 mb-2'>{error}</div>}
        {!edit ? (
          <div className='space-y-2 text-lg'>
            <div><b>Tuổi tối thiểu:</b> {rule.minAge}</div>
            <div><b>Tuổi tối đa:</b> {rule.maxAge}</div>
            <div><b>Hạn thẻ (tháng):</b> {rule.cardDurationMonths}</div>
            <div><b>Thể loại:</b> {Array.isArray(rule.categories) ? rule.categories.join(', ') : rule.categories}</div>
            <div><b>Tối đa tác giả:</b> {rule.maxAuthors}</div>
            <div><b>Khoảng cách năm xuất bản:</b> {rule.maxPublishYearGap}</div>
            <div><b>Số sách mượn tối đa:</b> {rule.maxBooksPerBorrow}</div>
            <div><b>Số ngày mượn tối đa:</b> {rule.maxBorrowDays}</div>
            <div><b>Tiền phạt/ngày:</b> {rule.finePerDay}</div>
            <button className='mt-6 bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded font-semibold w-full' onClick={() => setEdit(true)}>Chỉnh sửa</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className='flex flex-col gap-3'>
            <input name='minAge' value={form.minAge || ''} onChange={handleChange} placeholder='Tuổi tối thiểu' className='border px-3 py-2 rounded' type='number' min={0}/>
            <input name='maxAge' value={form.maxAge || ''} onChange={handleChange} placeholder='Tuổi tối đa' className='border px-3 py-2 rounded' type='number' min={0}/>
            <input name='cardDurationMonths' value={form.cardDurationMonths || ''} onChange={handleChange} placeholder='Hạn thẻ (tháng)' className='border px-3 py-2 rounded' type='number' min={1}/>
            <input name='categories' value={Array.isArray(form.categories) ? form.categories.join(', ') : (form.categories || '')} onChange={handleChange} placeholder='Thể loại (A,B,C)' className='border px-3 py-2 rounded'/>
            <input name='maxAuthors' value={form.maxAuthors || ''} onChange={handleChange} placeholder='Tối đa tác giả' className='border px-3 py-2 rounded' type='number' min={1}/>
            <input name='maxPublishYearGap' value={form.maxPublishYearGap || ''} onChange={handleChange} placeholder='Khoảng cách năm xuất bản' className='border px-3 py-2 rounded' type='number' min={0}/>
            <input name='maxBooksPerBorrow' value={form.maxBooksPerBorrow || ''} onChange={handleChange} placeholder='Số sách mượn tối đa' className='border px-3 py-2 rounded' type='number' min={1}/>
            <input name='maxBorrowDays' value={form.maxBorrowDays || ''} onChange={handleChange} placeholder='Số ngày mượn tối đa' className='border px-3 py-2 rounded' type='number' min={1}/>
            <input name='finePerDay' value={form.finePerDay || ''} onChange={handleChange} placeholder='Tiền phạt/ngày' className='border px-3 py-2 rounded' type='number' min={0}/>
            <div className='flex gap-2 mt-2'>
              <button type='submit' className='bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded font-semibold flex-1'>Lưu</button>
              <button type='button' className='bg-gray-400 hover:bg-gray-500 text-white px-5 py-2 rounded font-semibold flex-1' onClick={() => setEdit(false)}>Hủy</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Rules; 