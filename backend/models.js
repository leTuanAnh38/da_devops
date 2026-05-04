import { DataTypes } from 'sequelize';
import sequelize from './db.js';

export const Book = sequelize.define('Book', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  author: {
    type: DataTypes.STRING,
  },
  category: {
    type: DataTypes.STRING,
  },
  location: {
    type: DataTypes.STRING,
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
});

export const Transaction = sequelize.define('Transaction', {
  type: {
    type: DataTypes.ENUM('IMPORT', 'EXPORT'),
    allowNull: false,
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

export const StockCard = sequelize.define('StockCard', {
  previousStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  change: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  currentStock: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

// Relationships
Book.hasMany(Transaction);
Transaction.belongsTo(Book);

Book.hasMany(StockCard);
StockCard.belongsTo(Book);

Transaction.hasOne(StockCard);
StockCard.belongsTo(Transaction);
