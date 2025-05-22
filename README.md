# Book Store MERN Stack Application

A full-stack book store application built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- Book management system
- Modern and responsive UI using React and Tailwind CSS
- RESTful API backend
- MongoDB database integration
- Real-time notifications using notistack

## Tech Stack

### Frontend
- React.js
- Vite
- React Router DOM
- Axios
- Tailwind CSS
- React Icons
- Notistack

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- CORS

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Book-Store-MERN-Stack
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../frontend
npm install
```

## Configuration

1. Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5555
```

2. Create a `.env` file in the frontend directory with the following variables:
```
VITE_API_URL=http://localhost:5555
```

## Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5555

## Scripts

### Backend
- `npm run dev`: Start the development server with nodemon
- `npm start`: Start the production server

### Frontend
- `npm run dev`: Start the development server
- `npm run build`: Build for production
- `npm run preview`: Preview the production build
- `npm run lint`: Run ESLint

## Project Structure

```
Book-Store-MERN-Stack/
├── frontend/           # React frontend application
│   ├── src/           # Source files
│   ├── public/        # Static files
│   └── package.json   # Frontend dependencies
├── backend/           # Node.js backend application
│   ├── models/        # MongoDB models
│   ├── routes/        # API routes
│   └── package.json   # Backend dependencies
└── README.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.