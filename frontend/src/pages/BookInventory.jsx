import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { 
    FiPlus, FiSearch, FiMoreVertical, FiRefreshCcw, FiFilter, 
    FiBell, FiChevronLeft, FiChevronRight, FiX,
    FiCopy, FiLayers, FiEye, FiEdit2, FiTrash2
} from 'react-icons/fi';
import './BookInventory.css';

const BookInventory = () => {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // States quản lý Modal & UI
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    
    // State cho Menu 3 chấm
    const [currentBook, setCurrentBook] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [formError, setFormError] = useState('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // States cho Tìm kiếm, Bộ lọc & Phân trang
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({ category: '', status: '', minPrice: '', maxPrice: '' });
    
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        setBooks([
            { id: '#001', title: 'Lập trình Python cơ bản', category: 'CNTT', price: 150000, quantity: 50, unit: 'Cuốn', status: 'Còn hàng' },
            { id: '#002', title: 'Kỹ năng giao tiếp đỉnh cao', category: 'Kỹ năng', price: 120000, quantity: 120, unit: 'Cuốn', status: 'Còn hàng' },
            { id: '#003', title: 'Đắc Nhân Tâm', category: 'Văn học', price: 100000, quantity: 15, unit: 'Cuốn', status: 'Sắp hết' },
            { id: '#004', title: 'Kinh tế học vĩ mô', category: 'Kinh doanh', price: 200000, quantity: 30, unit: 'Cuốn', status: 'Còn hàng' },
            { id: '#005', title: 'Lịch sử Việt Nam tóm tắt', category: 'Lịch sử', price: 180000, quantity: 80, unit: 'Cuốn', status: 'Còn hàng' },
            { id: '#006', title: 'Clean Code', category: 'CNTT', price: 250000, quantity: 40, unit: 'Cuốn', status: 'Còn hàng' },
            { id: '#007', title: 'Nhà Lãnh Đạo Không Chức Danh', category: 'Kinh doanh', price: 110000, quantity: 0, unit: 'Cuốn', status: 'Sắp hết' },
        ]);
        setLoading(false);
    }, []);

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
                book.category.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesCategory = filters.category === '' || book.category === filters.category;
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
    const handleAddSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        if (!formData.get('title') || !formData.get('category') || !formData.get('price') || !formData.get('quantity')) {
            setFormError('Vui lòng điền đầy đủ thông tin');
            return;
        }
        setIsAddModalOpen(false);
        setFormError('');
        showToast('Thêm sách thành công!', 'success');
    };

    const openViewModal = (book) => { setCurrentBook(book); setIsViewModalOpen(true); closeMenu(); };
    
    const openEditModal = (book) => { setCurrentBook(book); setIsEditModalOpen(true); closeMenu(); };
    
    const handleEditSubmit = (e) => {
        e.preventDefault();
        setIsEditModalOpen(false);
        showToast('Chỉnh sửa sách thành công!', 'success');
    };

    const openDeleteModal = (book) => { setCurrentBook(book); setIsDeleteModalOpen(true); closeMenu(); };
    
    const handleConfirmDelete = () => {
        setIsDeleteModalOpen(false);
        showToast('Xóa sách thành công!', 'success');
    };

    return (
        <div className="book-inventory-container">
            {toast.show && <div className={`toast-message toast-${toast.type}`}>{toast.message}</div>}
            
            {activeMenuId && <div className="menu-backdrop" onClick={closeMenu}></div>}

            <header className="inventory-header">
                <div className="header-title">
                    <h1>Quản lý sách</h1>
                    <p>Danh sách sách hiện có trong kho</p>
                </div>
                <div className="header-actions">
                    <div className="notification-wrapper" style={{cursor: 'pointer'}}>
                        <FiBell className="icon-bell" />
                        <span className="badge-noti">2</span>
                    </div>
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
                                <option value="CNTT">CNTT</option>
                                <option value="Kinh doanh">Kinh doanh</option>
                                <option value="Văn học">Văn học</option>
                                <option value="Kỹ năng">Kỹ năng</option>
                                <option value="Lịch sử">Lịch sử</option>
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
                                        <td>{book.category}</td>
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
                                        <span className="detail-value">{currentBook.category}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="detail-section">
                                <h3>Thông tin quản lý</h3>
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Giá</span>
                                        <span className="detail-value">{formatPrice(currentBook.price)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Số lượng kho</span>
                                        <span className="detail-value">{currentBook.quantity}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Đơn vị</span>
                                        <span className="detail-value">{currentBook.unit}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Trạng thái</span>
                                        <span className="detail-value">
                                            <span className={currentBook.status === 'Sắp hết' ? 'badge badge-danger' : 'badge badge-success'}>
                                                {currentBook.status}
                                            </span>
                                        </span>
                                    </div>
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
                                <label>Tên sách</label>
                                <input type="text" name="title" placeholder="Nhập tên sách" />
                            </div>
                            <div className="form-group">
                                <label>Thể loại</label>
                                <select name="category">
                                    <option value="">Chọn thể loại</option>
                                    <option value="CNTT">CNTT</option>
                                    <option value="Kinh doanh">Kinh doanh</option>
                                    <option value="Văn học">Văn học</option>
                                    <option value="Kỹ năng">Kỹ năng</option>
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
                                <select name="unit">
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
                                <input type="text" defaultValue={currentBook.title} />
                            </div>
                            <div className="form-group">
                                <label>Thể loại</label>
                                <select defaultValue={currentBook.category}>
                                    <option value="CNTT">CNTT</option>
                                    <option value="Kinh doanh">Kinh doanh</option>
                                    <option value="Văn học">Văn học</option>
                                    <option value="Kỹ năng">Kỹ năng</option>
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Giá (VNĐ)</label>
                                    <input type="number" defaultValue={currentBook.price} />
                                </div>
                                <div className="form-group">
                                    <label>Số lượng</label>
                                    <input type="number" defaultValue={currentBook.quantity} />
                                </div>
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
                    <div className="modal-content modal-sm">
                        <div className="modal-header border-0">
                            <h2>Xác nhận xóa</h2>
                            <button type="button" className="btn-close" onClick={() => setIsDeleteModalOpen(false)}><FiX /></button>
                        </div>
                        <div className="modal-body pb-0">
                            <p style={{ fontSize: '15px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>
                                Bạn có chắc chắn muốn xóa sách <strong style={{ color: '#111827' }}>{currentBook.title}</strong>?<br/>
                                Hành động này không thể hoàn tác.
                            </p>
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn-cancel" onClick={() => setIsDeleteModalOpen(false)}>Hủy</button>
                            <button type="button" className="btn-danger-fill" onClick={handleConfirmDelete}>Xóa</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BookInventory;