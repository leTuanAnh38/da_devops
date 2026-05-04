import React, { useState, useEffect } from 'react';
import { fetchBooks, createBook, createTransaction, checkHealth } from './api';
import './App.css';

function App() {
  const [books, setBooks] = useState([]);
  const [health, setHealth] = useState('Checking...');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTxModal, setShowTxModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [newBook, setNewBook] = useState({ title: '', author: '', category: '', location: '' });
  const [txData, setTxData] = useState({ type: 'IMPORT', quantity: 1 });

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const booksData = await fetchBooks();
      setBooks(booksData);
      const healthData = await checkHealth();
      setHealth(healthData.status);
    } catch (err) {
      setHealth('Down');
    }
  };

  const handleAddBook = async (e) => {
    e.preventDefault();
    await createBook(newBook);
    setShowAddModal(false);
    loadData();
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    try {
      await createTransaction({ bookId: selectedBook.id, ...txData });
      setShowTxModal(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="app-container">
      <header>
        <h1>📚 Kho Sách Thông Minh</h1>
        <div className="status">
          API Status: <span className={`alert-dot ${health === 'OK' ? 'green' : 'red'}`}></span> {health}
        </div>
      </header>

      <div className="dashboard-grid">
        <div className="card">
          <h2>Tổng Quan</h2>
          <p>Số lượng đầu sách: {books.length}</p>
          <p>Tổng tồn kho: {books.reduce((acc, b) => acc + b.stock, 0)}</p>
          <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Thêm Sách Mới</button>
        </div>

        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h2>Danh Sách Kho</h2>
          <div className="book-list">
            {books.map(book => (
              <div key={book.id} className="book-item">
                <div>
                  <strong>{book.title}</strong>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{book.author} | {book.location}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span className={book.stock < 5 ? 'low-stock' : ''}>
                    {book.stock} cuốn
                  </span>
                  <button className="btn" onClick={() => { setSelectedBook(book); setShowTxModal(true); }}>Nhập/Xuất</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Thêm Sách Mới</h3>
            <form onSubmit={handleAddBook}>
              <div className="form-group">
                <label>Tên sách</label>
                <input required onChange={e => setNewBook({...newBook, title: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Tác giả</label>
                <input onChange={e => setNewBook({...newBook, author: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Vị trí kệ</label>
                <input onChange={e => setNewBook({...newBook, location: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Lưu</button>
                <button type="button" className="btn" onClick={() => setShowAddModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTxModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nhập / Xuất Kho</h3>
            <p>Sách: {selectedBook.title}</p>
            <form onSubmit={handleTransaction}>
              <div className="form-group">
                <label>Loại giao dịch</label>
                <select onChange={e => setTxData({...txData, type: e.target.value})}>
                  <option value="IMPORT">Nhập Kho</option>
                  <option value="EXPORT">Xuất Kho</option>
                </select>
              </div>
              <div className="form-group">
                <label>Số lượng</label>
                <input type="number" min="1" required value={txData.quantity} onChange={e => setTxData({...txData, quantity: parseInt(e.target.value)})} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" className="btn btn-primary">Xác nhận</button>
                <button type="button" className="btn" onClick={() => setShowTxModal(false)}>Hủy</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
