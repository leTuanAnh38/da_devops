import React, { useState } from 'react';
import {
    FiRotateCw, FiDownload, FiPlus, FiEye, FiCheck, FiX, FiChevronDown, FiBell
} from 'react-icons/fi';
import './InventoryManager.css';

const InventoryManager = ({ setCurrentMenu }) => {
    const [activeTab, setActiveTab] = useState('inventory'); // 'inventory', 'import', 'export'
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedSlip, setSelectedSlip] = useState(null);

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', target: null });

    // Mock data for "Tồn kho"
    const [inventoryData, setInventoryData] = useState([
        { id: 1, name: 'Đắc Nhân Tâm', quantity: '150', unit: 'Cuốn', location: 'Kệ A1', status: 'Bình thường' },
        { id: 2, name: 'Lập trình Python cơ bản', quantity: '50', unit: 'Cuốn', location: 'Kệ B2', status: 'Sắp hết' },
        { id: 3, name: 'Clean Code', quantity: '80', unit: 'Cuốn', location: 'Kệ A1', status: 'Bình thường' },
        { id: 4, name: 'Kinh tế học vĩ mô', quantity: '120', unit: 'Cuốn', location: 'Kệ C3', status: 'Bình thường' },
    ]);

    // Mock data for "Nhập kho"
    const [importData, setImportData] = useState([
        { 
            id: 'NK001', date: '10/4/2026', supplier: 'Nhà xuất bản Trẻ', items: '3 đầu sách', status: 'Đã duyệt',
            creator: 'Trần Văn B', phone: '0907654321', address: 'Quận 1, TP.HCM', note: 'Nhập sách đợt tháng 4',
            products: [
                { name: 'Đắc Nhân Tâm', qty: 100, unit: 'Cuốn', price: 80000, total: 8000000 },
                { name: 'Clean Code', qty: 20, unit: 'Cuốn', price: 250000, total: 5000000 }
            ],
            totalAmount: 13000000
        },
        { 
            id: 'NK002', date: '12/4/2026', supplier: 'NXB Giáo Dục', items: '2 đầu sách', status: 'Đã duyệt',
            creator: 'Nguyễn Thị C', phone: '0907654321', address: 'Quận 3, TP.HCM', note: 'Sách giáo khoa bổ sung',
            products: [
                { name: 'Toán lớp 12', qty: 200, unit: 'Cuốn', price: 15000, total: 3000000 },
                { name: 'Văn lớp 12', qty: 200, unit: 'Cuốn', price: 15000, total: 3000000 }
            ],
            totalAmount: 6000000
        },
        { id: 'NK003', date: '13/4/2026', supplier: 'Fahasa', items: '1 đầu sách', status: 'Chờ duyệt' },
    ]);

    // Mock data for "Xuất kho"
    const [exportData, setExportData] = useState([
        { 
            id: 'XK001', date: '11/4/2026', destination: 'Đại lý sách ABC', items: '2 đầu sách', status: 'Hoàn thành',
            creator: 'Nguyễn Văn A', phone: '0988123456', address: 'Quận 2, TP.HCM', note: 'Xuất hàng cho đại lý',
            products: [
                { name: 'Đắc Nhân Tâm', qty: 50, unit: 'Cuốn', price: 120000, total: 6000000 },
            ],
            totalAmount: 6000000
        },
        { id: 'XK002', date: '13/4/2026', destination: 'Trường ĐH Kinh Tế', items: '1 đầu sách', status: 'Chờ xuất kho' },
    ]);

    const handleViewSlip = (slip) => {
        setSelectedSlip(slip);
        setIsViewModalOpen(true);
    };

    const openConfirmModal = (type, target) => {
        setConfirmModal({ isOpen: true, type, target });
    };

    const handleConfirmAction = () => {
        const { type, target } = confirmModal;
        
        if (type === 'approve') {
            if (target.id.startsWith('NK')) {
                setImportData(importData.map(item => 
                    item.id === target.id ? { ...item, status: 'Đã duyệt' } : item
                ));
            } else {
                setExportData(exportData.map(item => 
                    item.id === target.id ? { ...item, status: 'Hoàn thành' } : item
                ));
            }
        } else if (type === 'delete') {
            if (target.id.startsWith('NK')) {
                setImportData(importData.filter(item => item.id !== target.id));
            } else {
                setExportData(exportData.filter(item => item.id !== target.id));
            }
        }
        
        setConfirmModal({ isOpen: false, type: '', target: null });
    };

    return (
        <div className="inventory-page">
            <header className="page-header">
                <div className="header-left">
                    <h1>Quản lý kho sách</h1>
                    <p>Theo dõi tồn kho, nhập xuất sách</p>
                </div>
                <div className="header-right">
                    <button className="btn-icon-square-ref"><FiRotateCw /></button>
                    {activeTab === 'import' && (
                        <button className="btn-primary" onClick={() => setIsImportModalOpen(true)}><FiPlus /> Tạo phiếu nhập</button>
                    )}
                    {activeTab === 'export' && (
                        <button className="btn-primary" onClick={() => setIsExportModalOpen(true)}><FiPlus /> Tạo phiếu xuất</button>
                    )}
                </div>
            </header>

            <nav className="page-tabs">
                <button 
                    className={activeTab === 'inventory' ? 'tab-item active' : 'tab-item'} 
                    onClick={() => setActiveTab('inventory')}
                >
                    Tồn kho
                </button>
                <button 
                    className={activeTab === 'import' ? 'tab-item active' : 'tab-item'} 
                    onClick={() => setActiveTab('import')}
                >
                    Nhập kho
                </button>
                <button 
                    className={activeTab === 'export' ? 'tab-item active' : 'tab-item'} 
                    onClick={() => setActiveTab('export')}
                >
                    Xuất kho
                </button>
            </nav>

            <main className="page-content">
                {activeTab === 'inventory' && (
                    <div className="card">
                        <div className="card-header">
                            <h2>Danh sách sách trong kho</h2>
                            <button className="btn-outline btn-export">
                                <FiDownload /> Xuất báo cáo
                            </button>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Tên sách</th>
                                    <th>Số lượng</th>
                                    <th>Đơn vị</th>
                                    <th>Vị trí kệ</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {inventoryData.map(item => (
                                    <tr key={item.id}>
                                        <td className="txt-bold">{item.name}</td>
                                        <td className="txt-bold">{item.quantity}</td>
                                        <td className="txt-light">{item.unit}</td>
                                        <td>{item.location}</td>
                                        <td>
                                            <span className={`badge ${item.status === 'Sắp hết' ? 'badge-danger' : 'badge-default'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'import' && (
                    <div className="card">
                        <div className="card-header">
                            <h2>Phiếu nhập kho</h2>
                            <button className="btn-primary" onClick={() => setIsImportModalOpen(true)}>
                                <FiPlus /> Tạo phiếu nhập
                            </button>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Mã phiếu</th>
                                    <th>Ngày nhập</th>
                                    <th>Nhà cung cấp (NXB)</th>
                                    <th>Số đầu sách</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {importData.map(item => (
                                    <tr key={item.id}>
                                        <td className="txt-bold">{item.id}</td>
                                        <td>{item.date}</td>
                                        <td>{item.supplier}</td>
                                        <td>{item.items}</td>
                                        <td>
                                            <span className={`badge ${item.status === 'Đã duyệt' ? 'badge-blue' : 'badge-gray'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-icons">
                                                <FiEye className="icon-action" onClick={() => handleViewSlip(item)} />
                                                {item.status === 'Chờ duyệt' && (
                                                    <>
                                                        <FiCheck className="icon-action icon-success" onClick={() => openConfirmModal('approve', item)} />
                                                        <FiX className="icon-action icon-danger" onClick={() => openConfirmModal('delete', item)} />
                                                    </>
                                                )}
                                                {item.status !== 'Chờ duyệt' && (
                                                     <FiX className="icon-action icon-danger" onClick={() => openConfirmModal('delete', item)} />
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'export' && (
                    <div className="card">
                        <div className="card-header">
                            <h2>Phiếu xuất kho</h2>
                            <button className="btn-primary" onClick={() => setIsExportModalOpen(true)}>
                                <FiPlus /> Tạo phiếu xuất
                            </button>
                        </div>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Mã phiếu</th>
                                    <th>Ngày xuất</th>
                                    <th>Đích đến (Đại lý)</th>
                                    <th>Số đầu sách</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {exportData.map(item => (
                                    <tr key={item.id}>
                                        <td className="txt-bold">{item.id}</td>
                                        <td>{item.date}</td>
                                        <td>{item.destination}</td>
                                        <td>{item.items}</td>
                                        <td>
                                            <span className={`badge ${item.status === 'Hoàn thành' ? 'badge-outline' : 'badge-gray'}`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-icons">
                                                <FiEye className="icon-action" onClick={() => handleViewSlip(item)} />
                                                {item.status === 'Chờ xuất kho' && (
                                                    <FiCheck className="icon-action icon-success" onClick={() => openConfirmModal('approve', item)} />
                                                )}
                                                <FiX className="icon-action icon-danger" onClick={() => openConfirmModal('delete', item)} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* Confirmation Modal */}
            {confirmModal.isOpen && (
                <div className="modal-overlay">
                    <div className="modal-box confirm-modal">
                        <div className="modal-body-confirm">
                            <div className={`confirm-icon ${confirmModal.type === 'delete' ? 'bg-red-light' : 'bg-blue-light'}`}>
                                {confirmModal.type === 'delete' ? <FiX className="txt-red" /> : <FiCheck className="txt-blue" />}
                            </div>
                            <h3>{confirmModal.type === 'delete' ? 'Xác nhận xóa' : 'Xác nhận duyệt'}</h3>
                            <p>
                                Bạn có chắc chắn muốn {confirmModal.type === 'delete' ? 'xóa' : 'duyệt'} phiếu 
                                <strong> {confirmModal.target?.id}</strong> không? 
                                {confirmModal.type === 'delete' && ' Hành động này không thể hoàn tác.'}
                            </p>
                        </div>
                        <div className="modal-footer-confirm">
                            <button className="btn-outline-simple" onClick={() => setConfirmModal({ isOpen: false, type: '', target: null })}>Hủy</button>
                            <button 
                                className={confirmModal.type === 'delete' ? 'btn-danger-confirm' : 'btn-primary-confirm'}
                                onClick={handleConfirmAction}
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Tạo phiếu nhập kho */}
            {isImportModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box small-modal">
                        <div className="modal-header-simple">
                            <h2>Tạo phiếu nhập kho sách</h2>
                            <button className="btn-close-modal" onClick={() => setIsImportModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body-simple">
                            <div className="form-group-simple">
                                <label>Nhà cung cấp (NXB)</label>
                                <div className="select-wrapper">
                                    <select defaultValue="1">
                                        <option value="1">Nhà xuất bản Trẻ</option>
                                        <option value="2">NXB Giáo Dục</option>
                                        <option value="3">Fahasa</option>
                                    </select>
                                    <FiChevronDown className="select-icon" />
                                </div>
                            </div>
                            <div className="form-group-simple">
                                <label>Đầu sách</label>
                                <div className="select-wrapper">
                                    <select defaultValue="1">
                                        <option value="1">Đắc Nhân Tâm</option>
                                        <option value="2">Clean Code</option>
                                        <option value="3">Lập trình Python cơ bản</option>
                                    </select>
                                    <FiChevronDown className="select-icon" />
                                </div>
                            </div>
                            <div className="form-group-simple">
                                <label>Số lượng (Cuốn)</label>
                                <input type="text" placeholder="Nhập số lượng" />
                            </div>
                        </div>
                        <div className="modal-footer-simple">
                            <button className="btn-outline-simple" onClick={() => setIsImportModalOpen(false)}>Hủy</button>
                            <button className="btn-primary-simple">Tạo phiếu</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Tạo phiếu xuất kho */}
            {isExportModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box small-modal">
                        <div className="modal-header-simple">
                            <h2>Tạo phiếu xuất kho sách</h2>
                            <button className="btn-close-modal" onClick={() => setIsExportModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body-simple">
                            <div className="form-group-simple">
                                <label>Đích đến (Đại lý/Trường học)</label>
                                <div className="select-wrapper">
                                    <select defaultValue="1">
                                        <option value="1">Đại lý sách ABC</option>
                                        <option value="2">Trường ĐH Kinh Tế</option>
                                    </select>
                                    <FiChevronDown className="select-icon" />
                                </div>
                            </div>
                            <div className="form-group-simple">
                                <label>Đầu sách</label>
                                <div className="select-wrapper">
                                    <select defaultValue="1">
                                        <option value="1">Đắc Nhân Tâm</option>
                                        <option value="2">Kinh tế học vĩ mô</option>
                                    </select>
                                    <FiChevronDown className="select-icon" />
                                </div>
                            </div>
                            <div className="form-group-simple">
                                <label>Số lượng (Cuốn)</label>
                                <input type="text" placeholder="Nhập số lượng" />
                            </div>
                        </div>
                        <div className="modal-footer-simple">
                            <button className="btn-outline-simple" onClick={() => setIsExportModalOpen(false)}>Hủy</button>
                            <button className="btn-primary-simple">Tạo phiếu</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Chi tiết phiếu */}
            {isViewModalOpen && selectedSlip && (
                <div className="modal-overlay">
                    <div className="modal-box detail-modal">
                        <div className="modal-header-simple">
                            <h2>Chi tiết phiếu {selectedSlip.id.startsWith('NK') ? 'nhập' : 'xuất'} kho {selectedSlip.id}</h2>
                            <button className="btn-close-modal" onClick={() => setIsViewModalOpen(false)}>
                                <FiX />
                            </button>
                        </div>
                        <div className="modal-body-detail">
                            <div className="detail-grid-info">
                                <div className="info-item">
                                    <label>Ngày {selectedSlip.id.startsWith('NK') ? 'nhập' : 'xuất'}</label>
                                    <div className="val">{selectedSlip.date}</div>
                                </div>
                                <div className="info-item">
                                    <label>Người thực hiện</label>
                                    <div className="val">{selectedSlip.creator || '---'}</div>
                                </div>
                                <div className="info-item">
                                    <label>{selectedSlip.id.startsWith('NK') ? 'Đối tác (NXB)' : 'Đích đến (Đại lý)'}</label>
                                    <div className="val">{selectedSlip.supplier || selectedSlip.destination}</div>
                                </div>
                                <div className="info-item">
                                    <label>Số điện thoại liên hệ</label>
                                    <div className="val">{selectedSlip.phone || '---'}</div>
                                </div>
                                <div className="info-item full-width">
                                    <label>Địa chỉ</label>
                                    <div className="val">{selectedSlip.address || '---'}</div>
                                </div>
                            </div>

                            <div className="detail-products-section">
                                <label>Danh sách đầu sách</label>
                                <div className="product-table-wrapper">
                                    <table className="product-table">
                                        <thead>
                                            <tr>
                                                <th>Tên sách</th>
                                                <th>Số lượng</th>
                                                <th>Giá nhập/xuất</th>
                                                <th>Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedSlip.products?.map((p, idx) => (
                                                <tr key={idx}>
                                                    <td>{p.name}</td>
                                                    <td>{p.qty} {p.unit}</td>
                                                    <td>{p.price.toLocaleString('vi-VN')}đ</td>
                                                    <td className="txt-bold">{p.total.toLocaleString('vi-VN')}đ</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="detail-summary">
                                <div className="summary-row total">
                                    <span>Tổng giá trị phiếu:</span>
                                    <span className="total-val">{selectedSlip.totalAmount?.toLocaleString('vi-VN')}đ</span>
                                </div>
                                <div className="summary-row note">
                                    <label>Ghi chú nghiệp vụ</label>
                                    <p>{selectedSlip.note || 'Không có ghi chú'}</p>
                                </div>
                                <div className="summary-row status">
                                    <label>Trạng thái xử lý</label>
                                    <span className={`badge ${selectedSlip.status === 'Đã duyệt' || selectedSlip.status === 'Hoàn thành' ? 'badge-blue' : 'badge-gray'}`}>
                                        {selectedSlip.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer-detail">
                            <button className="btn-close-large" onClick={() => setIsViewModalOpen(false)}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default InventoryManager;