import { Link } from 'react-router-dom';
import { PiBookOpenTextLight } from 'react-icons/pi';
import { BiUserCircle } from 'react-icons/bi';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineDelete } from 'react-icons/md';
import { useState } from 'react';
import BookModal from './BookModal';

const BookSingleCard = ({ book }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className='border-2 border-gray-400 rounded-lg px-6 py-4 m-4 relative hover:shadow-xl min-w-[320px] max-w-[350px] bg-white flex flex-col justify-between h-[340px]'>
      <div>
        <div className='absolute top-2 right-2 px-4 py-1 bg-red-300 rounded-lg font-semibold text-lg'>
          {book.publishYear}
        </div>
        <div className='mb-2 text-xs text-gray-500 break-all truncate'>Mã sách: {book.bookCode}</div>
        <div className='flex items-center gap-x-2 mb-1'>
          <PiBookOpenTextLight className='text-red-300 text-2xl' />
          <span className='font-bold text-lg truncate max-w-[200px]' title={book.title}>{book.title}</span>
        </div>
        <div className='flex items-center gap-x-2 mb-1'>
          <BiUserCircle className='text-red-300 text-2xl' />
          <span className='text-base truncate max-w-[200px]' title={Array.isArray(book.authors) ? book.authors.join(', ') : book.authors}>{Array.isArray(book.authors) ? book.authors.join(', ') : book.authors}</span>
        </div>
        <div className='flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-1'>
          <span>Thể loại: <b>{book.category}</b></span>
          <span>NXB: <b>{book.publisher}</b></span>
        </div>
        <div className='flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-1'>
          <span>Trị giá: <b>{book.price?.toLocaleString()} VNĐ</b></span>
          <span>Số lượng: <b>{book.quantity}</b></span>
          <span>Còn lại: <b>{book.availableQuantity}</b></span>
        </div>
        <div className='flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600 mb-2'>
          <span>Trạng thái: <b className={book.status === 'available' ? 'text-green-600' : 'text-red-600'}>{book.status === 'available' ? 'Còn' : 'Hết'}</b></span>
        </div>
        {book.description && (
          <div className='text-xs text-gray-500 mb-2 line-clamp-2' title={book.description}>Mô tả: {book.description}</div>
        )}
      </div>
      <div className='flex justify-between items-center gap-x-4 mt-4'>
        <span onClick={() => setShowModal(true)} className='cursor-pointer'>
          <BsInfoCircle className='text-2xl text-green-800 hover:text-black' />
        </span>
        <Link to={`/books/edit/${book._id}`}>
          <AiOutlineEdit className='text-2xl text-yellow-600 hover:text-black' />
        </Link>
        <Link to={`/books/delete/${book._id}`}>
          <MdOutlineDelete className='text-2xl text-red-600 hover:text-black' />
        </Link>
      </div>
      {showModal && (
        <BookModal book={book} onClose={() => setShowModal(false)} />
      )}
    </div>
  );
};

export default BookSingleCard;
