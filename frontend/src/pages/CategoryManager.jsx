import React, { useState, useEffect } from 'react';
import {
    FiPlus, FiSearch, FiMoreVertical, FiEdit2, FiTrash2,
    FiFolder, FiGrid, FiX, FiCheckCircle, FiBell
} from 'react-icons/fi';
import './CategoryManager.css';

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const CategoryManager = ({ setCurrentMenu }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch categories from API
    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_URL}/categories`);
            setCategories(res.data);
            setLoading(false);
        } catch (err) {
            console.error("Lỗi khi tải danh mục:", err);
            setLoading(false);
        }
    };

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, target: null });

    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState('add'); 
    const [currentCategory, setCurrentCategory] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [toast, setToast] = useState({ show: false, msg: '' });

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const showToast = (msg) => {
        setToast({ show: true, msg });
        setTimeout(() => setToast({ show: false, msg: '' }), 3000);
    };

    const handleOpenModal = (mode, category = null) => {
        setModalMode(mode);
        setCurrentCategory(category);
        setIsModalOpen(true);
        setActiveMenuId(null);
    };

    const openConfirmModal = (category) => {
        setConfirmModal({ isOpen: true, target: category });
        setActiveMenuId(null);
    };

    const handleConfirmDelete = async () => {
        const target = confirmModal.target;
        if (!target) return;
        
        try {
            await axios.delete(`${API_URL}/categories/${target.id}`);
            setCategories(categories.filter(cat => cat.id !== target.id));
            showToast("Đã xóa danh mục thành công!");
        } catch (err) {
            console.error(err);
            showToast("Lỗi: Không thể xóa danh mục này (có thể có sách thuộc danh mục này)");
        }
        setConfirmModal({ isOpen: false, target: null });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.target;
        
        const formData = {
            name: form.elements[0].value,
            slug: form.elements[1].value,
            description: form.elements[2].value
        };

        try {
            if (modalMode === 'add') {
                // Tự tạo ID nếu thêm mới
                formData.id = `CAT${Math.floor(Math.random() * 900) + 100}`;
                const res = await axios.post(`${API_URL}/categories`, formData);
                setCategories([...categories, res.data]);
                showToast("Thêm danh mục thành công!");
            } else {
                // Giữ nguyên ID khi sửa
                const res = await axios.put(`${API_URL}/categories/${currentCategory.id}`, formData);
                setCategories(categories.map(cat => cat.id === currentCategory.id ? res.data : cat));
                showToast("Cập nhật thành công!");
            }
            setIsModalOpen(false);
        } catch (err) {
            console.error(err);
            showToast("Lỗi khi lưu thông tin danh mục");
        }
    };

    return (
        <div className="category-container">
            {/* Toast Thông báo */}
            {toast.show && (
                <div className="toast-category">
                    <FiCheckCircle /> {toast.msg}
                </div>
            )}

            <header className="category-header">
                <div className="header-info">
                    <h1>Quản lý danh mục</h1>
                    <p>Phân loại các loại sách trong kho của bạn</p>
                </div>
                <div className="header-actions">
                    <button className="btn-add-cat" onClick={() => handleOpenModal('add')}>
                        <FiPlus /> Thêm danh mục mới
                    </button>
                </div>
            </header>

            <div className="category-toolbar">
                <div className="search-wrapper">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Tìm tên danh mục hoặc mã..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="stats-mini">
                    Tổng số: <strong>{categories.length}</strong> danh mục
                </div>
            </div>

            <main className="category-main">
                <table className="category-table">
                    <thead>
                        <tr>
                            <th>Mã loại</th>
                            <th>Tên danh mục</th>
                            <th>Đường dẫn (Slug)</th>
                            <th>Mô tả</th>
                            <th>Số lượng sách</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.map((cat) => (
                            <tr key={cat.id}>
                                <td className="txt-bold">{cat.id}</td>
                                <td>
                                    <div className="cat-name-cell">
                                        <FiFolder className="icon-folder" />
                                        <span>{cat.name}</span>
                                    </div>
                                </td>
                                <td><span className="badge-slug">/{cat.slug}</span></td>
                                <td className="txt-desc">{cat.description}</td>
                                <td className="txt-center">
                                    <span className="count-badge">{cat.Books ? cat.Books.length : 0}</span>
                                </td>
                                <td className="action-cell">
                                    <button className="btn-more" onClick={() => setActiveMenuId(activeMenuId === cat.id ? null : cat.id)}>
                                        <FiMoreVertical />
                                    </button>
                                    {activeMenuId === cat.id && (
                                        <div className="cat-dropdown">
                                            <button onClick={() => handleOpenModal('edit', cat)}><FiEdit2 /> Sửa</button>
                                            <button className="txt-red" onClick={() => openConfirmModal(cat)}><FiTrash2 /> Xóa</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </main>

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-box confirm-modal-cat">
                        <div className="modal-body-confirm">
                            <div className="confirm-icon bg-red-light">
                                <FiTrash2 className="txt-red" />
                            </div>
                            <h3>Xác nhận xóa danh mục</h3>
                            <p>
                                Bạn có chắc chắn muốn xóa danh mục 
                                <strong> {confirmModal.target?.name}</strong> không? 
                                Hành động này không thể hoàn tác.
                            </p>
                        </div>
                        <div className="modal-footer-confirm">
                            <button className="btn-outline-simple-cat" onClick={() => setConfirmModal({ isOpen: false, target: null })}>Hủy</button>
                            <button className="btn-danger-confirm-cat" onClick={handleConfirmDelete}>Xác nhận xóa</button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL THÊM/SỬA DANH MỤC */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">
                        <div className="modal-top">
                            <h2>{modalMode === 'add' ? 'Thêm danh mục mới' : 'Chỉnh sửa danh mục'}</h2>
                            <button onClick={() => setIsModalOpen(false)}><FiX /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="input-group">
                                <label>Tên danh mục</label>
                                <input type="text" defaultValue={currentCategory?.name} placeholder="VD: Công nghệ thông tin" required />
                            </div>
                            <div className="input-group">
                                <label>Đường dẫn (Slug)</label>
                                <input type="text" defaultValue={currentCategory?.slug} placeholder="VD: cong-nghe-thong-tin" />
                            </div>
                            <div className="input-group">
                                <label>Mô tả ngắn</label>
                                <textarea defaultValue={currentCategory?.description} rows="3" placeholder="Mô tả về loại sách này..."></textarea>
                            </div>
                            <div className="modal-btns">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Hủy</button>
                                <button type="submit" className="btn-save">Lưu thông tin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManager;