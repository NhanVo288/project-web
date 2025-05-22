import { Link, useLocation } from 'react-router-dom';
import React from 'react';
const navItems = [
  { label: 'Books', path: '/' },
  { label: 'Members', path: '/members' },
  { label: 'Borrows', path: '/borrows' },
  { label: 'Phiếu phạt', path: '/fines' },
  { label: 'Báo cáo', path: '/reports' },
  { label: 'Quy định', path: '/rules' },
];

export default function Navbar() {
  const location = useLocation();

  const isActive = (item) => {
    if (item.path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="bg-blue-100 px-4 py-3 rounded-t-lg">
      <nav className="flex gap-6">
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={
              isActive(item)
                ? { fontWeight: 'bold', color: '#0369a1', borderBottom: '2px solid #0369a1', paddingBottom: 2 }
                : {}
            }
            className="hover:underline transition px-1 pb-1"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
} 
