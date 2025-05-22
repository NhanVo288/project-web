import axios from 'axios';

const API_URL = 'http://localhost:5000/api/borrows';

export const getAllBorrows = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getBorrowById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createBorrow = async (borrowData) => {
  const response = await axios.post(API_URL, borrowData);
  return response.data;
};

export const returnBook = async (id) => {
  const response = await axios.put(`${API_URL}/${id}/return`);
  return response.data;
};

export const getMemberBorrows = async (memberId) => {
  const response = await axios.get(`${API_URL}/member/${memberId}`);
  return response.data;
};

export const getBookBorrows = async (bookId) => {
  const response = await axios.get(`${API_URL}/book/${bookId}`);
  return response.data;
};

export const getOverdueBorrows = async () => {
  const response = await axios.get(`${API_URL}/overdue`);
  return response.data;
}; 