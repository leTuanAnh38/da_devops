import React, { useState, useEffect, useMemo } from 'react';
import { 
    FiPlus, FiSearch, FiMoreVertical, FiRefreshCcw, FiFilter, 
    FiBell, FiChevronLeft, FiChevronRight, FiX,
    FiEye, FiEdit2, FiTrash2, FiCheckCircle, FiChevronDown, FiCheck, FiUser, FiMapPin, FiPhone, FiFileText, FiPlusCircle, FiShoppingBag
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import './OrderManager.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const OrderItemRow = React.memo(({ item, index, books, onUpdate, onRemove }) => {
    return (
        <tr>
            <td style={{ width: '50%' }}>
                <select 
                    value={item.bookId} 
                    onChange={(e) => onUpdate(index, 'bookId', e.target.value)}
                    required
                >
                    <option value="">-- Chọn sách --</option>
                    {books.map(b => (
                        <option key={b.id} value={b.id}>{b.title} (Giá: {b.price.toLocaleString()}đ)</option>
                    ))}
                </select>
            </td>
            <td>
                <input 
                    type="number" 
                    min="1" 
                    value={item.qty}
                    onChange={(e) => onUpdate(index, 'qty', parseInt(e.target.value) || 0)}
                />
            </td>
            <td className="txt-bold">{(item.qty * item.price).toLocaleString()}đ</td>
            <td>
                <button type="button" className="btn-remove-item" onClick={() => onRemove(index)}>
                    <FiTrash2 />
                </button>
            </td>
        </tr>
    );
});

