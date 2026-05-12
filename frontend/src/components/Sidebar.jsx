import React from 'react';
import { FiGrid, FiBox, FiFolder, FiArchive, FiLogOut, FiShoppingCart, FiBell } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = ({ currentMenu, setCurrentMenu, unreadCount, user, onLogout }) => {
    return (
        <aside className="sidebar-container">
            <div className="sidebar-logo">
                <h2>Quản lý kho</h2>
                <p>Quản lý kho sách</p>
            </div>

            <nav className="sidebar-menu">
                <ul>
                    <li className={currentMenu === 'dashboard' ? 'active' : ''}>
                        <a 
                            href="#dashboard" 
                            className="menu-item"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentMenu('dashboard');
                            }}
                        >
                            <FiGrid className="menu-icon" /> Dashboard
                        </a>
                    </li>
                    <li className={currentMenu === 'products' ? 'active' : ''}>
                        <a 
                            href="#products" 
                            className="menu-item"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentMenu('products');
                            }}
                        >
                            <FiBox className="menu-icon" /> Sản phẩm
                        </a>
                    </li>
                    <li className={currentMenu === 'categories' ? 'active' : ''}>
                        <a 
                            href="#categories" 
                            className="menu-item"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentMenu('categories');
                            }}
                        >
                            <FiFolder className="menu-icon" /> Danh mục
                        </a>
                    </li>
                    <li className={currentMenu === 'orders' ? 'active' : ''}>
                        <a 
                            href="#orders" 
                            className="menu-item"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentMenu('orders');
                            }}
                        >
                            <FiShoppingCart className="menu-icon" /> Đơn hàng
                        </a>
                    </li>
                    <li className={currentMenu === 'inventory' ? 'active' : ''}>
                        <a 
                            href="#inventory" 
                            className="menu-item"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentMenu('inventory');
                            }}
                        >
                            <FiArchive className="menu-icon" /> Kho hàng
                        </a>
                    </li>
                    <li className={currentMenu === 'notifications' ? 'active' : ''}>
                        <a 
                            href="#notifications" 
                            className="menu-item"
                            onClick={(e) => {
                                e.preventDefault();
                                setCurrentMenu('notifications');
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <FiBell className="menu-icon" /> Thông báo
                                </div>
                                {unreadCount > 0 && (
                                    <span style={{ 
                                        backgroundColor: '#EF4444', 
                                        color: 'white', 
                                        fontSize: '11px', 
                                        fontWeight: 'bold', 
                                        padding: '2px 6px', 
                                        borderRadius: '100px',
                                        marginLeft: '10px'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                        </a>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="admin-profile-sidebar">
                    <div className="avatar">{(user?.fullName || user?.username || 'A')[0].toUpperCase()}</div>
                    <div className="admin-info">
                        <span className="admin-name">{user?.fullName || user?.username || 'Admin User'}</span>
                        <span className="admin-role">{user?.role === 'admin' ? 'Quản trị viên' : 'Nhân viên'}</span>
                    </div>
                </div>
                <button className="btn-logout" onClick={onLogout}>Đăng xuất</button>
            </div>
        </aside>
    );
};

export default Sidebar;