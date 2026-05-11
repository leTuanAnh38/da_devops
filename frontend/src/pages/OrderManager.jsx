import React, { useState, useEffect } from 'react';
import { 
    FiPlus, FiSearch, FiMoreVertical, FiRefreshCcw, FiFilter, 
    FiBell, FiChevronLeft, FiChevronRight, FiX,
    FiEye, FiEdit2, FiTrash2, FiCheckCircle, FiChevronDown, FiCheck
} from 'react-icons/fi';
import './OrderManager.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OrderManager = ({ setCurrentMenu }) => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await axios.get(`${API_URL}/orders`);
            setOrders(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Lỗi khi tải đơn hàng:", err);
            setLoading(false);
        }
    };
    
    // 2. STATES QUẢN LÝ UI
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', target: null });
    const [toast, setToast] = useState({ show: false, message: '' });

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({ date: '', minTotal: '', maxTotal: '' });

    // 3. XỬ LÝ LOGIC
    const filteredOrders = orders.filter(order => {
        const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             order.customer.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        // Logic lọc nâng cao (tùy chỉnh thêm nếu cần)
        return matchesSearch && matchesStatus;
    });

    const clearFilters = () => {
        setFilters({ date: '', minTotal: '', maxTotal: '' });
        setStatusFilter('all');
    };

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const handleRefresh = () => {
        fetchOrders();
        showToast('Đã làm mới danh sách đơn hàng');
    };

    const handleOpenConfirm = (type, order) => {
        setConfirmModal({ isOpen: true, type, target: order });
        setActiveMenuId(null);
    };

    const handleConfirmAction = async () => {
        const { type, target } = confirmModal;
        try {
            if (type === 'delete') {
                await axios.delete(`${API_URL}/orders/${target.id}`);
                setOrders(orders.filter(o => o.id !== target.id));
                showToast(`Đã xóa đơn hàng ${target.id}`);
            } else if (type === 'approve') {
                await axios.put(`${API_URL}/orders/${target.id}`, { status: 'Đã xác nhận' });
                fetchOrders();
                showToast(`Đã xác nhận đơn hàng ${target.id}`);
            }
        } catch (err) {
            showToast("Lỗi khi thực hiện thao tác");
        }
        setConfirmModal({ isOpen: false, type: '', target: null });
    };

    const handleViewDetail = (order) => {
        setSelectedOrder(order);
        setIsViewModalOpen(true);
        setActiveMenuId(null);
    };

    const handleOpenEdit = (order) => {
        setSelectedOrder(order);
        setIsEditModalOpen(true);
        setActiveMenuId(null);
    };

    const handleSubmit = async (e, type) => {
        e.preventDefault();
        const form = e.target;
        const formData = {
            id: `DH${Math.floor(Math.random() * 900) + 100}`,
            customer: form.elements[0].value,
            phone: form.elements[1].value,
            address: form.elements[2].value,
            note: form.elements[3].value,
            items: [] // Ở bản demo đơn giản, ta để trống items hoặc bổ sung logic chọn sách
        };

        try {
            if (type === 'add') {
                await axios.post(`${API_URL}/orders`, formData);
                showToast("Tạo đơn hàng thành công!");
            } else {
                await axios.put(`${API_URL}/orders/${selectedOrder.id}`, formData);
                showToast("Cập nhật thành công!");
            }
            fetchOrders();
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
        } catch (err) {
            showToast("Lỗi: " + (err.response?.data?.error || err.message));
        }
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    return (
        <div className="order-container">
            {/* Toast Thông báo */}
            {toast.show && (
                <div className="toast-category">
                    <FiCheckCircle /> {toast.message}
                </div>
            )}

            <header className="order-header">
                <div className="header-info">
                    <h1>Quản lý đơn hàng</h1>
                    <p>Theo dõi và xử lý đơn hàng</p>
                </div>
                <div className="header-actions">
                    <button className="btn-refresh" onClick={handleRefresh}><FiRefreshCcw /></button>
                    <button className="btn-add-order" onClick={() => setIsAddModalOpen(true)}>
                        <FiPlus /> Tạo đơn hàng
                    </button>
                </div>
            </header>

            <div className="toolbar-container">
                <div className="order-toolbar-aligned">
                    <div className="search-wrapper-full">
                        <FiSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo mã đơn hoặc khách hàng..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-select-wrapper">
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="all">Tất cả trạng thái</option>
                            <option value="Chờ xác nhận">Chờ xác nhận</option>
                            <option value="Đã xác nhận">Đã xác nhận</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                        </select>
                        <FiChevronDown className="select-icon-small" />
                    </div>
                    <button className={`btn-filter-toggle ${isFilterOpen ? 'active' : ''}`} onClick={() => setIsFilterOpen(!isFilterOpen)}>
                        <FiFilter /> Bộ lọc
                    </button>
                </div>

                {/* Filter Panel */}
                {isFilterOpen && (
                    <div className="filter-panel-order">
                        <div className="filter-panel-header">
                            <h3>Lọc nâng cao:</h3>
                            {(filters.date || filters.minTotal || filters.maxTotal || statusFilter !== 'all') && (
                                <button className="btn-clear-filter-order" onClick={clearFilters}>Xóa bộ lọc</button>
                            )}
                        </div>
                        <div className="filter-panel-grid">
                            <div className="filter-panel-group">
                                <label>Ngày đặt</label>
                                <input type="text" placeholder="DD/MM/YYYY" value={filters.date} onChange={(e) => setFilters({...filters, date: e.target.value})} />
                            </div>
                            <div className="filter-panel-group">
                                <label>Giá từ</label>
                                <input type="number" placeholder="0" value={filters.minTotal} onChange={(e) => setFilters({...filters, minTotal: e.target.value})} />
                            </div>
                            <div className="filter-panel-group">
                                <label>Giá đến</label>
                                <input type="number" placeholder="999,999,999" value={filters.maxTotal} onChange={(e) => setFilters({...filters, maxTotal: e.target.value})} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <main className="order-main">
                <table className="order-table">
                    <thead>
                        <tr>
                            <th>Mã đơn</th>
                            <th>Khách hàng</th>
                            <th>Ngày đặt</th>
                            <th>Số mặt hàng</th>
                            <th>Tổng tiền</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => (
                            <tr key={order.id}>
                                <td className="txt-bold">{order.id}</td>
                                <td>{order.customer}</td>
                                <td className="txt-gray">{order.date}</td>
                                <td>{order.itemsCount} mặt hàng</td>
                                <td className="txt-bold">{formatPrice(order.totalAmount)}</td>
                                <td>
                                    <span className={`badge-status ${order.status === 'Chờ xác nhận' ? 'pending' : order.status === 'Đã xác nhận' ? 'confirmed' : 'completed'}`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="action-cell">
                                    <div className="action-button-group">
                                        <button className="btn-icon-square" onClick={() => handleViewDetail(order)}><FiEye /></button>
                                        <button className="btn-icon-square" onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)}>
                                            <FiMoreVertical />
                                        </button>
                                        
                                        {activeMenuId === order.id && (
                                            <>
                                                <div className="menu-backdrop-transparent" onClick={() => setActiveMenuId(null)}></div>
                                                <div className="order-dropdown custom-dropdown">
                                                    <div className="dropdown-header">CHỈNH SỬA</div>
                                                    <button onClick={() => handleViewDetail(order)}>
                                                        <div className="btn-label"><FiEye /> <span>Xem chi tiết</span></div>
                                                        <span className="shortcut">Ctrl+I</span>
                                                    </button>
                                                    <button onClick={() => handleOpenEdit(order)}>
                                                        <div className="btn-label"><FiEdit2 /> <span>Chỉnh sửa</span></div>
                                                        <span className="shortcut">Ctrl+E</span>
                                                    </button>
                                                    <button className="txt-red" onClick={() => handleOpenConfirm('delete', order)}>
                                                        <div className="btn-label"><FiTrash2 /> <span>Xóa</span></div>
                                                        <span className="shortcut">Del</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>


            {/* MODAL: TẠO ĐƠN HÀNG */}
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box medium-modal">
                        <div className="modal-header-simple">
                            <h2>Tạo đơn hàng sách mới</h2>
                            <button className="btn-close-modal" onClick={() => setIsAddModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={(e) => handleSubmit(e, 'add')}>
                            <div className="modal-body-simple">
                                <div className="form-grid">
                                    <div className="form-group-simple">
                                        <label>Tên khách hàng</label>
                                        <input type="text" placeholder="Nhập tên khách hàng" required />
                                    </div>
                                    <div className="form-group-simple">
                                        <label>Số điện thoại</label>
                                        <input type="text" placeholder="Nhập số điện thoại" required />
                                    </div>
                                    <div className="form-group-simple full-width">
                                        <label>Địa chỉ nhận hàng</label>
                                        <input type="text" placeholder="Số nhà, tên đường, quận/huyện..." required />
                                    </div>
                                    <div className="form-group-simple full-width">
                                        <label>Ghi chú</label>
                                        <textarea placeholder="Ghi chú về đơn hàng..."></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer-simple">
                                <button type="button" className="btn-outline-simple" onClick={() => setIsAddModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn-primary-simple">Tạo đơn hàng</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CHỈNH SỬA ĐƠN HÀNG */}
            {isEditModalOpen && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-box medium-modal">
                        <div className="modal-header-simple">
                            <h2>Chỉnh sửa đơn hàng {selectedOrder.id}</h2>
                            <button className="btn-close-modal" onClick={() => setIsEditModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>
                        <form onSubmit={(e) => handleSubmit(e, 'edit')}>
                            <div className="modal-body-simple">
                                <div className="form-grid">
                                    <div className="form-group-simple">
                                        <label>Tên khách hàng</label>
                                        <input type="text" defaultValue={selectedOrder.customer} required />
                                    </div>
                                    <div className="form-group-simple">
                                        <label>Trạng thái</label>
                                        <div className="select-wrapper">
                                            <select defaultValue={selectedOrder.status}>
                                                <option value="Chờ xác nhận">Chờ xác nhận</option>
                                                <option value="Đã xác nhận">Đã xác nhận</option>
                                                <option value="Hoàn thành">Hoàn thành</option>
                                            </select>
                                            <FiChevronDown className="select-icon" />
                                        </div>
                                    </div>
                                    <div className="form-group-simple full-width">
                                        <label>Ghi chú</label>
                                        <textarea defaultValue="Đơn hàng gấp"></textarea>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer-simple">
                                <button type="button" className="btn-outline-simple" onClick={() => setIsEditModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn-primary-simple">Lưu thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CHI TIẾT ĐƠN HÀNG */}
            {isViewModalOpen && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-box detail-modal-order">
                        <div className="modal-header-simple">
                            <div className="header-title-flex">
                                <h2>Chi tiết đơn hàng {selectedOrder.id}</h2>
                                <span className={`badge-status-detail ${selectedOrder.status === 'Chờ xác nhận' ? 'pending' : 'confirmed'}`}>
                                    {selectedOrder.status}
                                </span>
                            </div>
                            <button className="btn-close-modal" onClick={() => setIsViewModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>
                        
                        <div className="modal-body-detail-order">
                            <div className="detail-section-group">
                                <h3 className="section-title">Thông tin khách hàng</h3>
                                <div className="detail-info-grid">
                                    <div className="info-block">
                                        <label>Tên khách hàng</label>
                                        <div className="val">{selectedOrder.customer}</div>
                                    </div>
                                    <div className="info-block">
                                        <label>Số điện thoại</label>
                                        <div className="val">{selectedOrder.phone}</div>
                                    </div>
                                    <div className="info-block">
                                        <label>Ngày đặt hàng</label>
                                        <div className="val">{selectedOrder.date}</div>
                                    </div>
                                    <div className="info-block full-width">
                                        <label>Địa chỉ nhận hàng</label>
                                        <div className="val">{selectedOrder.address}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="detail-section-group">
                                <h3 className="section-title">Danh sách sách đã đặt</h3>
                                <div className="products-table-wrapper">
                                    <table className="products-detail-table">
                                        <thead>
                                            <tr>
                                                <th>Tên sách</th>
                                                <th className="txt-center">Số lượng</th>
                                                <th className="txt-right">Đơn giá</th>
                                                <th className="txt-right">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.products?.map((p, i) => (
                                                <tr key={i}>
                                                    <td className="product-name-cell">{p.name}</td>
                                                    <td className="txt-center">{p.qty}</td>
                                                    <td className="txt-right">{formatPrice(p.price)}</td>
                                                    <td className="txt-right txt-bold">{formatPrice(p.total)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="detail-summary-container">
                                <div className="summary-left">
                                    <label>Ghi chú đơn hàng:</label>
                                    <p>{selectedOrder.note || 'Không có ghi chú'}</p>
                                </div>
                                <div className="summary-right">
                                    <div className="sum-item">
                                        <span>Tạm tính:</span>
                                        <span>{formatPrice(selectedOrder.totalAmount)}</span>
                                    </div>
                                    <div className="sum-item">
                                        <span>Phí vận chuyển:</span>
                                        <span>0đ</span>
                                    </div>
                                    <div className="sum-total">
                                        <span>Tổng thanh toán:</span>
                                        <span className="total-amount-val">{formatPrice(selectedOrder.totalAmount)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="modal-footer-simple">
                            <button className="btn-print-order"><FiRefreshCcw /> In hóa đơn</button>
                            <button className="btn-close-large" onClick={() => setIsViewModalOpen(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}

            <footer className="order-footer">
                <div className="pagination-info">
                    Hiển thị <strong>1</strong> đến <strong>{filteredOrders.length}</strong> trong tổng số <strong>{orders.length}</strong> mục
                </div>
                <div className="pagination-btns">
                    <button className="btn-page"><FiChevronLeft /> Trước</button>
                    <button className="btn-page active">1</button>
                    <button className="btn-page">2</button>
                    <button className="btn-page">Sau <FiChevronRight /></button>
                </div>
            </footer>
            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-box confirm-modal">
                        <div className="modal-body-confirm">
                            <div className={`confirm-icon ${confirmModal.type === 'delete' ? 'bg-red-light' : 'bg-blue-light'}`}>
                                {confirmModal.type === 'delete' ? <FiTrash2 className="txt-red" /> : <FiCheck className="txt-blue" />}
                            </div>
                            <h3>{confirmModal.type === 'delete' ? 'Xác nhận xóa đơn hàng' : 'Xác nhận đơn hàng'}</h3>
                            <p>
                                Bạn có chắc chắn muốn {confirmModal.type === 'delete' ? 'xóa' : 'xác nhận'} đơn hàng 
                                <strong> {confirmModal.target?.id}</strong> không? 
                                {confirmModal.type === 'delete' && ' Hành động này không thể hoàn tác.'}
                            </p>
                        </div>
                        <div className="modal-footer-confirm">
                            <button className="btn-outline-simple-cat" onClick={() => setConfirmModal({ isOpen: false, type: '', target: null })}>Hủy</button>
                            <button 
                                className={confirmModal.type === 'delete' ? 'btn-danger-confirm-cat' : 'btn-primary-confirm-cat'} 
                                onClick={handleConfirmAction}
                            >
                                {confirmModal.type === 'delete' ? 'Xác nhận xóa' : 'Xác nhận ngay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManager;
