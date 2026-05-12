import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import {
    FiRotateCw, FiPlus, FiX, FiPackage, FiTruck, FiCornerUpLeft, FiAlertCircle, FiTrendingUp, FiTrendingDown, FiClock, FiFileText, FiUser, FiPrinter, FiPlusCircle, FiTrash2, FiSearch, FiPhone, FiMapPin, FiChevronLeft, FiChevronRight
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import './InventoryManager.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// --- SUB-COMPONENT TỐI ƯU HÓA NHẬP LIỆU ---
const ReceiptItemRow = React.memo(({ item, index, books, onUpdate, onRemove }) => {
    return (
        <tr>
            <td style={{ width: '40%' }}>
                <select 
                    value={item.bookId} 
                    onChange={(e) => onUpdate(index, 'bookId', e.target.value)}
                    required
                >
                    <option value="">-- Chọn sách --</option>
                    {Array.isArray(books) && books.map(b => (
                        <option key={b.id} value={b.id}>{b.title} (Giá: {(b.price || 0).toLocaleString()}đ)</option>
                    ))}
                </select>
            </td>
            <td>
                <input 
                    type="number" 
                    min="1" 
                    value={item.quantity}
                    onChange={(e) => onUpdate(index, 'quantity', parseInt(e.target.value) || 0)}
                />
            </td>
            <td>
                <input 
                    type="number" 
                    value={item.price}
                    onChange={(e) => onUpdate(index, 'price', parseInt(e.target.value) || 0)}
                />
            </td>
            <td className="txt-bold">{(item.quantity * (item.price || 0)).toLocaleString()}đ</td>
            <td>
                <button type="button" className="btn-remove-item" onClick={() => onRemove(index)}>
                    <FiTrash2 />
                </button>
            </td>
        </tr>
    );
});

const InventoryManager = () => {
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'import', 'export'
    const [inventoryData, setInventoryData] = useState([]);
    const [historyData, setHistoryData] = useState([]);
    const [allHistory, setAllHistory] = useState([]); // Lưu toàn bộ lịch sử để thống kê
    const [loading, setLoading] = useState(true);
    const [books, setBooks] = useState([]); // For selection in modals

    // PAGINATION FOR INVENTORY TAB
    const [invPage, setInvPage] = useState(1);
    const [invTotalPages, setInvTotalPages] = useState(1);
    const [invTotalItems, setInvTotalItems] = useState(0);

    // PROFESSIONAL RECEIPT SYSTEM STATES
    const [receipts, setReceipts] = useState([]);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [receiptType, setReceiptType] = useState('NHAP'); // 'NHAP' hoặc 'XUAT'
    const [receiptItems, setReceiptItems] = useState([{ bookId: '', quantity: 1, price: 0 }]);
    const [selectedReceipt, setSelectedReceipt] = useState(null); // Để xem chi tiết/in
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    // PAGINATION STATES
    const [receiptPage, setReceiptPage] = useState(1);
    const [receiptTotalPages, setReceiptTotalPages] = useState(1);
    const [receiptTotalItems, setReceiptTotalItems] = useState(0);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
        fetchBooks();
    }, [activeTab, receiptPage, invPage]);


    const fetchData = async () => {
        setLoading(true);
        try {
            // 1. Tải Tồn kho có phân trang (cho tab inventory)
            const booksRes = await axios.get(`${API_URL}/books`, {
                params: { page: invPage, limit: itemsPerPage }
            });
            setInventoryData(booksRes.data.books || []);
            setInvTotalPages(booksRes.data.totalPages || 1);
            setInvTotalItems(booksRes.data.total || 0);

            // 2. Tải toàn bộ sách (cho Modal selection và Stats)
            const allBooksRes = await axios.get(`${API_URL}/books?limit=1000`);
            setBooks(allBooksRes.data.books || []); 
            
            // 3. Tải lịch sử
            const historyRes = await axios.get(`${API_URL}/inventory/history`);
            
            const fullHistory = historyRes.data || [];
            setAllHistory(fullHistory); 

            if (Array.isArray(fullHistory)) {
                if (activeTab === 'import') {
                    setHistoryData(fullHistory.filter(h => h.type === 'NHAP'));
                } else if (activeTab === 'export') {
                    setHistoryData(fullHistory.filter(h => h.type === 'XUAT'));
                }
            }

            // Tải danh sách phiếu có PHÂN TRANG
            const receiptsRes = await axios.get(`${API_URL}/warehouse/receipts`, {
                params: { page: receiptPage, limit: itemsPerPage }
            });
            setReceipts(receiptsRes.data.receipts || []);
            setReceiptTotalPages(receiptsRes.data.totalPages || 1);
            setReceiptTotalItems(receiptsRes.data.total || 0);

        } catch (err) {
            console.error("Lỗi fetch kho:", err);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi tải dữ liệu',
                text: 'Không thể kết nối với máy chủ để lấy thông tin kho hàng.',
                confirmButtonColor: '#EF4444'
            });
        }
        setLoading(false);
    };

    const fetchBooks = async () => {
        try {
            const res = await axios.get(`${API_URL}/books?limit=1000`);
            setBooks(res.data.books || res.data || []);
        } catch (err) {
            console.error(err);
        }
    };

    const stats = useMemo(() => {
        const iData = Array.isArray(inventoryData) ? inventoryData : [];
        const hData = Array.isArray(allHistory) ? allHistory : [];
        
        const totalStock = iData.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const lowStockCount = iData.filter(item => item.quantity < 10).length;
        const totalImports = hData.filter(h => h.type === 'NHAP').length;
        const totalExports = hData.filter(h => h.type === 'XUAT').length;
        
        return { totalStock, lowStockCount, totalImports, totalExports };
    }, [inventoryData, allHistory]);


    // --- LOGIC PHIẾU CHUYÊN NGHIỆP ---
    const addReceiptItem = () => setReceiptItems([...receiptItems, { bookId: '', quantity: 1, price: 0 }]);
    
    const removeReceiptItem = React.useCallback((index) => {
        setReceiptItems(prev => prev.filter((_, i) => i !== index));
    }, []);

    const updateReceiptItem = React.useCallback((index, field, value) => {
        setReceiptItems(prev => {
            const newItems = [...prev];
            let updatedItem = { ...newItems[index], [field]: value };
            
            // TỰ ĐỘNG ĐIỀN GIÁ KHI CHỌN SÁCH
            if (field === 'bookId' && value) {
                const selectedBook = books.find(b => b.id === value);
                if (selectedBook) {
                    updatedItem.price = selectedBook.price;
                }
            }
            
            newItems[index] = updatedItem;
            return newItems;
        });
    }, [books]);

    const totalAmountValue = useMemo(() => {
        return receiptItems.reduce((sum, i) => sum + (i.quantity * i.price), 0);
    }, [receiptItems]);

    const handleReceiptSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const receiptData = {
            type: receiptType,
            partnerName: formData.get('partnerName'),
            partnerPhone: formData.get('partnerPhone'),
            partnerAddress: formData.get('partnerAddress'),
            creatorName: formData.get('creatorName'),
            note: formData.get('note'),
            items: receiptItems.filter(item => item.bookId && item.quantity > 0)
        };

        if (receiptData.items.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Thiếu mặt hàng',
                text: 'Vui lòng thêm ít nhất 1 sản phẩm vào phiếu',
                confirmButtonColor: '#3B82F6'
            });
            return;
        }

        // KIỂM TRA TRÙNG LẶP SẢN PHẨM
        const bookIds = receiptData.items.map(item => item.bookId);
        const hasDuplicate = bookIds.some((id, index) => bookIds.indexOf(id) !== index);
        if (hasDuplicate) {
            Swal.fire({
                icon: 'error',
                title: 'Trùng lặp sản phẩm',
                text: 'Trong phiếu có sản phẩm bị trùng lặp. Vui lòng gộp chung vào một dòng hoặc xóa bớt.',
                confirmButtonColor: '#EF4444'
            });
            return;
        }

        try {
            await axios.post(`${API_URL}/warehouse/receipts`, receiptData);
            Swal.fire({
                icon: 'success',
                title: 'Thành công',
                text: `Đã tạo phiếu ${receiptType === 'NHAP' ? 'nhập' : 'xuất'} kho thành công!`,
                timer: 2000,
                showConfirmButton: false
            });
            setIsReceiptModalOpen(false);
            setReceiptItems([{ bookId: '', quantity: 1, price: 0 }]);
            setActiveTab('receipts');
            fetchData();
        } catch (err) {
            console.error('LỖI LẬP PHIẾU:', err);
            Swal.fire({
                icon: 'error',
                title: 'Lỗi lập phiếu',
                text: err.response?.data?.error || err.message,
                confirmButtonColor: '#EF4444'
            });
        }
    };

    const openReceiptModal = (type) => {
        setReceiptType(type);
        setReceiptItems([{ bookId: '', quantity: 1, price: 0 }]);
        setIsReceiptModalOpen(true);
    };

    const handlePrint = () => window.print();

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
                    <button className="btn-import-action" onClick={() => openReceiptModal('NHAP')}>
                        <FiPlus /> Lập phiếu nhập
                    </button>
                    <button className="btn-export-action" onClick={() => openReceiptModal('XUAT')}>
                        <FiCornerUpLeft /> Lập phiếu xuất
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
                <button className={activeTab === 'receipts' ? 'active' : ''} onClick={() => setActiveTab('receipts')}>
                    <FiFileText /> Quản lý Chứng từ
                </button>
                <button className={activeTab === 'import' ? 'active' : ''} onClick={() => setActiveTab('import')}>
                    <FiTruck /> Thẻ kho (Nhập)
                </button>
                <button className={activeTab === 'export' ? 'active' : ''} onClick={() => setActiveTab('export')}>
                    <FiCornerUpLeft /> Thẻ kho (Xuất)
                </button>
            </div>

            <main className="inventory-main">
                {loading ? (
                    <div className="loading-state">
                        <FiClock className="spin" /> Đang tải dữ liệu kho hàng...
                    </div>
                ) : activeTab === 'inventory' ? (
                    <>
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
                                {Array.isArray(inventoryData) && inventoryData.map(book => (
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
                        
                        <footer className="inventory-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p className="pagination-info">
                                Hiển thị {inventoryData.length > 0 ? (invPage - 1) * itemsPerPage + 1 : 0} đến {Math.min(invPage * itemsPerPage, invTotalItems)} trong tổng số {invTotalItems} mục
                            </p>
                            <div className="pagination-controls" style={{ display: 'flex', gap: '5px' }}>
                                <button className="btn-page" onClick={() => setInvPage(prev => Math.max(prev - 1, 1))} disabled={invPage === 1}>
                                    <FiChevronLeft /> Trước
                                </button>
                                {Array.from({ length: Math.min(5, invTotalPages) }, (_, i) => {
                                    let p = i + 1;
                                    return (
                                        <button key={p} className={`btn-page ${invPage === p ? 'active' : ''}`} onClick={() => setInvPage(p)}>
                                            {p}
                                        </button>
                                    );
                                })}
                                <button className="btn-page" onClick={() => setInvPage(prev => Math.min(prev + 1, invTotalPages))} disabled={invPage === invTotalPages}>
                                    Sau <FiChevronRight />
                                </button>
                            </div>
                        </footer>
                    </>
                ) : activeTab === 'receipts' ? (
                    <div className="receipts-list">
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>Mã phiếu</th>
                                    <th>Loại</th>
                                    <th>Thời gian</th>
                                    <th>Đối tác</th>
                                    <th>Tổng tiền</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(receipts) && receipts.map(r => (
                                    <tr key={r.id || Math.random()}>
                                        <td><span className="id-badge blue">{r.id || 'N/A'}</span></td>
                                        <td>
                                            {r.type === 'NHAP' ? (
                                                <span className="badge badge-success">Nhập kho</span>
                                            ) : (
                                                <span className="badge badge-danger">Xuất kho</span>
                                            )}
                                        </td>
                                        <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : '---'}</td>
                                        <td>{r.partnerName || 'Không xác định'}</td>
                                        <td className="txt-bold">{(r.totalAmount || 0).toLocaleString()}đ</td>
                                        <td>
                                            <button className="btn-view-receipt" onClick={() => {
                                                setSelectedReceipt(r);
                                                setIsPrintModalOpen(true);
                                            }}>
                                                <FiPrinter /> Xem & In
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <footer className="inventory-footer" style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <p className="pagination-info">
                                Hiển thị {receipts.length > 0 ? (receiptPage - 1) * itemsPerPage + 1 : 0} đến {Math.min(receiptPage * itemsPerPage, receiptTotalItems)} trong tổng số {receiptTotalItems} mục
                            </p>
                            <div className="pagination-controls" style={{ display: 'flex', gap: '5px' }}>
                                <button className="btn-page" onClick={() => setReceiptPage(prev => Math.max(prev - 1, 1))} disabled={receiptPage === 1}>
                                    <FiChevronLeft /> Trước
                                </button>
                                {Array.from({ length: Math.min(5, receiptTotalPages) }, (_, i) => (
                                    <button key={i + 1} className={`btn-page ${receiptPage === (i + 1) ? 'active' : ''}`} onClick={() => setReceiptPage(i + 1)}>
                                        {i + 1}
                                    </button>
                                ))}
                                <button className="btn-page" onClick={() => setReceiptPage(prev => Math.min(prev + 1, receiptTotalPages))} disabled={receiptPage === receiptTotalPages}>
                                    Sau <FiChevronRight />
                                </button>
                            </div>
                        </footer>
                    </div>
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
                            {Array.isArray(historyData) && historyData.map((h, i) => (
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

            {/* MODAL LẬP PHIẾU CHUYÊN NGHIỆP (MỚI) */}
            {isReceiptModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box large">
                        <div className="modal-top">
                            <h2>
                                {receiptType === 'NHAP' ? <FiTruck /> : <FiCornerUpLeft />} 
                                Lập phiếu {receiptType === 'NHAP' ? 'Nhập kho' : 'Xuất kho'} chuyên nghiệp
                            </h2>
                            <button onClick={() => setIsReceiptModalOpen(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleReceiptSubmit} className="modal-form">
                            <div className="form-grid">
                                <div className="input-group">
                                    <label><FiUser /> {receiptType === 'NHAP' ? 'Nhà cung cấp' : 'Khách hàng / Bộ phận'}</label>
                                    <input type="text" name="partnerName" placeholder="Nhập tên đối tác..." required />
                                </div>
                                <div className="input-group">
                                    <label><FiUser /> Người lập phiếu</label>
                                    <input type="text" name="creatorName" placeholder="Tên nhân viên..." required />
                                </div>
                                <div className="input-group">
                                    <label><FiPhone /> Số điện thoại đối tác</label>
                                    <input type="text" name="partnerPhone" placeholder="SĐT liên hệ..." />
                                </div>
                                <div className="input-group">
                                    <label><FiMapPin /> Địa chỉ đối tác</label>
                                    <input type="text" name="partnerAddress" placeholder="Địa chỉ chi tiết..." />
                                </div>
                            </div>

                            <div className="receipt-items-section">
                                <div className="section-header">
                                    <h3>Danh sách mặt hàng</h3>
                                    <button type="button" className="btn-add-item" onClick={addReceiptItem}>
                                        <FiPlusCircle /> Thêm dòng
                                    </button>
                                </div>
                                <div className="items-table-wrapper">
                                    <table className="items-edit-table">
                                        <thead>
                                            <tr>
                                                <th>Sản phẩm</th>
                                                <th>Số lượng</th>
                                                <th>Đơn giá (nếu có)</th>
                                                <th>Thành tiền</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {receiptItems.map((item, index) => (
                                                <ReceiptItemRow 
                                                    key={index}
                                                    item={item}
                                                    index={index}
                                                    books={books}
                                                    onUpdate={updateReceiptItem}
                                                    onRemove={removeReceiptItem}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="input-group" style={{ marginTop: '15px' }}>
                                <label>Ghi chú chung</label>
                                <textarea name="note" rows="2" placeholder="Nội dung diễn giải..."></textarea>
                            </div>

                            <div className="modal-btns">
                                <div className="total-summary">
                                    Tổng cộng: <span className="total-val">
                                        {totalAmountValue.toLocaleString()}đ
                                    </span>
                                </div>
                                <button type="button" className="btn-cancel" onClick={() => setIsReceiptModalOpen(false)}>Hủy bỏ</button>
                                <button type="submit" className={`btn-save ${receiptType === 'NHAP' ? 'bg-green' : 'bg-red'}`}>
                                    Xác nhận và Hoàn tất
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL XEM CHI TIẾT VÀ IN PHIẾU */}
            {selectedReceipt && (
                <div className="modal-overlay">
                    <div className="modal-box large receipt-print-modal">
                        <div className="modal-top no-print">
                            <h2>Chi tiết phiếu kho</h2>
                            <div className="top-actions">
                                <button className="btn-print" onClick={handlePrint}><FiPrinter /> In phiếu</button>
                                <button onClick={() => setSelectedReceipt(null)}><FiX /></button>
                            </div>
                        </div>
                        <div className="receipt-print-area" id="print-area">
                            <div className="print-header">
                                <div className="company-info">
                                    <h3>HỆ THỐNG QUẢN LÝ KHO SÁCH</h3>
                                    <p>Địa chỉ: 123 Đường Sách, TP. Hồ Chí Minh</p>
                                    <p>Điện thoại: 0123 456 789</p>
                                </div>
                                <div className="receipt-title">
                                    <h1>PHIẾU {selectedReceipt.type === 'NHAP' ? 'NHẬP' : 'XUẤT'} KHO</h1>
                                    <p>Mã số: <strong>{selectedReceipt.id}</strong></p>
                                    <p>Ngày lập: {selectedReceipt.createdAt ? new Date(selectedReceipt.createdAt).toLocaleDateString('vi-VN') : '---'}</p>
                                </div>
                            </div>
                            
                            <div className="print-info">
                                <div className="info-row">
                                    <p><strong>Đối tác:</strong> {selectedReceipt.partnerName || '---'}</p>
                                    <p><strong>Điện thoại:</strong> {selectedReceipt.partnerPhone || '---'}</p>
                                </div>
                                <p><strong>Địa chỉ:</strong> {selectedReceipt.partnerAddress || '---'}</p>
                                <div className="info-row">
                                    <p><strong>Người lập:</strong> {selectedReceipt.creatorName || '---'}</p>
                                    <p><strong>Ghi chú:</strong> {selectedReceipt.note || '---'}</p>
                                </div>
                            </div>

                            <table className="print-table">
                                <thead>
                                    <tr>
                                        <th>STT</th>
                                        <th>Tên sản phẩm</th>
                                        <th>Số lượng</th>
                                        <th>Đơn giá</th>
                                        <th>Thành tiền</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(selectedReceipt.WarehouseReceiptItems) && selectedReceipt.WarehouseReceiptItems.map((item, idx) => (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td>{item.Book?.title || 'Sản phẩm không tồn tại'}</td>
                                            <td>{item.quantity || 0}</td>
                                            <td>{(item.price || 0).toLocaleString()}đ</td>
                                            <td>{(item.total || 0).toLocaleString()}đ</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr>
                                        <td colSpan="4" style={{ textAlign: 'right', fontWeight: 'bold' }}>TỔNG CỘNG:</td>
                                        <td className="txt-bold">{(selectedReceipt.totalAmount || 0).toLocaleString()}đ</td>
                                    </tr>
                                </tfoot>
                            </table>

                            <div className="print-footer">
                                <div className="sign-box">
                                    <p>Người lập phiếu</p>
                                    <span>(Ký và ghi rõ họ tên)</span>
                                </div>
                                <div className="sign-box">
                                    <p>Thủ kho</p>
                                    <span>(Ký và ghi rõ họ tên)</span>
                                </div>
                                <div className="sign-box">
                                    <p>Đối tác</p>
                                    <span>(Ký và ghi rõ họ tên)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManager;