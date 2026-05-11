import sequelize from './db.js';
import { Category, Book, Order, OrderItem, StockCard } from './models.js';

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database cleared and synced.');

    // 1. Seed Categories
    const categories = await Category.bulkCreate([
      { id: 'CAT001', name: 'Công nghệ thông tin', slug: 'cntt', description: 'Sách về lập trình, mạng, AI...' },
      { id: 'CAT002', name: 'Kinh doanh & Đầu tư', slug: 'kinh-doanh', description: 'Quản trị, tài chính, khởi nghiệp' },
      { id: 'CAT003', name: 'Văn học - Nghệ thuật', slug: 'van-hoc', description: 'Tiểu thuyết, thơ, hội họa' },
      { id: 'CAT004', name: 'Kỹ năng sống', slug: 'ky-nang', description: 'Phát triển bản thân, giao tiếp' },
      { id: 'CAT005', name: 'Lịch sử - Địa lý', slug: 'lich-su', description: 'Kiến thức lịch sử Việt Nam và thế giới' },
    ]);
    console.log('Categories seeded.');

    // 2. Seed Books
    const books = await Book.bulkCreate([
      { id: '#001', title: 'Lập trình Python cơ bản', categoryId: 'CAT001', price: 150000, quantity: 50, unit: 'Cuốn' },
      { id: '#002', title: 'Kỹ năng giao tiếp đỉnh cao', categoryId: 'CAT004', price: 120000, quantity: 120, unit: 'Cuốn' },
      { id: '#003', title: 'Đắc Nhân Tâm', categoryId: 'CAT003', price: 100000, quantity: 15, unit: 'Cuốn' },
      { id: '#004', title: 'Kinh tế học vĩ mô', categoryId: 'CAT002', price: 200000, quantity: 30, unit: 'Cuốn' },
      { id: '#005', title: 'Lịch sử Việt Nam tóm tắt', categoryId: 'CAT005', price: 180000, quantity: 80, unit: 'Cuốn' },
      { id: '#006', title: 'Clean Code', categoryId: 'CAT001', price: 250000, quantity: 40, unit: 'Cuốn' },
      { id: '#007', title: 'Nhà Lãnh Đạo Không Chức Danh', categoryId: 'CAT002', price: 110000, quantity: 2, unit: 'Cuốn' },
    ]);
    console.log('Books seeded.');

    // 3. Seed initial Stock Cards
    for (const book of books) {
      await StockCard.create({
        bookId: book.id,
        type: 'NHAP',
        change: book.quantity,
        currentStock: book.quantity,
        note: 'Khởi tạo kho ban đầu'
      });
    }
    console.log('Stock Cards seeded.');

    // 4. Seed some Orders
    const order1 = await Order.create({
      id: 'DH001',
      customer: 'Nhà sách Fahasa Quận 1',
      phone: '0901234567',
      address: 'Nguyễn Huệ, Quận 1, TP.HCM',
      status: 'Đã xác nhận',
      totalAmount: 400000
    });

    await OrderItem.bulkCreate([
      { orderId: 'DH001', bookId: '#001', qty: 2, price: 150000, total: 300000 },
      { orderId: 'DH001', bookId: '#003', qty: 1, price: 100000, total: 100000 },
    ]);

    console.log('Orders seeded.');
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seed();
