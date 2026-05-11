import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import BookInventory from './pages/BookInventory';
import Dashboard from './pages/Dashboard';
import CategoryManager from './pages/CategoryManager';
import InventoryManager from './pages/InventoryManager';
import OrderManager from './pages/OrderManager';
import NotificationManager from './pages/NotificationManager';
import { FiBell } from 'react-icons/fi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function App() {
  const [currentMenu, setCurrentMenu] = useState('dashboard');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications`);
      const data = await res.json();
      const unread = data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  return (
    <div style={{ display: 'flex', position: 'relative' }}>
      {/* Nút thông báo toàn cầu */}
      <div className="header-noti-wrapper global-bell" onClick={() => setCurrentMenu('notifications')}>
          <FiBell className="bell-icon-top" />
          {unreadCount > 0 && <span className="bell-badge-top">{unreadCount}</span>}
      </div>

      <Sidebar currentMenu={currentMenu} setCurrentMenu={setCurrentMenu} unreadCount={unreadCount} />

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