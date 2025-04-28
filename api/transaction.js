import axios from 'axios';

const API_URL = 'https://khatasystem.martendigitals.com/api/v1/transactions';
const EDIT_URL = "https://khatasystem.martendigitals.com/api/v1/edit";
// const LOCAL_URL = 'http://localhost:3002/api/v1/transactions';
// const LOCAL_URL1 = 'http://localhost:3002/api/v1/edit';

export const addTransaction = async (transactionData, token) => {
  const response = await axios.post(`${API_URL}/add`, transactionData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const fetchTransactions = async (token) => {
  const response = await axios.get(`${API_URL}`, {
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
  const response = await axios.get(`https://khatasystem.martendigitals.com/api/v1/profit`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};