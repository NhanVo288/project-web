import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Spinner from '../components/Spinner';
import { Link } from 'react-router-dom';
import { AiOutlineEdit } from 'react-icons/ai';
import { BsInfoCircle } from 'react-icons/bs';
import { MdOutlineAddBox, MdOutlineDelete } from 'react-icons/md';
import { BiSearch } from 'react-icons/bi';
import BooksTable from '../components/home/BooksTable';
import BooksCard from '../components/home/BooksCard';

const API_URL = 'http://localhost:5000/api/books';

const Home = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [copiesInfo, setCopiesInfo] = useState({});
  const [showCopies, setShowCopies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showType, setShowType] = useState('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');

  const genres = ['A', 'B', 'C']; // Add your genres here

  const fetchBooks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setBooks(res.data);
      setFilteredBooks(res.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
    setLoading(false);
  };

  const fetchCopiesInfo = async (bookId) => {
    const res = await axios.get(`${API_URL}/${bookId}/copies`);
    setCopiesInfo((prev) => ({ ...prev, [bookId]: res.data }));
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  useEffect(() => {
    books.forEach((b) => fetchCopiesInfo(b._id));
    // eslint-disable-next-line
  }, [books]);

  const handleSearch = async (value) => {
    setSearchTerm(value);
    filterBooks(value, selectedGenre);
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre);
    filterBooks(searchTerm, genre);
  };

  const filterBooks = (search, genre) => {
    let filtered = [...books];
    
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(book => 
        book.title.toLowerCase().includes(searchLower) ||
        (Array.isArray(book.authors) && book.authors.some(author => 
          author.toLowerCase().includes(searchLower)
        ))
      );
    }

    if (genre) {
      filtered = filtered.filter(book => book.category === genre);
    }

    setFilteredBooks(filtered);
  };

  const handleAddCopy = async (bookId) => {
    await axios.post(`${API_URL}/${bookId}/copies`);
    fetchCopiesInfo(bookId);
  };

  const handleDeleteCopy = async (copyId, bookId) => {
    await axios.delete(`${API_URL}/copies/${copyId}`);
    fetchCopiesInfo(bookId);
  };

  return (
    <div className='p-4'>
      <div className='flex justify-center items-center gap-x-4'>
        <button
          className={`px-4 py-1 rounded-lg transition font-semibold ${showType === 'table' ? 'bg-sky-600 text-white' : 'bg-sky-300 hover:bg-sky-600'}`}
          onClick={() => setShowType('table')}
        >
          Table
        </button>
        <button
          className={`px-4 py-1 rounded-lg transition font-semibold ${showType === 'card' ? 'bg-sky-600 text-white' : 'bg-sky-300 hover:bg-sky-600'}`}
          onClick={() => setShowType('card')}
        >
          Card
        </button>
      </div>
      <div className='flex justify-between items-center'>
        <h1 className='text-3xl my-8'>Books List</h1>
        <Link to='/books/create'>
          <MdOutlineAddBox className='text-sky-800 text-4xl' />
        </Link>
      </div>

      <div className='flex flex-col md:flex-row gap-4 mb-8'>
        <div className='flex-1 relative'>
          <input
            type='text'
            placeholder='Tìm kiếm theo tên sách hoặc tác giả...'
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className='w-full px-4 py-2 border border-gray-300 rounded-lg pr-10'
          />
          <BiSearch className='absolute right-3 top-3 text-gray-400 text-xl' />
        </div>
        <select
          value={selectedGenre}
          onChange={(e) => handleGenreChange(e.target.value)}
          className='px-4 py-2 border border-gray-300 rounded-lg min-w-[150px]'
        >
          <option value=''>Tất cả thể loại</option>
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : showType === 'table' ? (
        <BooksTable books={filteredBooks} copiesInfo={copiesInfo} showCopies={showCopies} handleAddCopy={handleAddCopy} handleDeleteCopy={handleDeleteCopy} />
      ) : (
        <BooksCard books={filteredBooks} />
      )}
    </div>
  );
};

export default Home;
