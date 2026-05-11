import React, { useState, useEffect } from 'react';
import { 
    FiBell, FiAlertTriangle, FiPackage, FiCheckCircle, FiX, FiCheck, FiClock, FiTrash2
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import './NotificationManager.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const NotificationManager = () => {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all'); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/notifications`);
            const data = await res.json();
            setNotifications(data);
        } catch (error) {
            console.error('Lỗi fetch notifications:', error);
        }
        setLoading(false);
    };

    const filteredNotis = filter === 'unread' ? notifications.filter(n => !n.isRead) : notifications;
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const markAsRead = async (id) => {
        try {
            await fetch(`${API_URL}/notifications/${id}/read`, { method: 'PUT' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        } catch (error) {
            console.error(error);
        }
    };

    const markAllRead = async () => {
        try {
            await fetch(`${API_URL}/notifications/read-all`, { method: 'PUT' });
            fetchNotifications();
            Swal.fire({
                icon: 'success',
                title: 'Đã đọc tất cả',
                timer: 1500,
                showConfirmButton: false
            });
        } catch (error) {
            console.error(error);
        }
    };

    const deleteAll = async () => {
        const result = await Swal.fire({
            title: 'Xóa tất cả thông báo?',
            text: "Hành động này không thể hoàn tác!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#EF4444',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Xác nhận xóa',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                await fetch(`${API_URL}/notifications/clear`, { method: 'DELETE' });
                setNotifications([]);
                Swal.fire('Đã xóa!', 'Toàn bộ thông báo đã được dọn sạch.', 'success');
            } catch (error) {
                console.error(error);
            }
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'SUCCESS': return <div className="noti-icon-box bg-green-soft"><FiCheckCircle className="txt-green" /></div>;
            case 'WARNING': return <div className="noti-icon-box bg-orange-soft"><FiAlertTriangle className="txt-orange" /></div>;
            case 'ERROR': return <div className="noti-icon-box bg-red-soft"><FiX className="txt-red" /></div>;
            case 'INFO': return <div className="noti-icon-box bg-blue-soft"><FiPackage className="txt-blue" /></div>;
            default: return <div className="noti-icon-box"><FiBell /></div>;
        }
    };

    return (
        <div className="noti-manager-container">
            <header className="noti-header-top">
                <div className="noti-title-area">
                    <h1>Thông báo hệ thống</h1>
                    <p>{notifications.length > 0 ? `Bạn có ${unreadCount} thông báo chưa đọc` : 'Không có thông báo mới'}</p>
                </div>
                {notifications.length > 0 && (
                    <div className="noti-top-actions">
                        <button className="btn-mark-all" onClick={markAllRead}>
                            <FiCheck /> Đánh dấu tất cả đã đọc
                        </button>
                        <button className="btn-delete-all" onClick={deleteAll}>
                            <FiTrash2 /> Xóa tất cả
                        </button>
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
                {loading ? (
                    <div className="noti-empty-state">
                        <div className="empty-icon spin"><FiClock /></div>
                        <p>Đang tải thông báo...</p>
                    </div>
                ) : filteredNotis.length > 0 ? (
                    <div className="noti-items-wrapper">
                        {filteredNotis.map(noti => (
                            <div key={noti.id} className={`noti-card ${!noti.isRead ? 'unread' : ''}`}>
                                <div className="noti-card-left">
                                    {getIcon(noti.type)}
                                    <div className="noti-content">
                                        <div className="noti-title-row">
                                            <h4>{noti.title}</h4>
                                            {!noti.isRead && <span className="unread-dot"></span>}
                                        </div>
                                        <p className="noti-desc">{noti.message}</p>
                                        <span className="noti-time">
                                            <FiClock style={{ marginRight: '4px' }} />
                                            {new Date(noti.createdAt).toLocaleString('vi-VN')}
                                        </span>
                                    </div>
                                </div>
                                <div className="noti-card-right">
                                    {!noti.isRead && (
                                        <button className="btn-noti-mark" onClick={() => markAsRead(noti.id)}>
                                            Đánh dấu đã đọc
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
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
