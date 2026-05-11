import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Sequelize, Op } from 'sequelize';
import sequelize from './db.js';
import { Category, Book, Order, OrderItem, StockCard, WarehouseReceipt, WarehouseReceiptItem, Notification } from './models.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 1. Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// --- API THÔNG BÁO ---
app.get('/api/notifications', async (req, res) => {
  try {
    console.log('--- NHẬN YÊU CẦU LẤY THÔNG BÁO ---');
    const notifications = await Notification.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50
    });
    console.log(`--- ĐÃ TRẢ VỀ ${notifications.length} THÔNG BÁO ---`);
    res.json(notifications);
  } catch (error) {
    console.error('LỖI API NOTIFICATIONS:', error);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/:id/read', async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { id: req.params.id } });
    res.json({ message: 'Đã đánh dấu đã đọc' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/read-all', async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { isRead: false } });
    res.json({ message: 'Đã đánh dấu tất cả là đã đọc' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/notifications/clear', async (req, res) => {
  try {
    await Notification.destroy({ where: {} });
    res.json({ message: 'Đã xóa tất cả thông báo' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. INVENTORY HISTORY (ALL) - Moved to top for priority
app.get('/api/inventory/history', async (req, res) => {
  try {
    const history = await StockCard.findAll({
      include: [Book],
      order: [['createdAt', 'DESC']]
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. CATEGORIES CRUD
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Book, attributes: ['id'] }]
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/categories', async (req, res) => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    await category.update(req.body);
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/categories/:id', async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: 'Không tìm thấy danh mục' });
    await category.destroy();
    res.json({ message: 'Đã xóa danh mục thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. BOOKS CRUD
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.findAll({ include: [Category] });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const { id, title, categoryId } = req.body;
    if (!id || !title) {
      return res.status(400).json({ error: 'Mã sách và tên sách là bắt buộc' });
    }
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Không tìm thấy sách' });
    await book.update(req.body);
    res.json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/books/:id', async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return res.status(404).json({ error: 'Không tìm thấy sách' });
    await book.destroy();
    res.json({ message: 'Đã xóa sách thành công' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. ORDERS CRUD
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.findAll({ include: [OrderItem] });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id, customer, items } = req.body; // items: [{ bookId, qty, price }]
    
    const order = await Order.create(req.body, { transaction: t });
    
    let totalAmount = 0;
    for (const item of items) {
      const book = await Book.findByPk(item.bookId, { transaction: t });
      if (!book || book.quantity < item.qty) {
        throw new Error(`Sách ${item.bookId} không đủ tồn kho`);
      }
      
      const itemTotal = item.qty * item.price;
      totalAmount += itemTotal;
      
      await OrderItem.create({
        orderId: order.id,
        bookId: item.bookId,
        qty: item.qty,
        price: item.price,
        total: itemTotal
      }, { transaction: t });
      
      // Cập nhật kho
      const oldStock = book.quantity;
      book.quantity -= item.qty;
      await book.save({ transaction: t });
      
      // Ghi thẻ kho
      await StockCard.create({
        bookId: book.id,
        type: 'BAN_HANG',
        change: -item.qty,
        currentStock: book.quantity,
        note: `Bán theo đơn hàng ${order.id}`
      }, { transaction: t });
    }
    
    order.totalAmount = totalAmount;
    await order.save({ transaction: t });
    
    await t.commit();
    res.status(201).json(order);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
});

// 5. STOCK TRANSACTIONS (NHAP/XUAT)
app.post('/api/inventory/adjust', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { bookId, type, quantity, note } = req.body;
    const book = await Book.findByPk(bookId, { transaction: t });
    if (!book) throw new Error('Không tìm thấy sách');
    
    const change = type === 'NHAP' ? quantity : -quantity;
    if (type === 'XUAT' && book.quantity < quantity) {
      throw new Error('Không đủ tồn kho để xuất');
    }
    
    book.quantity += change;
    await book.save({ transaction: t });
    
    const sc = await StockCard.create({
      bookId,
      type,
      change,
      currentStock: book.quantity,
      note
    }, { transaction: t });
    
    await t.commit();
    res.json(sc);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
});

// 6. WAREHOUSE RECEIPTS (NEW PROFESSIONAL SYSTEM)
app.get('/api/warehouse/receipts', async (req, res) => {
  try {
    const receipts = await WarehouseReceipt.findAll({
      include: [{ model: WarehouseReceiptItem, include: [Book] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(receipts);
  } catch (error) {
    console.error('LỖI GET RECEIPTS:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/warehouse/receipts', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id, type, partnerName, creatorName, items, note } = req.body;
    
    const receipt = await WarehouseReceipt.create({
      id: id || `${type === 'NHAP' ? 'PN' : 'PX'}${Date.now()}`,
      type,
      partnerName,
      creatorName,
      note
    }, { transaction: t });

    let totalAmount = 0;
    for (const item of items) {
      const book = await Book.findByPk(item.bookId, { transaction: t });
      if (!book) throw new Error(`Không tìm thấy sách mã ${item.bookId}`);

      const itemTotal = item.quantity * (item.price || book.price);
      totalAmount += itemTotal;

      await WarehouseReceiptItem.create({
        receiptId: receipt.id,
        bookId: item.bookId,
        quantity: item.quantity,
        price: item.price || book.price,
        total: itemTotal
      }, { transaction: t });

      const change = type === 'NHAP' ? item.quantity : -item.quantity;
      if (type === 'XUAT' && book.quantity < item.quantity) {
        throw new Error(`Sách ${book.title} không đủ tồn kho để xuất`);
      }
      
      book.quantity += change;
      await book.save({ transaction: t });

      await StockCard.create({
        bookId: book.id,
        type: type,
        change: change,
        currentStock: book.quantity,
        note: `Theo phiếu ${receipt.id}: ${note || ''}`
      }, { transaction: t });
    }

    receipt.totalAmount = totalAmount;
    await receipt.save({ transaction: t });

    await t.commit();

    // TẠO THÔNG BÁO SAU KHI LẬP PHIẾU THÀNH CÔNG
    try {
      const displayAmount = (totalAmount || 0).toLocaleString('vi-VN');
      const displayId = receipt?.id || 'N/A';
      const displayType = type === 'NHAP' ? 'nhập' : 'xuất';

      console.log('--- DEBUG NOTIFICATION ---', { 
        title: `Phiếu ${displayType} kho thành công`,
        message: `Phiếu ${displayId} đã được tạo với tổng tiền ${displayAmount}đ`,
        type: 'SUCCESS'
      });

      const newNoti = await Notification.create({
        title: `Phiếu ${displayType} kho thành công`,
        message: `Phiếu ${displayId} đã được tạo với tổng tiền ${displayAmount}đ`,
        type: 'SUCCESS'
      });
      console.log('--- ĐÃ TẠO THÔNG BÁO THÀNH CÔNG --- ID:', newNoti.id);

      // Kiểm tra tồn kho thấp cho các mặt hàng trong phiếu
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const book = await Book.findByPk(item.bookId);
          if (book && book.quantity < 10) {
            console.log('--- CẢNH BÁO TỒN KHO THẤP ---', book.title, 'SL:', book.quantity);
            await Notification.create({
              title: 'Cảnh báo tồn kho thấp',
              message: `Sách "${book.title}" hiện chỉ còn ${book.quantity} cuốn trong kho.`,
              type: 'WARNING'
            });
          }
        }
      }
    } catch (notifyError) {
      console.error('!!! LỖI TẠO THÔNG BÁO !!!:', notifyError.message);
      console.error(notifyError.stack);
    }

    res.status(201).json(receipt);
  } catch (error) {
    if (t) await t.rollback();
    res.status(400).json({ error: error.message });
  }
});

// 6. PHIẾU NHẬP XUẤT CHI TIẾT
app.get('/api/warehouse/receipts/:id', async (req, res) => {
  try {
    const receipt = await WarehouseReceipt.findByPk(req.params.id, {
      include: [{ model: WarehouseReceiptItem, include: [Book] }]
    });
    if (!receipt) return res.status(404).json({ error: 'Không tìm thấy phiếu' });
    res.json(receipt);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. DASHBOARD STATS
app.get('/api/stats', async (req, res) => {
  console.log('--- Đang nhận yêu cầu lấy thống kê Dashboard ---');
  try {
    const totalBooks = await Book.count();
    const totalCategories = await Category.count();
    const totalOrders = await Order.count();
    
    const orders = await Order.findAll();
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // 1. Dữ liệu biểu đồ phân bổ thể loại (Dùng cho Pie Chart)
    const categoryStats = await Category.findAll({ include: [{ model: Book }] });
    const categoryData = categoryStats.map(cat => ({
      name: cat.name,
      value: cat.Books ? cat.Books.length : 0
    }));

    // 2. Dữ liệu Nhập/Xuất 6 tháng gần nhất (Dùng cho Area/Bar Chart)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const history = await StockCard.findAll({
      where: {
        createdAt: { [Op.gte]: sixMonthsAgo }
      }
    });

    const monthNames = ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9", "T10", "T11", "T12"];
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const monthIdx = d.getMonth();
      const year = d.getFullYear();
      
      const imports = history.filter(h => 
        new Date(h.createdAt).getMonth() === monthIdx && 
        new Date(h.createdAt).getFullYear() === year &&
        h.type === 'NHAP'
      ).reduce((sum, h) => sum + h.change, 0);

      const exports = history.filter(h => 
        new Date(h.createdAt).getMonth() === monthIdx && 
        new Date(h.createdAt).getFullYear() === year &&
        h.type === 'XUAT'
      ).reduce((sum, h) => sum + Math.abs(h.change), 0);

      monthlyData.push({
        name: `${monthNames[monthIdx]}`,
        nhap: imports,
        xuat: exports
      });
    }

    // 3. Hoạt động gần đây (10 bản ghi mới nhất)
    const recentStock = await StockCard.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [Book]
    });

    const recentActivities = recentStock.map(s => ({
      id: s.id,
      type: s.type, // 'NHAP', 'XUAT', 'BAN_HANG'
      title: s.Book?.title || 'Sách đã xóa',
      change: s.change,
      time: s.createdAt,
      note: s.note
    }));

    res.json({
      totalBooks,
      totalCategories,
      totalOrders,
      totalRevenue,
      categoryData,
      monthlyData,
      recentActivities
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/books/:id/history', async (req, res) => {
  try {
    const history = await StockCard.findAll({
      where: { bookId: req.params.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// SYNC & START
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database connection error:', err);
});
