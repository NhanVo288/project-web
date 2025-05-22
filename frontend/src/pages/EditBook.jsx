import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';

const API_URL = 'http://localhost:5000/api/books';

const EditBook = () => {
  const { id } = useParams();
  const [form, setForm] = useState({
    code: '',
    title: '',
    authors: '',
    category: '',
    publisher: '',
    price: '',
    publishYear: '',
    description: ''
  });
  const [copiesInfo, setCopiesInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_URL}/${id}`).then(res => {
      setForm({
        code: res.data.code || res.data.bookCode || '',
        title: res.data.title || '',
        authors: Array.isArray(res.data.authors) ? res.data.authors.join(', ') : '',
        category: res.data.category || '',
        publisher: res.data.publisher || '',
        price: res.data.price || '',
        publishYear: res.data.publishYear || '',
        description: res.data.description || '',
      });
      setLoading(false);
    });
    axios.get(`${API_URL}/${id}/copies`).then(res => setCopiesInfo(res.data));
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      code: form.code,
      title: form.title,
      authors: form.authors.split(',').map(a => a.trim()).filter(Boolean),
      category: form.category,
      publisher: form.publisher,
      price: parseFloat(form.price),
      publishYear: parseInt(form.publishYear),
      description: form.description,
    };
    await axios.put(`${API_URL}/${id}`, data);
    setLoading(false);
    navigate('/');
  };

  const handleAddCopy = async () => {
    await axios.post(`${API_URL}/${id}/copies`);
    const res = await axios.get(`${API_URL}/${id}/copies`);
    setCopiesInfo(res.data);
  };

  const handleDeleteCopy = async (copyId) => {
    await axios.delete(`${API_URL}/copies/${copyId}`);
    const res = await axios.get(`${API_URL}/${id}/copies`);
    setCopiesInfo(res.data);
  };

  // Generate years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(currentYear - 1899), (val, index) => currentYear - index);
  const yearOptions = years.map(year => ({ value: year, label: year.toString() }));

  return (
    <div className='p-4'>
      <BackButton />
      <h1 className='text-3xl my-4'>Edit Book</h1>
      <form onSubmit={handleSubmit} className='border-2 border-sky-400 rounded-xl w-[600px] p-4 mx-auto flex flex-col gap-4'>
        <div className='my-2'>
          <label className='text-xl mr-4 text-gray-500'>Mã sách</label>
          <input name='code' value={form.code} readOnly className='border-2 border-gray-500 px-4 py-2 w-full opacity-60 bg-gray-100 cursor-not-allowed' />
        </div>
        <div className='my-2'>
          <label className='text-xl mr-4 text-gray-500'>Tên sách</label>
          <input name='title' value={form.title} onChange={handleChange} required className='border-2 border-gray-500 px-4 py-2 w-full' />
        </div>
        <div className='my-2'>
          <label className='text-xl mr-4 text-gray-500'>Tác giả (cách nhau dấu phẩy)</label>
          <input name='authors' value={form.authors} onChange={handleChange} required className='border-2 border-gray-500 px-4 py-2 w-full' placeholder='Nguyễn Văn A, Trần B' />
        </div>
        <div className='my-2'>
          <label className='text-xl mr-4 text-gray-500'>Thể loại</label>
          <select name='category' value={form.category} onChange={handleChange} required className='border-2 border-gray-500 px-4 py-2 w-full'>
            <option value=''>Chọn thể loại...</option>
            <option value='A'>A</option>
            <option value='B'>B</option>
            <option value='C'>C</option>
          </select>
        </div>
        <div className='my-2'>
          <label className='text-xl mr-4 text-gray-500'>Nhà xuất bản</label>
          <input name='publisher' value={form.publisher} onChange={handleChange} required className='border-2 border-gray-500 px-4 py-2 w-full' />
        </div>
        <div className='my-2'>
          <label className='text-xl mr-4 text-gray-500'>Năm xuất bản</label>
          <select name='publishYear' value={form.publishYear} onChange={handleChange} required className='border-2 border-gray-500 px-4 py-2 w-full'>
            <option value=''>Chọn năm...</option>
            {yearOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className='my-2'>
          <label className='text-xl mr-4 text-gray-500'>Trị giá (VNĐ)</label>
          <input name='price' value={form.price} onChange={handleChange} required type='number' min='0' className='border-2 border-gray-500 px-4 py-2 w-full' />
        </div>
        <div className='my-2'>
          <label className='text-xl mr-4 text-gray-500'>Mô tả</label>
          <textarea name='description' value={form.description} onChange={handleChange} className='border-2 border-gray-500 px-4 py-2 w-full min-h-[80px]' />
        </div>
        <div className='flex justify-center'>
          <button type='submit' className='p-2 bg-sky-300 hover:bg-sky-400 text-black font-semibold rounded w-40'>Lưu</button>
        </div>
      </form>
      {copiesInfo && (
        <div className='border-2 border-sky-400 rounded-xl w-[600px] p-4 mx-auto mt-8'>
          <div className='my-4'>
            <span className='text-xl mr-4 text-gray-500'>Total Copies:</span>
            <span>{copiesInfo.total}</span>
            <span className='text-xl ml-8 mr-4 text-gray-500'>Available:</span>
            <span>{copiesInfo.available}</span>
            <button onClick={handleAddCopy} className='ml-8 px-2 py-1 bg-green-300 rounded'>+ Add Copy</button>
          </div>
          <div className='mt-4'>
            <table className='w-full border border-slate-400 rounded-lg overflow-hidden'>
              <thead>
                <tr className='bg-sky-100'>
                  <th className='border border-slate-300 px-3 py-2 text-center'>Copy #</th>
                  <th className='border border-slate-300 px-3 py-2 text-center'>Barcode</th>
                  <th className='border border-slate-300 px-3 py-2 text-center'>Status</th>
                  <th className='border border-slate-300 px-3 py-2 text-center'>Delete</th>
                </tr>
              </thead>
              <tbody>
                {copiesInfo.copies.map(c => (
                  <tr key={c._id} className='hover:bg-sky-50 transition'>
                    <td className='border border-slate-200 px-3 py-2 text-center'>{c.copyNumber}</td>
                    <td className='border border-slate-200 px-3 py-2 text-center'>{c.barcode}</td>
                    <td className='border border-slate-200 px-3 py-2 text-center'>{c.status}</td>
                    <td className='border border-slate-200 px-3 py-2 text-center'>
                      <button
                        onClick={() => handleDeleteCopy(c._id)}
                        disabled={c.status === 'borrowed'}
                        className={`font-semibold ${c.status === 'borrowed' ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:underline'}`}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditBook;