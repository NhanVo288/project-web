import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import CreateBook from './pages/CreateBooks';
import ShowBook from './pages/ShowBook';
import EditBook from './pages/EditBook';
import DeleteBook from './pages/DeleteBook';
import Members from './pages/Members';
import Borrows from './pages/Borrows';
import FineReceipts from './pages/FineReceipts';
import Report from './pages/Report';
import Rules from './pages/Rules';

const navItems = [
  { label: 'Books', path: '/' },
  { label: 'Members', path: '/members' },
  { label: 'Borrows', path: '/borrows' },
  { label: 'Penalty ticket', path: '/fine-receipts' },
  { label: 'Report', path: '/reports' },
  { label: 'Rules', path: '/rules' },
];

const App = () => {
  const location = useLocation();
  const isActive = (item) => {
    if (item.path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <>
      <nav style={{ padding: 16, background: '#e3f4fd', marginBottom: 24 }}>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={
              isActive(item)
                ? { marginRight: 16, fontWeight: 'bold', color: '#0369a1', borderBottom: '2px solid #0369a1', paddingBottom: 2 }
                : { marginRight: 16 }
            }
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/books/create' element={<CreateBook />} />
        <Route path='/books/details/:id' element={<ShowBook />} />
        <Route path='/books/edit/:id' element={<EditBook />} />
        <Route path='/books/delete/:id' element={<DeleteBook />} />
        <Route path='/members' element={<Members />} />
        <Route path='/borrows' element={<Borrows />} />
        <Route path='/fine-receipts' element={<FineReceipts />} />
        <Route path='/reports' element={<Report />} />
        <Route path='/rules' element={<Rules />} />
      </Routes>
    </>
  );
};

export default App;
