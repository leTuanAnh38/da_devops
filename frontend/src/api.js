const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchBooks = async () => {
  const res = await fetch(`${API_URL}/books`);
  return res.json();
};

export const createBook = async (bookData) => {
  const res = await fetch(`${API_URL}/books`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bookData),
  });
  return res.json();
};

export const createTransaction = async (transactionData) => {
  const res = await fetch(`${API_URL}/transactions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transactionData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }
  return res.json();
};

export const fetchHistory = async (bookId) => {
  const res = await fetch(`${API_URL}/books/${bookId}/history`);
  return res.json();
};

export const checkHealth = async () => {
  const res = await fetch(`${API_URL}/health`);
  return res.json();
};
