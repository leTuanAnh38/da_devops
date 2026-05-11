import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    FiRotateCw, FiPlus, FiX, FiPackage, FiTruck, FiCornerUpLeft, FiAlertCircle, FiTrendingUp, FiTrendingDown, FiClock
} from 'react-icons/fi';
import './InventoryManager.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const InventoryManager = () => {
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'import', 'export'
    const [inventoryData, setInventoryData] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [allHistory, setAllHistory] = useState([]); // Lưu toàn bộ lịch sử để thống kê
    const [loading, setLoading] = useState(true);
    const [books, setBooks] = useState([]); // For selection in modals

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
        fetchBooks();
    }, [activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Tải song song cả danh sách sách và lịch sử để thống kê luôn đúng
            const [booksRes, historyRes] = await Promise.all([
                axios.get(`${API_URL}/books`),
                axios.get(`${API_URL}/inventory/history`)
            ]);

            setInventoryData(booksRes.data);
            setBooks(booksRes.data); // Cập nhật luôn danh sách cho Modal
            
            const fullHistory = historyRes.data;
            // Lưu lại lịch sử đầy đủ để stats useMemo tính toán chính xác
            setAllHistory(fullHistory); 

            // Cập nhật historyData hiển thị theo tab
            if (activeTab === 'import') {
                setHistoryData(fullHistory.filter(h => h.type === 'NHAP'));
            } else if (activeTab === 'export') {
                setHistoryData(fullHistory.filter(h => h.type === 'XUAT'));
            }
        } catch (err) {
            console.error("Lỗi fetch kho:", err);
        }
        setLoading(false);
    };

    const fetchBooks = async () => {
        try {
            const res = await axios.get(`${API_URL}/books`);
            setBooks(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const stats = useMemo(() => {
        const totalStock = inventoryData.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const lowStockCount = inventoryData.filter(item => item.quantity < 10).length;
        const totalImports = allHistory.filter(h => h.type === 'NHAP').length;
        const totalExports = allHistory.filter(h => h.type === 'XUAT').length;
        
        return { totalStock, lowStockCount, totalImports, totalExports };
    }, [inventoryData, allHistory]);

    const handleAdjustSubmit = async (e, type) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const adjustment = {
            bookId: formData.get('bookId'),
            type: type,
            quantity: parseInt(formData.get('quantity')),
            note: formData.get('note')
        };

        try {
            await axios.post(`${API_URL}/inventory/adjust`, adjustment);
            setActiveTab(type === 'NHAP' ? 'import' : 'export');
            fetchData();
            setIsImportModalOpen(false);
            setIsExportModalOpen(false);
        } catch (err) {
            alert('Lỗi: ' + (err.response?.data?.error || err.message));
        }
    };

    return (
        <div className="inventory-container">
            <header className="inventory-header">
                <div className="header-info">
                    <h1><FiPackage /> Quản lý kho hàng</h1>
                    <p>Giám sát tồn kho, nhập hàng và xuất hàng chi tiết</p>
                </div>
                <div className="header-actions">
                    <button className="btn-icon-square" onClick={fetchData} title="Làm mới">
                        <FiRotateCw />
                    </button>
                    <button className="btn-import-action" onClick={() => setIsImportModalOpen(true)}>
                        <FiPlus /> Tạo phiếu nhập
                    </button>
                    <button className="btn-export-action" onClick={() => setIsExportModalOpen(true)}>
                        <FiCornerUpLeft /> Tạo phiếu xuất
                    </button>
                </div>
            </header>

            <div className="inventory-stats">
                <div className="stat-card">
                    <div className="stat-icon blue"><FiPackage /></div>
                    <div className="stat-info">
                        <span className="stat-label">Tổng tồn kho</span>
                        <span className="stat-value">{stats.totalStock.toLocaleString()}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange"><FiAlertCircle /></div>
                    <div className="stat-info">
                        <span className="stat-label">Sách sắp hết</span>
                        <span className="stat-value">{stats.lowStockCount}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green"><FiTrendingUp /></div>
                    <div className="stat-info">
                        <span className="stat-label">Phiếu nhập kho</span>
                        <span className="stat-value">{stats.totalImports}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon red"><FiTrendingDown /></div>
                    <div className="stat-info">
                        <span className="stat-label">Phiếu xuất kho</span>
                        <span className="stat-value">{stats.totalExports}</span>
                    </div>
                </div>
            </div>

            <div className="inventory-tabs">
                <button className={activeTab === 'inventory' ? 'active' : ''} onClick={() => setActiveTab('inventory')}>
                    <FiPackage /> Tồn kho hiện tại
                </button>
                <button className={activeTab === 'import' ? 'active' : ''} onClick={() => setActiveTab('import')}>
                    <FiTruck /> Lịch sử nhập kho
                </button>
                <button className={activeTab === 'export' ? 'active' : ''} onClick={() => setActiveTab('export')}>
                    <FiCornerUpLeft /> Lịch sử xuất kho
                </button>
            </div>

            <main className="inventory-main">
                {loading ? (
                    <div className="loading-state">
                        <FiClock className="spin" /> Đang tải dữ liệu kho hàng...
                    </div>
                ) : activeTab === 'inventory' ? (
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Mã sách</th>
                                <th>Tên sản phẩm</th>
                                <th>Phân loại</th>
                                <th>Số lượng tồn</th>
                                <th>Đơn vị</th>
                                <th>Trạng thái</th>
                            </tr>
                        </thead>
                        <tbody>
                            {inventoryData.map(book => (
                                <tr key={book.id}>
                                    <td><span className="id-badge">{book.id}</span></td>
                                    <td className="txt-bold">{book.title}</td>
                                    <td>{book.Category?.name || book.categoryId}</td>
                                    <td className="txt-bold" style={{ fontSize: '16px' }}>{book.quantity}</td>
                                    <td>{book.unit}</td>
                                    <td>
                                        <span className={`badge ${book.quantity < 10 ? 'badge-danger' : 'badge-success'}`}>
                                            {book.quantity < 10 ? 'Cần nhập hàng' : 'Đủ tồn kho'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <table className="inventory-table">
                        <thead>
                            <tr>
                                <th>Ngày thực hiện</th>
                                <th>Sản phẩm</th>
                                <th>Số lượng</th>
                                <th>Hình thức</th>
                                <th>Ghi chú</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyData.map((h, i) => (
                                <tr key={i}>
                                    <td style={{ color: '#64748B' }}>{new Date(h.createdAt).toLocaleString('vi-VN')}</td>
                                    <td>
                                        <div className="product-cell">
                                            <span className="txt-bold">{h.Book?.title || 'Sách đã xóa'}</span>
                                            <span style={{ fontSize: '12px', display: 'block', color: '#94A3B8' }}>Mã: {h.bookId}</span>
                                        </div>
                                    </td>
                                    <td className={`txt-bold ${activeTab === 'import' ? 'txt-green' : 'txt-red'}`}>
                                        {activeTab === 'import' ? `+${h.change}` : h.change}
                                    </td>
                                    <td>
                                        <span className={`badge ${activeTab === 'import' ? 'badge-success' : 'badge-danger'}`}>
                                            {activeTab === 'import' ? 'Nhập kho' : 'Xuất kho'}
                                        </span>
                                    </td>
                                    <td style={{ color: '#475569', fontStyle: 'italic' }}>{h.note || '---'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </main>

            {/* MODAL NHẬP KHO */}
            {isImportModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-top">
                            <h2><FiPlus /> Tạo phiếu nhập kho</h2>
                            <button onClick={() => setIsImportModalOpen(false)}><FiX /></button>
                        </div>
                        <form onSubmit={(e) => handleAdjustSubmit(e, 'NHAP')} className="modal-form">
                            <div className="input-group">
                                <label>Sách nhập về</label>
                                <select name="bookId" required>
                                    <option value="">-- Chọn sách --</option>
                                    {books.map(b => (
                                        <option key={b.id} value={b.id}>{b.id} - {b.title}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Số lượng nhập thêm</label>
                                <input type="number" name="quantity" min="1" required placeholder="Nhập số lượng..." />
                            </div>
                            <div className="input-group">
                                <label>Lý do nhập / Ghi chú</label>
                                <textarea name="note" rows="3" placeholder="Ví dụ: Nhập hàng đợt tháng 5..."></textarea>
                            </div>
                            <div className="modal-btns">
                                <button type="button" className="btn-cancel" onClick={() => setIsImportModalOpen(false)}>Hủy bỏ</button>
                                <button type="submit" className="btn-save bg-green">Xác nhận nhập kho</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL XUẤT KHO */}
            {isExportModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-top">
                            <h2><FiCornerUpLeft /> Tạo phiếu xuất kho</h2>
                            <button onClick={() => setIsExportModalOpen(false)}><FiX /></button>
                        </div>
                        <form onSubmit={(e) => handleAdjustSubmit(e, 'XUAT')} className="modal-form">
                            <div className="input-group">
                                <label>Sách xuất đi</label>
                                <select name="bookId" required>
                                    <option value="">-- Chọn sách --</option>
                                    {books.map(b => (
                                        <option key={b.id} value={b.id}>{b.id} - {b.title} (Hiện có: {b.quantity})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Số lượng xuất</label>
                                <input type="number" name="quantity" min="1" required placeholder="Nhập số lượng..." />
                            </div>
                            <div className="input-group">
                                <label>Lý do xuất kho</label>
                                <textarea name="note" rows="3" placeholder="Ví dụ: Xuất hàng lỗi, Trả hàng nhà cung cấp..."></textarea>
                            </div>
                            <div className="modal-btns">
                                <button type="button" className="btn-cancel" onClick={() => setIsExportModalOpen(false)}>Hủy bỏ</button>
                                <button type="submit" className="btn-save bg-red">Xác nhận xuất kho</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManager;