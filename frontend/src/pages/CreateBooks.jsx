import React, { useState, useEffect } from 'react';
import BackButton from '../components/BackButton';
import Spinner from '../components/Spinner';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import CreatableSelect from 'react-select/creatable';

const API_URL = 'http://localhost:5000/api/books';

const inputStyle = {
  padding: '8px',
  marginRight: '8px',
  border: '1px solid #b3b3b3',
  borderRadius: '4px',
  minWidth: '120px',
};
const buttonStyle = {
  padding: '8px 16px',
  border: 'none',
  borderRadius: '4px',
  background: '#4fc3f7',
  color: '#222',
  cursor: 'pointer',
};

const CreateBooks = () => {
  const [form, setForm] = useState({
    code: '',
    title: '',
    authors: '',
    category: '',
    publisher: '',
    publishYear: '',
    price: '',
    quantity: 1,
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [tagOptions, setTagOptions] = useState([]);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Generate years for dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from(new Array(currentYear - 1899), (val, index) => currentYear - index);
  const yearOptions = years.map(year => ({ value: year, label: year.toString() }));

  useEffect(() => {
    axios.get(`${API_URL}/tags`)
      .then(res => {
        const options = res.data.map(tag => ({ value: tag, label: tag }));
        setTagOptions(options);
      })
      .catch(error => {
        console.error('Error fetching tags:', error);
      });
  }, []);

  useEffect(() => {
    const generateBookCode = async () => {
      if (!form.category || !form.publishYear) return;
      try {
        const res = await axios.get(`${API_URL}?category=${form.category}&publishYear=${form.publishYear}`);
        const books = Array.isArray(res.data.data) ? res.data.data : res.data;
        let maxOrder = 0;
        books.forEach(b => {
          const match = b.bookCode && b.bookCode.match(/^[A-Z]\d{4}-(\d{5})$/);
          if (match) {
            const order = parseInt(match[1]);
            if (order > maxOrder) maxOrder = order;
          }
        });
        const nextOrder = (maxOrder + 1).toString().padStart(5, '0');
        setForm(f => ({ ...f, code: `${form.category}${form.publishYear}-${nextOrder}` }));
      } catch {}
    };
    generateBookCode();
    // eslint-disable-next-line
  }, [form.category, form.publishYear]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTagsChange = (selected) => {
    setForm({ ...form, tags: selected ? selected.map(tag => tag.value) : [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const data = {
      bookCode: form.code,
      title: form.title,
      authors: form.authors.split(',').map(a => a.trim()).filter(Boolean),
      category: form.category,
      publisher: form.publisher,
      publishYear: parseInt(form.publishYear),
      price: parseFloat(form.price),
      quantity: parseInt(form.quantity),
      description: form.description,
    };
    try {
      await axios.post(API_URL, data);
      enqueueSnackbar('Book Created successfully', { variant: 'success' });
      navigate('/');
    } catch (e) {
      const msg = e.response?.data?.message || 'Error';
      enqueueSnackbar(msg, { variant: 'error' });
      console.log(e);
    }
    setLoading(false);
  };

  return (
    <div className='p-4'>
      <BackButton />
      <h1 className='text-3xl my-4'>Create Book</h1>
      {loading ? <Spinner /> : ''}
      <div className='flex flex-col border-2 border-sky-400 rounded-xl w-[600px] p-4 mx-auto'>
        <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
          <div className='my-2'>
            <label className='text-xl mr-4 text-gray-500'>Mã sách</label>
            <input
              type="text"
              name="code"
              placeholder="Mã sách (bookCode)"
              value={form.code}
              readOnly
              className="input bg-gray-100"
            />
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
            <label className='text-xl mr-4 text-gray-500'>Số lượng bản</label>
            <input name='quantity' value={form.quantity} onChange={handleChange} required type='number' min='1' className='border-2 border-gray-500 px-4 py-2 w-full' />
          </div>
          <div className='my-2'>
            <label className='text-xl mr-4 text-gray-500'>Mô tả</label>
            <textarea name='description' value={form.description} onChange={handleChange} className='border-2 border-gray-500 px-4 py-2 w-full min-h-[80px]' />
          </div>
          <button type='submit' className='p-2 bg-sky-300 hover:bg-sky-400 text-black font-semibold rounded'>Lưu</button>
        </form>
      </div>
    </div>
  );
};

export default CreateBooks;