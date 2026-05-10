// import React, { useState, useEffect } from 'react';
// import { fetchBooks, createBook, createTransaction, checkHealth, fetchHistory } from './api';
// import './App.css';

// function App() {
//   const [books, setBooks] = useState([]);
//   const [health, setHealth] = useState('Checking...');
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showTxModal, setShowTxModal] = useState(false);
//   const [showHistoryModal, setShowHistoryModal] = useState(false);
//   const [selectedBook, setSelectedBook] = useState(null);
//   const [history, setHistory] = useState([]);
//   const [newBook, setNewBook] = useState({ title: '', author: '', category: '', location: '' });
//   const [txData, setTxData] = useState({ type: 'IMPORT', quantity: 1 });

//   useEffect(() => {
//     loadData();
//     const interval = setInterval(loadData, 5000);
//     return () => clearInterval(interval);
//   }, []);

//   const loadData = async () => {
//     try {
//       const booksData = await fetchBooks();
//       setBooks(booksData);
//       const healthData = await checkHealth();
//       setHealth(healthData.status);
//     } catch (err) {
//       setHealth('Down');
//     }
//   };

//   const handleAddBook = async (e) => {
//     e.preventDefault();
//     await createBook(newBook);
//     setShowAddModal(false);
//     loadData();
//   };

//   const handleTransaction = async (e) => {
//     e.preventDefault();
//     try {
//       await createTransaction({ bookId: selectedBook.id, ...txData });
//       setShowTxModal(false);
//       loadData();
//     } catch (err) {
//       alert(err.message);
//     }
//   };

//   const openHistory = async (book) => {
//     setSelectedBook(book);
//     const data = await fetchHistory(book.id);
//     setHistory(data);
//     setShowHistoryModal(true);
//   };

//   return (
//     <div className="app-container">
//       <header>
//         <h1>📚 Kho Sách Thông Minh</h1>
//         <div className="status">
//           API Status: <span className={`alert-dot ${health === 'OK' ? 'green' : 'red'}`}></span> {health}
//         </div>
//       </header>

//       <div className="dashboard-grid">
//         <div className="card">
//           <h2>Tổng Quan</h2>
//           <p>Số lượng đầu sách: {books.length}</p>
//           <p>Tổng tồn kho: {books.reduce((acc, b) => acc + b.stock, 0)}</p>
//           <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>+ Thêm Sách Mới</button>
//         </div>

//         <div className="card" style={{ gridColumn: 'span 2' }}>
//           <h2>Danh Sách Kho</h2>
//           <div className="book-list">
//             {books.map(book => (
//               <div key={book.id} className="book-item">
//                 <div>
//                   <strong>{book.title}</strong>
//                   <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{book.author} | {book.location}</div>
//                 </div>
//                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
//                   <span className={book.stock < 5 ? 'low-stock' : ''} style={{ marginRight: '10px' }}>
//                     {book.stock} cuốn
//                   </span>
//                   <button className="btn btn-primary" onClick={() => { setSelectedBook(book); setShowTxModal(true); }}>Nhập/Xuất</button>
//                   <button className="btn" onClick={() => openHistory(book)}>Lịch sử</button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {showAddModal && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <h3>Thêm Sách Mới</h3>
//             <form onSubmit={handleAddBook}>
//               <div className="form-group">
//                 <label>Tên sách</label>
//                 <input required onChange={e => setNewBook({...newBook, title: e.target.value})} />
//               </div>
//               <div className="form-group">
//                 <label>Tác giả</label>
//                 <input onChange={e => setNewBook({...newBook, author: e.target.value})} />
//               </div>
//               <div className="form-group">
//                 <label>Vị trí kệ</label>
//                 <input onChange={e => setNewBook({...newBook, location: e.target.value})} />
//               </div>
//               <div style={{ display: 'flex', gap: '1rem' }}>
//                 <button type="submit" className="btn btn-primary">Lưu</button>
//                 <button type="button" className="btn" onClick={() => setShowAddModal(false)}>Hủy</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showTxModal && (
//         <div className="modal-overlay">
//           <div className="modal-content">
//             <h3>Nhập / Xuất Kho</h3>
//             <p>Sách: {selectedBook.title}</p>
//             <form onSubmit={handleTransaction}>
//               <div className="form-group">
//                 <label>Loại giao dịch</label>
//                 <select onChange={e => setTxData({...txData, type: e.target.value})}>
//                   <option value="IMPORT">Nhập Kho</option>
//                   <option value="EXPORT">Xuất Kho</option>
//                 </select>
//               </div>
//               <div className="form-group">
//                 <label>Số lượng</label>
//                 <input type="number" min="1" required value={txData.quantity} onChange={e => setTxData({...txData, quantity: parseInt(e.target.value)})} />
//               </div>
//               <div style={{ display: 'flex', gap: '1rem' }}>
//                 <button type="submit" className="btn btn-primary">Xác nhận</button>
//                 <button type="button" className="btn" onClick={() => setShowTxModal(false)}>Hủy</button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}

//       {showHistoryModal && (
//         <div className="modal-overlay">
//           <div className="modal-content" style={{ width: '600px' }}>
//             <h3>Thẻ Kho: {selectedBook.title}</h3>
//             <div style={{ maxHeight: '300px', overflowY: 'auto', marginBottom: '1rem' }}>
//               <table style={{ width: '100%', borderCollapse: 'collapse' }}>
//                 <thead>
//                   <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left' }}>
//                     <th style={{ padding: '10px' }}>Thời gian</th>
//                     <th style={{ padding: '10px' }}>Loại</th>
//                     <th style={{ padding: '10px' }}>Biến động</th>
//                     <th style={{ padding: '10px' }}>Tồn cuối</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {history.map((h, i) => (
//                     <tr key={i} style={{ borderBottom: '1px solid #1e293b' }}>
//                       <td style={{ padding: '10px', fontSize: '0.8rem' }}>{new Date(h.createdAt).toLocaleString()}</td>
//                       <td style={{ padding: '10px' }}>{h.Transaction?.type}</td>
//                       <td style={{ padding: '10px', color: h.change > 0 ? '#10b981' : '#ef4444' }}>
//                         {h.change > 0 ? `+${h.change}` : h.change}
//                       </td>
//                       <td style={{ padding: '10px' }}>{h.currentStock}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <button className="btn btn-primary" onClick={() => setShowHistoryModal(false)}>Đóng</button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;
import React from 'react';
import Sidebar from './components/Sidebar';
import BookInventory from './pages/BookInventory';

function App() {
  return (
    <div style={{ display: 'flex' }}>
      {/* Cột bên trái: Sidebar cố định */}
      <Sidebar />
      
      {/* Cột bên phải: Nội dung trang */}
      <div style={{ flex: 1, marginLeft: '240px' }}> 
        <BookInventory />
      </div>
    </div>
  );
}

export default App;