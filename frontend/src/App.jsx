import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Swal from 'sweetalert2';
import BookInventory from './pages/BookInventory';
import Dashboard from './pages/Dashboard';
import CategoryManager from './pages/CategoryManager';
import InventoryManager from './pages/InventoryManager';
import OrderManager from './pages/OrderManager';
import NotificationManager from './pages/NotificationManager';
import LoginPage from './pages/LoginPage';
import { FiBell } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [unreadCount, setUnreadCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Kiểm tra token cũ trong localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    if (!localStorage.getItem('token')) return; // Không fetch nếu chưa đăng nhập
    try {
      const res = await fetch(`${API_URL}/notifications`);
      const data = await res.json();
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLoginSuccess = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn đăng xuất?',
      text: "Phiên làm việc hiện tại sẽ kết thúc.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4F46E5',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Đăng xuất ngay',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
        setUser(null);
      }
    });
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div style={{ display: 'flex', position: 'relative' }}>
      {/* Nút thông báo toàn cầu */}
      <div className="header-noti-wrapper global-bell" onClick={() => setCurrentMenu('notifications')}>
          <FiBell className="bell-icon-top" />
          {unreadCount > 0 && <span className="bell-badge-top">{unreadCount}</span>}
      </div>

      <Sidebar 
        currentMenu={currentMenu} 
        setCurrentMenu={setCurrentMenu} 
        unreadCount={unreadCount} 
        user={user}
        onLogout={handleLogout}
      />

      <div style={{ flex: 1, marginLeft: '240px' }}>
        {currentMenu === 'dashboard' && <Dashboard setCurrentMenu={setCurrentMenu} />}
        {currentMenu === 'products' && <BookInventory setCurrentMenu={setCurrentMenu} />}
        {currentMenu === 'categories' && <CategoryManager setCurrentMenu={setCurrentMenu} />}
        {currentMenu === 'inventory' && <InventoryManager setCurrentMenu={setCurrentMenu} />}
        {currentMenu === 'orders' && <OrderManager setCurrentMenu={setCurrentMenu} />}
        {currentMenu === 'notifications' && <NotificationManager />}

        {currentMenu === 'units' && (
          <div style={{ padding: '40px', fontSize: '20px', color: '#6B7280' }}>
            Giao diện <b>{currentMenu}</b> đang được xây dựng...
          </div>
        )}
      </div>
    </div>
  );
}

export default App;