import axios from 'axios';

const API_URL = 'http://localhost:5000/api/members';

export const getAllMembers = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getMemberById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const createMember = async (memberData) => {
  const response = await axios.post(API_URL, memberData);
  return response.data;
};

export const updateMember = async (id, memberData) => {
  const response = await axios.put(`${API_URL}/${id}`, memberData);
  return response.data;
};

export const deleteMember = async (id) => {
  const response = await axios.delete(`${API_URL}/${id}`);
  return response.data;
};

export const searchMembers = async (query) => {
  const response = await axios.get(`${API_URL}/search?q=${query}`);
  return response.data;
};

export const getMemberStats = async (id) => {
  const response = await axios.get(`${API_URL}/${id}/stats`);
  return response.data;
}; 