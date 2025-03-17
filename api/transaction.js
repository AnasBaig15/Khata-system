import axios from 'axios';

const API_URL = 'http://localhost:3002/transactions';
const EDIT_URL = "http://localhost:3002/edit";

export const addTransaction = async (transactionData, token) => {
  const response = await axios.post(`${API_URL}/add`, transactionData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchTransactions = async (userId, token) => {
  const response = await axios.get(`${API_URL}/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const updateTransaction = async (id, transactionData, token) => {
  const response = await axios.put(`${EDIT_URL}/${id}`, transactionData, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return {
    updatedTransaction: response.data.updatedTransaction,
    profit: response.data.profit,
  };
};

export const fetchProfit = async (userId, token) => {
  const response = await axios.get(`http://localhost:3002/profit/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};