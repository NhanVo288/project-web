import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineAddBox, MdOutlineDelete } from 'react-icons/md';
import BookModal from './BookModal';
import { useState } from 'react';

const BooksTable = ({ books }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const handleShowModal = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBook(null);
  };

  return (
    <>
      <table className='w-full border-separate border-spacing-2' style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th className='border border-slate-700 rounded-md text-center' style={{ width: '50px' }}>No</th>
            <th className='border border-slate-700 rounded-md text-center' style={{ width: '140px' }}>Mã sách</th>
            <th className='border border-slate-700 rounded-md text-center' style={{ width: '220px' }}>Title</th>
            <th className='border border-slate-700 rounded-md text-center max-md:hidden' style={{ width: '180px' }}>Author</th>
            <th className='border border-slate-700 rounded-md text-center max-md:hidden' style={{ width: '120px' }}>Publish Year</th>
            <th className='border border-slate-700 rounded-md text-center' style={{ width: '80px' }}>Genre</th>
            <th className='border border-slate-700 rounded-md text-center' style={{ width: '120px' }}>Operations</th>
          </tr>
        </thead>
        <tbody>
          {books.map((book, index) => (
            <tr key={book._id} className='h-8'>
              <td className='border border-slate-700 rounded-md text-center'>
                {index + 1}
              </td>
              <td className='border border-slate-700 rounded-md text-center'>
                {book.bookCode}
              </td>
              <td className='border border-slate-700 rounded-md text-center'>
                {book.title}
              </td>
              <td className='border border-slate-700 rounded-md text-center max-md:hidden'>
                {Array.isArray(book.authors) ? book.authors.join(', ') : ''}
              </td>
              <td className='border border-slate-700 rounded-md text-center max-md:hidden'>
                {book.publishYear}
              </td>
              <td className='border border-slate-700 rounded-md text-center'>
                {book.category || <span className='text-gray-400'>No genre</span>}
              </td>
              <td className='border border-slate-700 rounded-md text-center'>
                <div className='flex justify-center gap-x-4'>
                  <span onClick={() => handleShowModal(book)} className='cursor-pointer'>
                    <BsInfoCircle className='text-2xl text-green-800 hover:text-black' />
                  </span>
                  <Link to={`/books/edit/${book._id}`}>
                    <AiOutlineEdit className='text-2xl text-yellow-600' />
                  </Link>
                  <Link to={`/books/delete/${book._id}`}>
                    <MdOutlineDelete className='text-2xl text-red-600' />
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {showModal && selectedBook && (
        <BookModal book={selectedBook} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default BooksTable;
