import React, { useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './LoginPage.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LoginPage = ({ onLoginSuccess }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await axios.post(`${API_URL}/auth/login`, { username, password });
            const { token, user } = res.data;

            // Lưu vào localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));

            Swal.fire({
                icon: 'success',
                title: 'Đăng nhập thành công',
                text: `Chào mừng ${user.fullName || user.username}!`,
                timer: 1500,
                showConfirmButton: false
            });

            onLoginSuccess(user);
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Thất bại',
                text: err.response?.data?.error || 'Lỗi kết nối máy chủ'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-box">
                <h2>WMS Admin</h2>
                <p>Hệ thống quản lý kho hàng thông minh</p>
                
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="input-field">
                        <label>Tên đăng nhập</label>
                        <input 
                            type="text" 
                            placeholder="Nhập tài khoản..." 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="input-field">
                        <label>Mật khẩu</label>
                        <input 
                            type="password" 
                            placeholder="Nhập mật khẩu..." 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'}
                    </button>
                </form>

                <div className="login-footer">
                    &copy; 2024 Warehouse Management System
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
