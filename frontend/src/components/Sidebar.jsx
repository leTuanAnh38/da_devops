import React from 'react';
import { FiGrid, FiBox, FiFolder, FiArchive, FiLogOut } from 'react-icons/fi';
import './Sidebar.css';

const Sidebar = () => {
    return (
        <aside className="sidebar-container">
            <div className="sidebar-logo">
                <h2>Quản lý kho</h2>
                <p>Kho sách</p>
            </div>

            <nav className="sidebar-menu">
                <ul>
                    <li>
                        <a href="#dashboard" className="menu-item">
                            <FiGrid className="menu-icon" /> Dashboard
                        </a>
                    </li>
                    <li className="active">
                        <a href="#products" className="menu-item">
                            <FiBox className="menu-icon" /> Sản phẩm
                        </a>
                    </li>
                    <li>
                        <a href="#categories" className="menu-item">
                            <FiFolder className="menu-icon" /> Danh mục
                        </a>
                    </li>
                    <li>
                        <a href="#inventory" className="menu-item">
                            <FiArchive className="menu-icon" /> Kho hàng
                        </a>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <div className="admin-profile-sidebar">
                    <div className="avatar">A</div>
                    <div className="admin-info">
                        <span className="admin-name">Admin User</span>
                        <span className="admin-role">Quản trị viên</span>
                    </div>
                </div>
                <button className="btn-logout">Đăng xuất</button>
            </div>
        </aside>
    );
};

export default Sidebar;