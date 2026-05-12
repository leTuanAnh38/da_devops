import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { Sequelize, Op } from 'sequelize';
import sequelize from './db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Category, Book, Order, OrderItem, StockCard, WarehouseReceipt, WarehouseReceiptItem, Notification, User } from './models.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_2024';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// 1. Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// --- AUTHENTICATION MIDDLEWARE ---
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Vui lòng đăng nhập để tiếp tục' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Phiên làm việc đã hết hạn' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, fullName, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword, fullName, role });
    res.status(201).json({ message: 'Tạo tài khoản thành công' });
  } catch (error) {
    res.status(400).json({ error: 'Tên đăng nhập đã tồn tại' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Sai tên đăng nhập hoặc mật khẩu' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, fullName: user.fullName },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, role: user.role, fullName: user.fullName, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'fullName', 'role', 'avatar']
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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
    const { page, limit, search, categoryId, status } = req.query;
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const offset = (p - 1) * l;

    const where = {};
    
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { id: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (status) {
      // Vì status là VIRTUAL, ta không thể lọc trực tiếp trong DB bằng where.
      // Tuy nhiên, logic status dựa trên quantity, nên ta lọc theo quantity.
      if (status === 'Còn hàng') where.quantity = { [Op.gt]: 5 };
      if (status === 'Sắp hết') where.quantity = { [Op.lte]: 5 };
    }

    const { count, rows } = await Book.findAndCountAll({ 
      where,
      include: [Category],
      limit: l,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / l),
      currentPage: p,
      books: rows
    });
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
    const { page, limit, search, status } = req.query;
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 10;
    const offset = (p - 1) * l;

    const where = {};
    if (search) {
      where[Op.or] = [
        { id: { [Op.iLike]: `%${search}%` } },
        { customer: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (status && status !== 'all') {
      where.status = status;
    }

    const { count, rows } = await Order.findAndCountAll({ 
      where,
      include: [{ model: OrderItem, include: [Book] }],
      limit: l,
      offset: offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / l),
      currentPage: p,
      orders: rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { customer, phone, address, note, items } = req.body;
    
    // Tạo đơn hàng (Chưa trừ kho)
    const order = await Order.create({
      id: `DH${Date.now()}`,
      customer,
      phone,
      address,
      note,
      status: 'Chờ xác nhận'
    }, { transaction: t });
    
    let totalAmount = 0;
    for (const item of items) {
      const book = await Book.findByPk(item.bookId, { transaction: t });
      if (!book) throw new Error(`Không tìm thấy sách mã ${item.bookId}`);
      
      const itemTotal = item.qty * (item.price || book.price);
      totalAmount += itemTotal;
      
      await OrderItem.create({
        orderId: order.id,
        bookId: item.bookId,
        qty: item.qty,
        price: item.price || book.price,
        total: itemTotal
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

app.put('/api/orders/:id', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const order = await Order.findByPk(req.params.id, {
      include: [OrderItem]
    });
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });

    const oldStatus = order.status;
    const newStatus = req.body.status;

    // Cập nhật thông tin cơ bản
    await order.update(req.body, { transaction: t });

    // TỰ ĐỘNG HÓA: KHI CHUYỂN SANG "HOÀN THÀNH"
    if (oldStatus !== 'Hoàn thành' && newStatus === 'Hoàn thành') {
      // 1. Tạo Phiếu Xuất Kho tự động
      const receipt = await WarehouseReceipt.create({
        id: `PX_AUTO_${order.id}`,
        type: 'XUAT',
        partnerName: order.customer,
        partnerPhone: order.phone,
        partnerAddress: order.address,
        creatorName: 'Hệ thống (Tự động)',
        totalAmount: order.totalAmount,
        note: `Xuất kho tự động cho đơn hàng ${order.id}`
      }, { transaction: t });

      // 2. Xử lý từng mặt hàng: Trừ kho + Tạo chi tiết phiếu + Ghi thẻ kho
      for (const item of order.OrderItems) {
        const book = await Book.findByPk(item.bookId, { transaction: t });
        if (!book) throw new Error(`Không tìm thấy sách ${item.bookId}`);
        if (book.quantity < item.qty) {
          throw new Error(`Sách "${book.title}" không đủ tồn kho để hoàn thành đơn hàng (Cần: ${item.qty}, Hiện có: ${book.quantity})`);
        }

        // Trừ kho
        book.quantity -= item.qty;
        await book.save({ transaction: t });

        // Chi tiết phiếu xuất
        await WarehouseReceiptItem.create({
          receiptId: receipt.id,
          bookId: item.bookId,
          quantity: item.qty,
          price: item.price,
          total: item.total
        }, { transaction: t });

        // Ghi thẻ kho
        await StockCard.create({
          bookId: book.id,
          type: 'XUAT',
          change: -item.qty,
          currentStock: book.quantity,
          note: `Xuất kho tự động (Đơn hàng ${order.id})`
        }, { transaction: t });
      }

      // 3. Tạo thông báo thành công
      await Notification.create({
        title: 'Xuất kho tự động thành công',
        message: `Đơn hàng ${order.id} đã hoàn thành. Hệ thống đã tự động tạo phiếu xuất kho PX_AUTO_${order.id} và cập nhật tồn kho.`,
        type: 'SUCCESS'
      }, { transaction: t });
    }

    await t.commit();
    res.json(order);
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Không tìm thấy đơn hàng' });
    
    // Nếu đơn đã hoàn thành thì cân nhắc có cho xóa không? Thường là không.
    if (order.status === 'Hoàn thành') {
      return res.status(400).json({ error: 'Không thể xóa đơn hàng đã hoàn thành và xuất kho' });
    }

    await order.destroy();
    res.json({ message: 'Đã xóa đơn hàng' });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await WarehouseReceipt.findAndCountAll({
      include: [{ model: WarehouseReceiptItem, include: [Book] }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      receipts: rows
    });
  } catch (error) {
    console.error('LỖI GET RECEIPTS:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/warehouse/receipts', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id, type, partnerName, partnerPhone, partnerAddress, creatorName, items, note } = req.body;
    
    const receipt = await WarehouseReceipt.create({
      id: id || `${type === 'NHAP' ? 'PN' : 'PX'}${Date.now()}`,
      type,
      partnerName,
      partnerPhone,
      partnerAddress,
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
    
    const lowStockCount = await Book.count({
      where: {
        quantity: { [Op.lte]: 5 }
      }
    });

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

      const revenue = orders.filter(o => 
        new Date(o.createdAt).getMonth() === monthIdx && 
        new Date(o.createdAt).getFullYear() === year
      ).reduce((sum, o) => sum + (o.totalAmount || 0), 0);

      monthlyData.push({
        name: `${monthNames[monthIdx]}`,
        nhap: imports,
        xuat: exports,
        doanhthu: revenue
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
      lowStockCount,
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
