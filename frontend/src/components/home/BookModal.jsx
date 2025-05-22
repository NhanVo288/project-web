import { AiOutlineClose } from 'react-icons/ai';
import { PiBookOpenTextLight } from 'react-icons/pi';
import { BiUserCircle } from 'react-icons/bi';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Spinner from '../Spinner';

const API_URL = 'http://localhost:5000/api/books';

const BookModal = ({ book, onClose }) => {
  const [copiesInfo, setCopiesInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCopies = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/${book._id}/copies`);
        setCopiesInfo(res.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching copies:', error);
        setLoading(false);
      }
    };
    fetchCopies();
  }, [book._id]);

  return (
    <div
      className='fixed bg-black bg-opacity-60 top-0 left-0 right-0 bottom-0 z-50 flex justify-center items-center'
      onClick={onClose}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        className='w-[600px] max-w-full min-h-[400px] bg-white rounded-xl p-4 flex flex-col relative'
      >
        <AiOutlineClose
          className='absolute right-6 top-6 text-3xl text-red-600 cursor-pointer'
          onClick={onClose}
        />
        <h2 className='w-fit px-4 py-1 bg-red-300 rounded-lg'>
          {book.publishYear}
        </h2>
        <h4 className='my-2 text-gray-500'>{book._id}</h4>
        <div className='flex justify-start items-center gap-x-2'>
          <span className='text-gray-500'>Mã sách:</span>
          <span>{book.code}</span>
        </div>
        <div className='flex justify-start items-center gap-x-2'>
          <PiBookOpenTextLight className='text-red-300 text-2xl' />
          <h2 className='my-1'>{book.title}</h2>
        </div>
        <div className='flex justify-start items-center gap-x-2'>
          <BiUserCircle className='text-red-300 text-2xl' />
          <h2 className='my-1'>{Array.isArray(book.authors) ? book.authors.join(', ') : ''}</h2>
        </div>
        <div className='flex justify-start items-center gap-x-2'>
          <span className='text-gray-500'>Thể loại:</span>
          <span>{book.category}</span>
        </div>
        <div className='flex justify-start items-center gap-x-2'>
          <span className='text-gray-500'>Nhà xuất bản:</span>
          <span>{book.publisher}</span>
        </div>
        <div className='flex justify-start items-center gap-x-2'>
          <span className='text-gray-500'>Trị giá:</span>
          <span>{book.price}</span>
        </div>
        <div className='flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-1 mt-4'>
          {loading ? (
            <Spinner />
          ) : copiesInfo ? (
            <>
              <span>Số lượng: <b>{copiesInfo.total}</b></span>
              <span>Còn lại: <b>{copiesInfo.available}</b></span>
            </>
          ) : (
            <>
              <span>Số lượng: <b>{book.quantity ?? '-'}</b></span>
              <span>Còn lại: <b>{book.availableQuantity ?? '-'}</b></span>
            </>
          )}
        </div>
        <div className='mt-4'>
          <label className='block mb-2 font-semibold'>Description:</label>
          <p className='whitespace-pre-line'>{book.description || 'Chưa có mô tả.'}</p>
        </div>
      </div>
    </div>
  );
};

export default BookModal;
