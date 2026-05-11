import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    FiPlus, FiSearch, FiMoreVertical, FiRefreshCcw, FiFilter, 
    FiBell, FiChevronLeft, FiChevronRight, FiX,
    FiCopy, FiLayers, FiEye, FiEdit2, FiTrash2, FiCheckCircle, FiChevronDown
} from 'react-icons/fi';
import './BookInventory.css';

const BookInventory = ({ setCurrentMenu }) => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // States quản lý Modal & UI
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
    const [adjustType, setAdjustType] = useState('NHAP'); // 'NHAP' hoặc 'XUAT'
    
    // State cho Menu 3 chấm
    const [currentBook, setCurrentBook] = useState(null);
    const [bookHistory, setBookHistory] = useState([]);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [formError, setFormError] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
    const [categoriesList, setCategoriesList] = useState([]);

    // States cho Tìm kiếm, Bộ lọc & Phân trang
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({ category: '', status: '', minPrice: '', maxPrice: '' });
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        fetchBooks();
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_URL}/categories`);
            setCategoriesList(res.data);
        } catch (err) {
            console.error("Lỗi khi tải danh mục:", err);
        }
    };

    const fetchBooks = async () => {
        try {
            const res = await axios.get(`${API_URL}/books`);
            setBooks(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Lỗi khi tải sách:", err);
            setLoading(false);
        }
    };

    // {
    // "id": "#001",            // Hoặc _id của MongoDB
    // "title": "Clean Code",     // String: Tên sách
    // "category": "CNTT",        // String: Thể loại (CNTT, Kinh doanh, Văn học...)
    // "price": 250000,           // Number: Giá tiền (số nguyên)
    // "quantity": 40,            // Number: Số lượng tồn kho
    // "unit": "Cuốn",            // String: Đơn vị (Cuốn, Bộ)
    // "status": "Còn hàng"       // String: Trạng thái (Còn hàng, Sắp hết)
    // }

    // LOGIC LỌC TỔNG HỢP
    const filteredBooks = useMemo(() => {
        return books.filter(book => {
            const matchesSearch = 
                book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                book.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (book.Category?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesCategory = filters.category === '' || book.categoryId === filters.category;
            const matchesStatus = filters.status === '' || book.status === filters.status;
            const matchesMinPrice = filters.minPrice === '' || book.price >= parseInt(filters.minPrice);
            const matchesMaxPrice = filters.maxPrice === '' || book.price <= parseInt(filters.maxPrice);

            return matchesSearch && matchesCategory && matchesStatus && matchesMinPrice && matchesMaxPrice;
        });
    }, [books, searchQuery, filters]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filters]);

    const totalPages = Math.ceil(filteredBooks.length / itemsPerPage) || 1;
    
    const currentBooks = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredBooks.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredBooks, currentPage]);

    const formatPrice = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    const toggleMenu = (id) => {
        if (activeMenuId === id) setActiveMenuId(null);
        else setActiveMenuId(id);
    };

    const closeMenu = () => setActiveMenuId(null);

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => { setLoading(false); showToast('Đã làm mới dữ liệu!', 'success'); }, 600);
    };

    const clearFilters = () => {
        setFilters({ category: '', status: '', minPrice: '', maxPrice: '' });
        showToast('Đã xóa bộ lọc', 'success');
    };

    const handleCopyId = (id) => {
        navigator.clipboard.writeText(id);
        closeMenu();
        showToast(`Đã sao chép mã ${id}`, 'success');
    };

    // --- CÁC HÀM XỬ LÝ MODAL BỊ THIẾU ĐÃ ĐƯỢC THÊM LẠI VÀO ĐÂY ---
    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newBookData = {
            id: formData.get('id') || `#${Math.floor(Math.random() * 900) + 100}`,
            title: formData.get('title'),
            categoryId: formData.get('categoryId'), // Đổi từ category sang categoryId
            price: parseInt(formData.get('price')),
            quantity: parseInt(formData.get('quantity')),
            unit: formData.get('unit')
        };

        try {
            await axios.post(`${API_URL}/books`, newBookData);
            fetchBooks();
            setIsAddModalOpen(false);
            setFormError('');
            showToast('Thêm sách thành công!', 'success');
        } catch (err) {
            setFormError('Lỗi khi thêm sách: ' + (err.response?.data?.error || err.message));
        }
    };

    const openViewModal = async (book) => { 
        setCurrentBook(book); 
        setIsViewModalOpen(true); 
        closeMenu(); 
        
        try {
            const encodedId = encodeURIComponent(book.id);
            const res = await axios.get(`${API_URL}/books/${encodedId}/history`);
            setBookHistory(res.data);
        } catch (err) {
            console.error("Lỗi khi tải lịch sử kho:", err);
            setBookHistory([]);
        }
    };
    
    const openEditModal = (book) => { setCurrentBook(book); setIsEditModalOpen(true); closeMenu(); };
    
    const handleEditSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const updatedBookData = {
            title: formData.get('title'),
            categoryId: formData.get('categoryId'),
            price: parseInt(formData.get('price')),
            quantity: parseInt(formData.get('quantity')),
            unit: formData.get('unit')
        };

        if (!currentBook?.id) {
            showToast('Lỗi: Không tìm thấy ID sách', 'error');
            return;
        }

        try {
            const encodedId = encodeURIComponent(currentBook.id);
            await axios.put(`${API_URL}/books/${encodedId}`, updatedBookData);
            fetchBooks();
            setIsEditModalOpen(false);
            showToast('Chỉnh sửa sách thành công!', 'success');
        } catch (err) {
            console.error(err);
            showToast('Lỗi khi chỉnh sửa sách', 'error');
        }
    };

    const openDeleteModal = (book) => { setCurrentBook(book); setIsDeleteModalOpen(true); closeMenu(); };
    
    const handleConfirmDelete = async () => {
        try {
            const encodedId = encodeURIComponent(currentBook.id);
            await axios.delete(`${API_URL}/books/${encodedId}`);
            fetchBooks();
            setIsDeleteModalOpen(false);
            showToast('Xóa sách thành công!', 'success');
            setCurrentBook(null);
        } catch (err) {
            showToast('Lỗi khi xóa sách', 'error');
        }
    };

    const openAdjustModal = (book, type) => {
        setCurrentBook(book);
        setAdjustType(type);
        setIsAdjustModalOpen(true);
        setActiveMenuId(null);
    };

    const handleAdjustSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const adjustment = {
            bookId: currentBook.id,
            type: adjustType,
            quantity: parseInt(formData.get('quantity')),
            note: formData.get('note')
        };

        try {
            await axios.post(`${API_URL}/inventory/adjust`, adjustment);
            fetchBooks();
            setIsAdjustModalOpen(false);
            showToast(`${adjustType === 'NHAP' ? 'Nhập' : 'Xuất'} kho thành công!`, 'success');
        } catch (err) {
            showToast('Lỗi: ' + (err.response?.data?.error || err.message), 'error');
        }
    };

    return (
        <div className="book-inventory-container">
            {/* Toast Thông báo */}
            {toast.show && (
                <div className="toast-category">
                    <FiCheckCircle /> {toast.message}
                </div>
            )}
            
            {activeMenuId && <div className="menu-backdrop" onClick={closeMenu}></div>}

            <header className="inventory-header">
                <div className="header-title">
                    <h1>Quản lý sách</h1>
                    <p>Danh sách sách hiện có trong kho</p>
                </div>
            </header>

            <div className="action-bar">
                <div className="search-box">
                    <FiSearch className="icon-search" />
                    <input 
                        type="text" 
                        placeholder="Tìm theo tên, mã hoặc thể loại..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="action-buttons">
                    <button className="btn-icon" onClick={handleRefresh}><FiRefreshCcw /></button>
                    <button 
                        className={`btn-filter ${isFilterOpen ? 'active' : ''}`} 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                    >
                        <FiFilter /> Bộ lọc
                    </button>
                    <button className="btn-add" onClick={() => { setIsAddModalOpen(true); setFormError(''); }}>
                        <FiPlus /> Thêm sách
                    </button>
                </div>
            </div>

            {/* BẢNG ĐIỀU KHIỂN BỘ LỌC NÂNG CAO */}
            {isFilterOpen && (
                <div className="filter-panel">
                    <div className="filter-header">
                        <h3>Lọc theo:</h3>
                        {(filters.category || filters.status || filters.minPrice || filters.maxPrice) && (
                            <button className="btn-clear-filter" onClick={clearFilters}>Xóa bộ lọc</button>
                        )}
                    </div>
                    <div className="filter-grid">
                        <div className="filter-group">
                            <label>Thể loại</label>
                            <select value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
                                <option value="">Tất cả thể loại</option>
                                {categoriesList.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Trạng thái</label>
                            <select value={filters.status} onChange={(e) => setFilters({...filters, status: e.target.value})}>
                                <option value="">Tất cả trạng thái</option>
                                <option value="Còn hàng">Còn hàng</option>
                                <option value="Sắp hết">Sắp hết</option>
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Giá từ (VNĐ)</label>
                            <input 
                                type="number" 
                                placeholder="0" 
                                min="0"
                                value={filters.minPrice} 
                                onChange={(e) => setFilters({...filters, minPrice: e.target.value})}
                            />
                        </div>
                        <div className="filter-group">
                            <label>Đến giá (VNĐ)</label>
                            <input 
                                type="number" 
                                placeholder="Tối đa" 
                                min="0"
                                value={filters.maxPrice} 
                                onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
                            />
                        </div>
                    </div>
                </div>
            )}

            <main className="inventory-main">
                {loading ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>Đang tải dữ liệu...</div>
                ) : (
                    <div className="table-wrapper">
                        <table className="inventory-table">
                            <thead>
                                <tr>
                                    <th>Mã</th>
                                    <th>Tên sách</th>
                                    <th>Thể loại</th>
                                    <th>Giá</th>
                                    <th>Số lượng</th>
                                    <th>Đơn vị</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentBooks.length > 0 ? currentBooks.map((book) => (
                                    <tr key={book.id} className={activeMenuId === book.id ? 'active-row' : ''}>
                                        <td>{book.id}</td>
                                        <td className="book-title">{book.title}</td>
                                        <td>{book.Category?.name || book.categoryId}</td>
                                        <td>{formatPrice(book.price)}</td>
                                        <td>{book.quantity}</td>
                                        <td>{book.unit}</td>
                                        <td>
                                            <span className={book.status === 'Sắp hết' ? 'badge badge-danger' : 'badge badge-success'}>
                                                {book.status}
                                            </span>
                                        </td>
                                        <td className="action-cell">
                                            <button className="btn-more" onClick={() => toggleMenu(book.id)}>
                                                <FiMoreVertical />
                                            </button>
                                            
                                            {activeMenuId === book.id && (
                                                <div className="dropdown-menu">
                                                    <div className="dropdown-group-title">Thao tác nhanh</div>
                                                    <button className="dropdown-item" onClick={() => handleCopyId(book.id)}>
                                                        <FiCopy /> Sao chép mã <span className="shortcut">Ctrl+C</span>
                                                    </button>
                                                    <div className="dropdown-divider"></div>
                                                    <div className="dropdown-group-title">Chỉnh sửa</div>
                                                    <button className="dropdown-item" onClick={() => openViewModal(book)}>
                                                        <FiEye /> Xem chi tiết <span className="shortcut">Ctrl+I</span>
                                                    </button>
                                                    <button className="dropdown-item" onClick={() => openEditModal(book)}>
                                                        <FiEdit2 /> Chỉnh sửa <span className="shortcut">Ctrl+E</span>
                                                    </button>
                                                    <button className="dropdown-item text-danger" onClick={() => openDeleteModal(book)}>
                                                        <FiTrash2 /> Xóa <span className="shortcut">Del</span>
                                                    </button>
                                                    <div className="dropdown-divider"></div>
                                                    <div className="dropdown-group-title">Kho hàng</div>
                                                    <button className="dropdown-item" onClick={() => openAdjustModal(book, 'NHAP')}>
                                                        <FiPlus style={{ color: '#10B981' }} /> Nhập kho nhanh
                                                    </button>
                                                    <button className="dropdown-item" onClick={() => openAdjustModal(book, 'XUAT')}>
                                                        <FiTrash2 style={{ color: '#EF4444' }} /> Xuất kho nhanh
                                                    </button>
                                                    <div className="dropdown-divider"></div>
                                                    <button className="dropdown-item" onClick={closeMenu}><FiX /> Đóng menu <span className="shortcut">Esc</span></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#6B7280' }}>Không tìm thấy kết quả nào phù hợp.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            <footer className="inventory-footer">
                <p className="pagination-info">
                    Hiển thị {currentBooks.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} đến {Math.min(currentPage * itemsPerPage, filteredBooks.length)} trong tổng số {filteredBooks.length} mục
                </p>
                <div className="pagination-controls">
                    <button className="btn-page" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
                        <FiChevronLeft /> Trước
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} className={`btn-page ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>
                            {page}
                        </button>
                    ))}
                    <button className="btn-page" onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
                        Sau <FiChevronRight />
                    </button>
                </div>
            </footer>

            {/* MODAL XEM CHI TIẾT SÁCH */}
            {isViewModalOpen && currentBook && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Chi tiết sách</h2>
                            <button type="button" className="btn-close" onClick={() => setIsViewModalOpen(false)}><FiX /></button>
                        </div>
                        <div className="modal-body">
                            <div className="detail-section">
                                <h3>Thông tin cơ bản</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Mã sách</span>
                                        <span className="detail-value">{currentBook.id}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Tên sách</span>
                                        <span className="detail-value">{currentBook.title}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Thể loại</span>
                                        <span className="detail-value">{currentBook.Category?.name || currentBook.categoryId}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="detail-section">
                                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FiLayers /> Lịch sử biến động kho
                                </h3>
                                <div className="history-table-wrapper" style={{ marginTop: '12px', maxHeight: '200px', overflowY: 'auto', border: '1px solid #E5E7EB', borderRadius: '8px' }}>
                                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                                        <thead style={{ backgroundColor: '#F9FAFB', position: 'sticky', top: 0 }}>
                                            <tr>
                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Thời gian</th>
                                                <th style={{ padding: '10px', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>Loại</th>
                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>Thay đổi</th>
                                                <th style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #E5E7EB' }}>Tồn cuối</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bookHistory.length > 0 ? bookHistory.map((h, i) => (
                                                <tr key={i}>
                                                    <td style={{ padding: '10px', borderBottom: '1px solid #F3F4F6' }}>{new Date(h.createdAt).toLocaleString('vi-VN')}</td>
                                                    <td style={{ padding: '10px', borderBottom: '1px solid #F3F4F6' }}>
                                                        <span className={`badge ${h.type === 'NHAP' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '11px' }}>
                                                            {h.type === 'NHAP' ? 'Nhập' : 'Xuất'}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #F3F4F6', color: h.change > 0 ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>
                                                        {h.change > 0 ? `+${h.change}` : h.change}
                                                    </td>
                                                    <td style={{ padding: '10px', textAlign: 'right', borderBottom: '1px solid #F3F4F6' }}>{h.currentStock}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#6B7280' }}>Chưa có lịch sử biến động.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer border-top">
                            <button type="button" className="btn-cancel" onClick={() => setIsViewModalOpen(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL THÊM SÁCH */}
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Thêm sách mới</h2>
                            <button type="button" className="btn-close" onClick={() => setIsAddModalOpen(false)}><FiX /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleAddSubmit}>
                            {formError && <div className="error-alert">{formError}</div>}
                            <div className="form-group">
                                <label>Mã sách (Ví dụ: #001)</label>
                                <input type="text" name="id" placeholder="Để trống để tự tạo mã" />
                            </div>
                            <div className="form-group">
                                <label>Tên sách</label>
                                <input type="text" name="title" placeholder="Nhập tên sách" required />
                            </div>
                            <div className="form-group">
                                <label>Thể loại</label>
                                <select name="categoryId" required>
                                    <option value="">Chọn thể loại</option>
                                    {categoriesList.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Giá (VNĐ)</label>
                                    <input type="number" name="price" placeholder="0" min="0" />
                                </div>
                                <div className="form-group">
                                    <label>Số lượng</label>
                                    <input type="number" name="quantity" placeholder="0" min="0" />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Đơn vị</label>
                                <select name="unit" defaultValue="Cuốn">
                                    <option value="Cuốn">Cuốn</option>
                                    <option value="Bộ">Bộ</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn-submit">Tạo sách</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL SỬA SÁCH */}
            {isEditModalOpen && currentBook && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Chỉnh sửa sách</h2>
                            <button type="button" className="btn-close" onClick={() => setIsEditModalOpen(false)}><FiX /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleEditSubmit}>
                            <div className="form-group">
                                <label>Tên sách</label>
                                <input type="text" name="title" defaultValue={currentBook.title} required />
                            </div>
                            <div className="form-group">
                                <label>Thể loại</label>
                                <select defaultValue={currentBook.categoryId} name="categoryId" required>
                                    <option value="">Chọn thể loại</option>
                                    {categoriesList.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Giá (VNĐ)</label>
                                    <input type="number" name="price" defaultValue={currentBook.price} required />
                                </div>
                                <div className="form-group">
                                    <label>Số lượng</label>
                                    <input type="number" name="quantity" defaultValue={currentBook.quantity} required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Đơn vị</label>
                                <select name="unit" defaultValue={currentBook.unit}>
                                    <option value="Cuốn">Cuốn</option>
                                    <option value="Bộ">Bộ</option>
                                </select>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsEditModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn-submit">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL XÓA SÁCH */}
            {isDeleteModalOpen && currentBook && (
                <div className="modal-overlay">
                    <div className="modal-box confirm-modal">
                        <div className="modal-body-confirm">
                            <div className="confirm-icon bg-red-light">
                                <FiTrash2 className="txt-red" />
                            </div>
                            <h3>Xác nhận xóa sách</h3>
                            <p>
                                Bạn có chắc chắn muốn xóa sách 
                                <strong> {currentBook.title}</strong> không? 
                                Hành động này không thể hoàn tác.
                            </p>
                        </div>
                        <div className="modal-footer-confirm">
                            <button className="btn-outline-simple-cat" onClick={() => setIsDeleteModalOpen(false)}>Hủy</button>
                            <button className="btn-danger-confirm-cat" onClick={handleConfirmDelete}>Xác nhận xóa</button>
                        </div>
                    </div>
                </div>
            )}
            {/* MODAL ĐIỀU CHỈNH KHO (NHẬP/XUẤT) */}
            {isAdjustModalOpen && currentBook && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>{adjustType === 'NHAP' ? 'Nhập kho sách' : 'Xuất kho sách'}</h2>
                            <button type="button" className="btn-close" onClick={() => setIsAdjustModalOpen(false)}><FiX /></button>
                        </div>
                        <form className="modal-body" onSubmit={handleAdjustSubmit}>
                            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#F3F4F6', borderRadius: '6px' }}>
                                <p style={{ margin: 0, fontSize: '13px', color: '#6B7280' }}>Sách: <strong>{currentBook.title}</strong></p>
                                <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#6B7280' }}>Tồn hiện tại: <strong>{currentBook.quantity}</strong></p>
                            </div>
                            <div className="form-group">
                                <label>Số lượng {adjustType === 'NHAP' ? 'nhập thêm' : 'xuất đi'}</label>
                                <input type="number" name="quantity" min="1" placeholder="Nhập số lượng..." required />
                            </div>
                            <div className="form-group">
                                <label>Ghi chú / Lý do</label>
                                <textarea name="note" placeholder="Ví dụ: Nhập hàng mới về, Hàng lỗi..." rows="2"></textarea>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setIsAdjustModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn-submit" style={{ backgroundColor: adjustType === 'NHAP' ? '#10B981' : '#EF4444', color: 'white' }}>
                                    Xác nhận {adjustType === 'NHAP' ? 'nhập' : 'xuất'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookInventory;