import React, { useState } from 'react';
import { 
    FiBell, FiShoppingCart, FiAlertTriangle, FiTruck, 
    FiPackage, FiCheckCircle, FiX, FiCheck, FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';
import './NotificationManager.css';

const NotificationManager = () => {
    const [notifications, setNotifications] = useState([
        { 
            id: 1, 
            type: 'order', 
            title: 'Đơn hàng mới #DH005', 
            desc: 'Công ty TNHH ABC vừa đặt đơn hàng mới trị giá 15,000,000đ', 
            time: '5 phút trước', 
            isUnread: true 
        },
        { 
            id: 2, 
            type: 'warning', 
            title: 'Cảnh báo tồn kho', 
            desc: 'Sách "Lập trình Python" sắp hết hàng (chỉ còn 5 cuốn)', 
            time: '15 phút trước', 
            isUnread: true 
        },
        { 
            id: 3, 
            type: 'delivery', 
            title: 'Giao hàng thành công', 
            desc: 'Đơn hàng DH003 đã được giao đến Nhà sách Fahasa', 
            time: '1 giờ trước', 
            isUnread: false 
        },
        { 
            id: 4, 
            type: 'product', 
            title: 'Sách mới đã thêm', 
            desc: 'Bạn vừa thêm sách "Clean Architecture" vào hệ thống', 
            time: '2 giờ trước', 
            isUnread: false 
        },
        { 
            id: 5, 
            type: 'success', 
            title: 'Đơn hàng đã xác nhận', 
            desc: 'Đơn hàng DH004 đã được xác nhận và đang chuẩn bị', 
            time: '3 giờ trước', 
            isUnread: false 
        }
    ]);

    const [filter, setFilter] = useState('all'); // 'all' or 'unread'
    const [toast, setToast] = useState({ show: false, message: '' });

    const filteredNotis = filter === 'unread' ? notifications.filter(n => n.isUnread) : notifications;
    const unreadCount = notifications.filter(n => n.isUnread).length;

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const markAsRead = (id) => {
        setNotifications(notifications.map(n => n.id === id ? { ...n, isUnread: false } : n));
        showToast('Đã đánh dấu đã đọc');
    };

    const deleteNoti = (id) => {
        setNotifications(notifications.filter(n => n.id !== id));
        showToast('Đã xóa thông báo');
    };

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, isUnread: false })));
        showToast('Đã đánh dấu tất cả là đã đọc');
    };

    const deleteAll = () => {
        setNotifications([]);
        showToast('Đã xóa tất cả thông báo');
    };

    const getIcon = (type) => {
        switch(type) {
            case 'order': return <div className="noti-icon-box bg-blue-soft"><FiShoppingCart className="txt-blue" /></div>;
            case 'warning': return <div className="noti-icon-box bg-orange-soft"><FiAlertTriangle className="txt-orange" /></div>;
            case 'delivery': return <div className="noti-icon-box bg-green-soft"><FiTruck className="txt-green" /></div>;
            case 'product': return <div className="noti-icon-box bg-purple-soft"><FiPackage className="txt-purple" /></div>;
            case 'success': return <div className="noti-icon-box bg-green-soft"><FiCheckCircle className="txt-green" /></div>;
            default: return <div className="noti-icon-box"><FiBell /></div>;
        }
    };

    return (
        <div className="noti-manager-container">
            {toast.show && (
                <div className="toast-noti-page">
                    <FiCheckCircle /> {toast.message}
                </div>
            )}

            <header className="noti-header-top">
                <div className="noti-title-area">
                    <h1>Thông báo</h1>
                    <p>{notifications.length > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}</p>
                </div>
                {notifications.length > 0 && (
                    <div className="noti-top-actions">
                        <button className="btn-mark-all" onClick={markAllRead}>Đánh dấu tất cả đã đọc</button>
                        <button className="btn-delete-all" onClick={deleteAll}>Xóa tất cả</button>
                    </div>
                )}
            </header>

            <div className="noti-tabs">
                <button className={`tab-item ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
                    Tất cả <span className="count-badge">{notifications.length}</span>
                </button>
                <button className={`tab-item ${filter === 'unread' ? 'active' : ''}`} onClick={() => setFilter('unread')}>
                    Chưa đọc <span className="count-badge blue-badge">{unreadCount}</span>
                </button>
            </div>

            <main className="noti-list-area">
                {filteredNotis.length > 0 ? (
                    <>
                        <div className="noti-items-wrapper">
                            {filteredNotis.map(noti => (
                                <div key={noti.id} className={`noti-card ${noti.isUnread ? 'unread' : ''}`}>
                                    <div className="noti-card-left">
                                        {getIcon(noti.type)}
                                        <div className="noti-content">
                                            <div className="noti-title-row">
                                                <h4>{noti.title}</h4>
                                                {noti.isUnread && <span className="unread-dot"></span>}
                                            </div>
                                            <p className="noti-desc">{noti.desc}</p>
                                            <span className="noti-time">{noti.time}</span>
                                        </div>
                                    </div>
                                    <div className="noti-card-right">
                                        <button className="btn-noti-action close-btn" onClick={() => deleteNoti(noti.id)}><FiX /></button>
                                        {noti.isUnread && (
                                            <button className="btn-noti-mark" onClick={() => markAsRead(noti.id)}>Đánh dấu đã đọc</button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <footer className="noti-pagination">
                            <div className="pagination-info">Hiển thị 1 đến {filteredNotis.length} trong tổng số {filteredNotis.length} mục</div>
                            <div className="pagination-btns">
                                <button className="btn-page"><FiChevronLeft /> Trước</button>
                                <button className="btn-page active">1</button>
                                <button className="btn-page">2</button>
                                <button className="btn-page">Sau <FiChevronRight /></button>
                            </div>
                        </footer>
                    </>
                ) : (
                    <div className="noti-empty-state">
                        <div className="empty-icon"><FiBell /></div>
                        <h3>Không có thông báo</h3>
                        <p>Chưa có thông báo nào trong mục này</p>
                    </div>
                )}
            </main>
        </div>
    );
};

export default NotificationManager;
