import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiTrendingUp, FiBox, FiAlertCircle, FiDollarSign, FiClock, FiCornerUpLeft, FiArrowUp } from 'react-icons/fi';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './Dashboard.css';

const Dashboard = ({ setCurrentMenu }) => {
    const [stats, setStats] = useState({ 
        totalCategories: 0, 
        totalBooks: 0, 
        lowStock: 0, 
        totalRevenue: 0 
    });
    const [monthlyData, setMonthlyData] = useState([]);
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${API_URL}/stats`);
                const data = response.data;
                
                setStats({
                    totalCategories: data.totalCategories,
                    totalBooks: data.totalBooks,
                    lowStock: data.recentActivities.filter(a => a.type === 'XUAT' && a.change < -50).length || 0, // Logic giả lập
                    totalRevenue: data.totalRevenue
                });
                
                setMonthlyData(data.monthlyData);
                setActivities(data.recentActivities);
                setLoading(false);
            } catch (err) {
                console.error("LỖI Dashboard:", err);
                setError("Không thể kết nối đến máy chủ.");
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
    };

    const formatTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' ' + d.toLocaleDateString('vi-VN');
    };

    if (loading) return <div className="dashboard-container loading-ui"><h2>Đang tải dữ liệu tổng quan...</h2></div>;
    if (error) return <div className="dashboard-container error-ui"><h3>{error}</h3></div>;

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
                        <p>Tổng sách tồn kho</p>
                        <h3>{stats.totalBooks.toLocaleString()} <span>cuốn</span></h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-red"><FiAlertCircle /></div>
                    <div className="stat-info">
                        <p>Sách sắp hết hàng</p>
                        <h3>{stats.lowStock} <span>đầu sách</span></h3>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon bg-yellow"><FiDollarSign /></div>
                    <div className="stat-info">
                        <p>Tổng doanh thu</p>
                        <h3 style={{ fontSize: '18px' }}>{formatCurrency(stats.totalRevenue)}</h3>
                    </div>
                </div>
            </div>

            <div className="dashboard-content">
                <div className="chart-section">
                    <h3>Thống kê Nhập / Xuất (6 tháng)</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280'}} />
                                <Tooltip cursor={{fill: '#F3F4F6'}} />
                                <Legend wrapperStyle={{ paddingTop: '20px' }}/>
                                <Bar dataKey="nhap" name="Nhập kho" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={32} />
                                <Bar dataKey="xuat" name="Xuất kho" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="activity-section">
                    <h3>Hoạt động gần đây</h3>
                    <div className="activity-list-container">
                        {activities.length > 0 ? (
                            <ul className="activity-list">
                                {activities.map((act, index) => (
                                    <li key={index} className="activity-item">
                                        <div className={`activity-type-icon ${act.type === 'NHAP' ? 'green' : act.type === 'BAN_HANG' ? 'blue' : 'red'}`}>
                                            {act.type === 'NHAP' ? <FiArrowUp /> : act.type === 'BAN_HANG' ? <FiDollarSign /> : <FiCornerUpLeft />}
                                        </div>
                                        <div className="activity-details">
                                            <span className="act-title">{act.title}</span>
                                            <span className="act-desc">{act.note || 'Không có ghi chú'}</span>
                                        </div>
                                        <div className="activity-meta">
                                            <span className={`act-qty ${act.change > 0 ? 'txt-green' : 'txt-red'}`}>
                                                {act.change > 0 ? `+${act.change}` : act.change}
                                            </span>
                                            <span className="act-time">{formatTime(act.time)}</span>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <div className="empty-activity">Chưa có hoạt động nào được ghi nhận.</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;