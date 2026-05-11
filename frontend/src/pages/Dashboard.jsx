import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrendingUp, FiBox, FiAlertCircle, FiDollarSign, FiBell } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = ({ setCurrentMenu }) => {
    // 1. STATES QUẢN LÝ DỮ LIỆU TỪ BACKEND
    const [stats, setStats] = useState({ totalCategories: 0, totalBooks: 0, lowStock: 0, totalValue: 0 });
    const [chartData, setChartData] = useState([]);
    const [activities, setActivities] = useState([]);
    
    // 2. STATES QUẢN LÝ TRẠNG THÁI UI
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL;

    // 3. GỌI API KHI COMPONENT MOUNT
    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            setError(null);
            try {
                // =============== CODE GỌI API THẬT (Sẽ mở comment khi Backend làm xong) ===============
                /*
                const response = await axios.get(`${API_URL}/dashboard`);
                const data = response.data;
                setStats(data.stats);
                setChartData(data.chartData);
                setActivities(data.recentActivities);
                setLoading(false);
                */

                // =============== MÔ PHỎNG API CHẬM KHI CHƯA CÓ BACKEND ===============
                // Giả lập mạng bị trễ 1 giây để test hiệu ứng Loading
                setTimeout(() => {
                    // Dữ liệu này giả lập cấu hình JSON mà Backend sẽ trả về
                    const mockDataFromBackend = {
                        stats: {
                            totalCategories: 145,
                            totalBooks: 3420,
                            lowStock: 12,
                            totalValue: 240500000
                        },
                        chartData: [
                            { name: 'Tháng 1', nhap: 4000, xuat: 2400 },
                            { name: 'Tháng 2', nhap: 3000, xuat: 1398 },
                            { name: 'Tháng 3', nhap: 2000, xuat: 9800 },
                            { name: 'Tháng 4', nhap: 2780, xuat: 3908 },
                            { name: 'Tháng 5', nhap: 1890, xuat: 4800 },
                            { name: 'Tháng 6', nhap: 2390, xuat: 3800 },
                        ],
                        recentActivities: [
                            { id: 1, action: 'Nhập kho', item: 'Lập trình Python cơ bản', qty: '+50', time: '10 phút trước', color: 'text-success' },
                            { id: 2, action: 'Xuất kho', item: 'Đắc Nhân Tâm', qty: '-15', time: '1 giờ trước', color: 'text-danger' },
                            { id: 3, action: 'Thêm mới', item: 'Clean Code', qty: '+40', time: '3 giờ trước', color: 'text-primary' },
                            { id: 4, action: 'Xuất kho', item: 'Kinh tế học vĩ mô', qty: '-5', time: '1 ngày trước', color: 'text-danger' },
                        ]
                    };

                    setStats(mockDataFromBackend.stats);
                    setChartData(mockDataFromBackend.chartData);
                    setActivities(mockDataFromBackend.recentActivities);
                    setLoading(false);
                }, 1000); // 1 giây

            } catch (err) {
                console.error("LỖI L4 (Frontend) -> Lỗi fetch dữ liệu Dashboard:", err);
                setError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Hàm tiện ích format tiền tệ
    const formatCurrency = (value) => {
        if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M';
        return new Intl.NumberFormat('vi-VN').format(value);
    };

    // --- HIỂN THỊ KHI ĐANG TẢI HOẶC LỖI ---
    if (loading) {
        return (
            <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <h2 style={{ color: '#6B7280' }}>Đang tải dữ liệu tổng quan...</h2>
            </div>
        );
    }

    if (error) {
        return (
            <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ padding: '20px', backgroundColor: '#FEE2E2', color: '#DC2626', borderRadius: '8px' }}>
                    <h3>Lỗi hệ thống</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // --- HIỂN THỊ KHI ĐÃ CÓ DỮ LIỆU TỪ BACKEND ---
    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h1>Tổng quan hệ thống</h1>
                    <p>Theo dõi tình hình kho sách và biến động kinh doanh</p>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon bg-blue"><FiBox /></div>
                    <div className="stat-info">
                        <p>Tổng loại sách</p>
                        <h3>{stats.totalCategories}</h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-green"><FiTrendingUp /></div>
                    <div className="stat-info">
                        <p>Tổng sách trong kho</p>
                        <h3>{new Intl.NumberFormat('vi-VN').format(stats.totalBooks)} <span>cuốn</span></h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-red"><FiAlertCircle /></div>
                    <div className="stat-info">
                        <p>Sắp hết hàng</p>
                        <h3>{stats.lowStock} <span>loại</span></h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-yellow"><FiDollarSign /></div>
                    <div className="stat-info">
                        <p>Giá trị kho (Ước tính)</p>
                        <h3>{formatCurrency(stats.totalValue)} <span>VNĐ</span></h3>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="chart-section">
                    <h3>Thống kê Nhập / Xuất (6 tháng)</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                                <Tooltip cursor={{fill: '#F3F4F6'}} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                                <Bar dataKey="nhap" name="Nhập kho" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={24} />
                                <Bar dataKey="xuat" name="Xuất kho" fill="#10B981" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="activity-section">
                    <h3>Hoạt động gần đây</h3>
                    <ul className="activity-list">
                        {activities.map(act => (
                            <li key={act.id} className="activity-item">
                                <div className="activity-details">
                                    <span className="act-title">{act.action}</span>
                                    <span className="act-desc">{act.item}</span>
                                </div>
                                <div className="activity-meta">
                                    <span className={`act-qty ${act.color}`}>{act.qty}</span>
                                    <span className="act-time">{act.time}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;