import { DataTypes } from 'sequelize';
import sequelize from './db.js';

// 1. Model Danh mục
export const Category = sequelize.define('Category', {
  id: { type: DataTypes.STRING, primaryKey: true }, // VD: CAT001
  name: { type: DataTypes.STRING, allowNull: false },
  slug: { type: DataTypes.STRING },
  description: { type: DataTypes.TEXT }
});

// 2. Model Sách
export const Book = sequelize.define('Book', {
  id: { type: DataTypes.STRING, primaryKey: true }, // VD: #001
  title: { type: DataTypes.STRING, allowNull: false },
  price: { type: DataTypes.INTEGER, defaultValue: 0 },
  quantity: { type: DataTypes.INTEGER, defaultValue: 0 },
  unit: { type: DataTypes.STRING, defaultValue: 'Cuốn' },
  status: { 
    type: DataTypes.VIRTUAL,
    get() {
      return this.quantity > 5 ? 'Còn hàng' : 'Sắp hết';
    }
  }
});

// 3. Model Đơn hàng
export const Order = sequelize.define('Order', {
  id: { type: DataTypes.STRING, primaryKey: true }, // VD: DH001
  customer: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  totalAmount: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { 
    type: DataTypes.STRING, 
    defaultValue: 'Chờ xác nhận' 
  },
  note: { type: DataTypes.TEXT }
});

// 4. Model Chi tiết đơn hàng
export const OrderItem = sequelize.define('OrderItem', {
  qty: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.INTEGER, allowNull: false },
  total: { type: DataTypes.INTEGER, allowNull: false }
});

// 5. Model Thẻ kho
export const StockCard = sequelize.define('StockCard', {
  type: { type: DataTypes.STRING, allowNull: false }, // NHAP, XUAT, DIEU_CHINH, BAN_HANG
  change: { type: DataTypes.INTEGER, allowNull: false },
  currentStock: { type: DataTypes.INTEGER, allowNull: false },
  note: { type: DataTypes.STRING }
});

// 6. Model Phiếu Nhập/Xuất kho chuyên nghiệp
export const WarehouseReceipt = sequelize.define('WarehouseReceipt', {
  id: { type: DataTypes.STRING, primaryKey: true }, // PN001, PX001
  type: { type: DataTypes.STRING, allowNull: false }, // NHAP, XUAT
  partnerName: { type: DataTypes.STRING }, // Tên NCC hoặc Khách hàng
  partnerPhone: { type: DataTypes.STRING }, // Số điện thoại đối tác
  partnerAddress: { type: DataTypes.STRING }, // Địa chỉ đối tác
  creatorName: { type: DataTypes.STRING }, // Tên nhân viên lập phiếu
  totalAmount: { type: DataTypes.INTEGER, defaultValue: 0 },
  status: { type: DataTypes.STRING, defaultValue: 'Hoàn thành' }, // Hoàn thành, Đã hủy
  note: { type: DataTypes.TEXT }
});

// 7. Chi tiết phiếu nhập xuất
export const WarehouseReceiptItem = sequelize.define('WarehouseReceiptItem', {
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.INTEGER, defaultValue: 0 },
  total: { type: DataTypes.INTEGER, defaultValue: 0 }
});

// 8. Model Thông báo hệ thống
export const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT },
  type: { type: DataTypes.ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR'), defaultValue: 'INFO' },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// THIẾT LẬP QUAN HỆ (ASSOCIATIONS)
Category.hasMany(Book, { foreignKey: 'categoryId' });
Book.belongsTo(Category, { foreignKey: 'categoryId' });

Order.hasMany(OrderItem, { foreignKey: 'orderId' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

Book.hasMany(OrderItem, { foreignKey: 'bookId' });
OrderItem.belongsTo(Book, { foreignKey: 'bookId' });

Book.hasMany(StockCard, { foreignKey: 'bookId' });
StockCard.belongsTo(Book, { foreignKey: 'bookId' });

WarehouseReceipt.hasMany(WarehouseReceiptItem, { foreignKey: 'receiptId' });
WarehouseReceiptItem.belongsTo(WarehouseReceipt, { foreignKey: 'receiptId' });

Book.hasMany(WarehouseReceiptItem, { foreignKey: 'bookId' });
WarehouseReceiptItem.belongsTo(Book, { foreignKey: 'bookId' });

export default { Category, Book, Order, OrderItem, StockCard, WarehouseReceipt, WarehouseReceiptItem };