const OrderManager = ({ setCurrentMenu }) => {
    const [orders, setOrders] = useState([]);
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
        fetchBooks();
    }, []);

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_URL}/orders`);
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
            setLoading(false);
        } catch (err) {
            console.error("Lỗi khi tải đơn hàng:", err);
            setLoading(false);
        }
    };

    const fetchBooks = async () => {
        try {
            const res = await fetch(`${API_URL}/books`);
            const data = await res.json();
            setBooks(data);
        } catch (err) {
            console.error(err);
        }
    };
    
    // 2. STATES QUẢN LÝ UI
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [toast, setToast] = useState({ show: false, message: '' });

    // Modal States
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({ date: '', minTotal: '', maxTotal: '' });
    
    // Items state for Add/Edit
    const [orderItems, setOrderItems] = useState([{ bookId: '', qty: 1, price: 0 }]);

    // 3. XỬ LÝ LOGIC
    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = 
                order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                order.customer.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);

    const clearFilters = () => {
        setFilters({ date: '', minTotal: '', maxTotal: '' });
        setStatusFilter('all');
    };

    const handleRefresh = () => {
        fetchOrders();
        Swal.fire({
            icon: 'success',
            title: 'Đã làm mới!',
            toast: true,
            position: 'top-end',
            showConfirmButton: false,
            timer: 2000
        });
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        setActiveMenuId(null);
        
        const confirmResult = await Swal.fire({
            title: `Xác nhận chuyển sang ${newStatus}?`,
            text: newStatus === 'Hoàn thành' ? "Hệ thống sẽ tự động tạo Phiếu xuất kho và trừ tồn kho!" : "",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: newStatus === 'Hoàn thành' ? '#10B981' : '#3B82F6',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Đồng ý',
            cancelButtonText: 'Hủy'
        });

        if (!confirmResult.isConfirmed) return;

        try {
            const res = await fetch(`${API_URL}/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            const data = await res.json();

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Thành công',
                    text: newStatus === 'Hoàn thành' ? 'Đơn hàng đã hoàn thành và xuất kho tự động!' : 'Đã cập nhật trạng thái!',
                    timer: 2500,
                    showConfirmButton: false
                });
                fetchOrders();
            } else {
                throw new Error(data.error || 'Lỗi cập nhật');
            }
        } catch (err) {
            Swal.fire('Lỗi', err.message, 'error');
        }
    };

    const handleDeleteOrder = async (orderId) => {
        setActiveMenuId(null);
        const result = await Swal.fire({
            title: 'Xác nhận xóa?',
            text: "Dữ liệu đơn hàng sẽ bị xóa vĩnh viễn!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            confirmButtonText: 'Xóa ngay',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                const res = await fetch(`${API_URL}/orders/${orderId}`, { method: 'DELETE' });
                if (res.ok) {
                    Swal.fire('Đã xóa!', 'Đơn hàng đã được loại bỏ.', 'success');
                    fetchOrders();
                } else {
                    const data = await res.json();
                    Swal.fire('Lỗi', data.error || 'Không thể xóa', 'error');
                }
            } catch (err) {
                Swal.fire('Lỗi', 'Lỗi kết nối máy chủ', 'error');
            }
        }
    };

    const addOrderItem = () => setOrderItems([...orderItems, { bookId: '', qty: 1, price: 0 }]);
    
    const removeOrderItem = (index) => {
        setOrderItems(orderItems.filter((_, i) => i !== index));
    };

    const updateOrderItem = (index, field, value) => {
        const newItems = [...orderItems];
        newItems[index][field] = value;
        
        if (field === 'bookId' && value) {
            const book = books.find(b => b.id === value);
            if (book) newItems[index].price = book.price;
        }
        
        setOrderItems(newItems);
    };

    const totalAmountValue = useMemo(() => {
        return orderItems.reduce((sum, i) => sum + (i.qty * i.price), 0);
    }, [orderItems]);

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        
        const validItems = orderItems.filter(item => item.bookId && item.qty > 0);
        if (validItems.length === 0) {
            return Swal.fire('Cảnh báo', 'Vui lòng thêm ít nhất 1 cuốn sách', 'warning');
        }

        const orderData = {
            customer: formData.get('customer'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            note: formData.get('note'),
            items: validItems
        };

        try {
            const res = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });

            if (res.ok) {
                Swal.fire('Thành công', 'Đơn hàng mới đã được tạo', 'success');
                setIsAddModalOpen(false);
                setOrderItems([{ bookId: '', qty: 1, price: 0 }]);
                fetchOrders();
            } else {
                const data = await res.json();
                Swal.fire('Lỗi', data.error || 'Lỗi khi tạo đơn hàng', 'error');
            }
        } catch (err) {
            Swal.fire('Lỗi', 'Lỗi kết nối máy chủ', 'error');
        }
    };

    const formatPrice = (price) => {
        return (price || 0).toLocaleString('vi-VN') + 'đ';
    };

    return (
        <div className="order-container">
            <header className="order-header">
                <div className="header-info">
                    <h1><FiShoppingBag /> Quản lý đơn hàng</h1>
                    <p>Theo dõi và xử lý đơn hàng chuyên nghiệp</p>
                </div>
                <div className="header-actions">
                    <button className="btn-icon-square" onClick={handleRefresh} title="Làm mới"><FiRefreshCcw /></button>
                    <button className="btn-add-order" onClick={() => setIsAddModalOpen(true)}>
                        <FiPlus /> Tạo đơn hàng mới
                    </button>
                </div>
            </header>

            <div className="toolbar-container">
                <div className="order-toolbar-aligned">
                    <div className="search-wrapper-full">
                        <FiSearch className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo mã đơn hoặc tên khách hàng..." 
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
                </div>
            </div>

            <main className="order-main">
                {loading ? (
                    <div className="loading-state">Đang tải danh sách đơn hàng...</div>
                ) : (
                    <table className="order-table">
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Khách hàng</th>
                                <th>Ngày đặt</th>
                                <th>Tổng tiền</th>
                                <th>Trạng thái</th>
                                <th>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order.id}>
                                    <td><span className="id-badge blue">{order.id}</span></td>
                                    <td className="txt-bold">{order.customer}</td>
                                    <td className="txt-gray">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                    <td className="txt-bold color-primary">{formatPrice(order.totalAmount)}</td>
                                    <td>
                                        <span className={`badge-status ${order.status === 'Chờ xác nhận' ? 'pending' : order.status === 'Đã xác nhận' ? 'confirmed' : 'completed'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="action-cell">
                                        <div className="action-button-group">
                                            <button className="btn-view-detail" onClick={() => {
                                                setSelectedOrder(order);
                                                setIsViewModalOpen(true);
                                            }}>
                                                <FiEye /> Chi tiết
                                            </button>
                                            <button className="btn-more-circle" onClick={() => setActiveMenuId(activeMenuId === order.id ? null : order.id)}>
                                                <FiMoreVertical />
                                            </button>
                                            
                                            {activeMenuId === order.id && (
                                                <>
                                                    <div className="menu-backdrop-transparent" onClick={() => setActiveMenuId(null)}></div>
                                                    <div className="order-dropdown">
                                                        <div className="dropdown-label">Cập nhật trạng thái</div>
                                                        {order.status !== 'Đã xác nhận' && order.status !== 'Hoàn thành' && (
                                                            <button onClick={() => handleUpdateStatus(order.id, 'Đã xác nhận')}>
                                                                <FiCheckCircle className="txt-blue" /> Xác nhận đơn
                                                            </button>
                                                        )}
                                                        {order.status !== 'Hoàn thành' && (
                                                            <button onClick={() => handleUpdateStatus(order.id, 'Hoàn thành')}>
                                                                <FiCheckCircle className="txt-green" /> Hoàn thành & Xuất kho
                                                            </button>
                                                        )}
                                                        <div className="dropdown-divider"></div>
                                                        <button className="txt-red" onClick={() => handleDeleteOrder(order.id)}>
                                                            <FiTrash2 /> Xóa đơn hàng
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
                )}
            </main>

            {/* MODAL: TẠO ĐƠN HÀNG MỚI */}
            {isAddModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box large">
                        <div className="modal-top">
                            <h2><FiPlusCircle /> Tạo đơn hàng mới</h2>
                            <button onClick={() => setIsAddModalOpen(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleAddSubmit} className="modal-form">
                            <div className="form-grid">
                                <div className="input-group">
                                    <label><FiUser /> Tên khách hàng</label>
                                    <input type="text" name="customer" placeholder="Nhập tên khách hàng..." required />
                                </div>
                                <div className="input-group">
                                    <label><FiPhone /> Số điện thoại</label>
                                    <input type="text" name="phone" placeholder="Số điện thoại liên hệ..." required />
                                </div>
                                <div className="input-group full-width">
                                    <label><FiMapPin /> Địa chỉ giao hàng</label>
                                    <input type="text" name="address" placeholder="Địa chỉ chi tiết..." required />
                                </div>
                            </div>

                            <div className="order-items-section">
                                <div className="section-header">
                                    <h3><FiShoppingBag /> Danh sách mặt hàng</h3>
                                    <button type="button" className="btn-add-item" onClick={addOrderItem}>
                                        <FiPlusCircle /> Thêm sách
                                    </button>
                                </div>
                                <div className="items-table-wrapper">
                                    <table className="items-edit-table">
                                        <thead>
                                            <tr>
                                                <th>Sách</th>
                                                <th>Số lượng</th>
                                                <th>Thành tiền</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {orderItems.map((item, index) => (
                                                <OrderItemRow 
                                                    key={index}
                                                    item={item}
                                                    index={index}
                                                    books={books}
                                                    onUpdate={updateOrderItem}
                                                    onRemove={removeOrderItem}
                                                />
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="input-group" style={{ marginTop: '15px' }}>
                                <label><FiFileText /> Ghi chú đơn hàng</label>
                                <textarea name="note" rows="2" placeholder="Ghi chú thêm..."></textarea>
                            </div>

                            <div className="modal-btns">
                                <div className="total-summary">
                                    Tổng thanh toán: <span className="total-val">{totalAmountValue.toLocaleString()}đ</span>
                                </div>
                                <button type="button" className="btn-cancel" onClick={() => setIsAddModalOpen(false)}>Hủy bỏ</button>
                                <button type="submit" className="btn-save bg-blue">Tạo đơn hàng</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL: CHI TIẾT ĐƠN HÀNG */}
            {isViewModalOpen && selectedOrder && (
                <div className="modal-overlay">
                    <div className="modal-box large">
                        <div className="modal-top">
                            <h2>Chi tiết đơn hàng {selectedOrder.id}</h2>
                            <button onClick={() => setIsViewModalOpen(false)}><FiX /></button>
                        </div>
                        <div className="order-detail-content">
                            <div className="detail-header-info">
                                <div className="info-card">
                                    <label><FiUser /> Khách hàng</label>
                                    <p>{selectedOrder.customer}</p>
                                </div>
                                <div className="info-card">
                                    <label><FiPhone /> Điện thoại</label>
                                    <p>{selectedOrder.phone}</p>
                                </div>
                                <div className="info-card">
                                    <label><FiMapPin /> Địa chỉ</label>
                                    <p>{selectedOrder.address}</p>
                                </div>
                                <div className="info-card">
                                    <label><FiFileText /> Trạng thái</label>
                                    <span className={`badge-status ${selectedOrder.status === 'Chờ xác nhận' ? 'pending' : selectedOrder.status === 'Đã xác nhận' ? 'confirmed' : 'completed'}`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                            </div>

                            <div className="detail-items-list">
                                <h3>Sản phẩm đã đặt</h3>
                                <table className="items-view-table">
                                    <thead>
                                        <tr>
                                            <th>Sách</th>
                                            <th>Số lượng</th>
                                            <th>Đơn giá</th>
                                            <th>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedOrder.OrderItems?.map((item, idx) => (
                                            <tr key={idx}>
                                                <td>{item.Book?.title || 'Sản phẩm không tên'}</td>
                                                <td>{item.qty}</td>
                                                <td>{formatPrice(item.price)}</td>
                                                <td className="txt-bold">{formatPrice(item.total)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan="3" className="txt-right">TỔNG CỘNG:</td>
                                            <td className="txt-bold color-primary" style={{ fontSize: '18px' }}>{formatPrice(selectedOrder.totalAmount)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                            
                            {selectedOrder.note && (
                                <div className="detail-note">
                                    <label>Ghi chú:</label>
                                    <p>{selectedOrder.note}</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-close-large" onClick={() => setIsViewModalOpen(false)}>Đóng lại</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManager;
