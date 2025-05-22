const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} Library Management System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 