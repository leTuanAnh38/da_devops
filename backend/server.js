import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import sequelize from './db.js';
import { Book, Transaction, StockCard } from './models.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Books CRUD
app.get('/api/books', async (req, res) => {
  try {
    const books = await Book.findAll();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/books', async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Tên sách không được để trống' });
    }
    const book = await Book.create(req.body);
    res.status(201).json(book);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Transactions (Import/Export)
app.post('/api/transactions', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { bookId, type, quantity } = req.body;

    // Kiểm tra số lượng hợp lệ
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Số lượng phải lớn hơn 0' });
    }

    const book = await Book.findByPk(bookId, { transaction: t });

    if (!book) {
      throw new Error('Book not found');
    }

    if (type === 'EXPORT' && book.stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock for export' });
    }

    const previousStock = book.stock;
    const change = type === 'IMPORT' ? quantity : -quantity;
    const currentStock = previousStock + change;

    // Update book stock
    book.stock = currentStock;
    await book.save({ transaction: t });

    // Create transaction record
    const transaction = await Transaction.create({
      BookId: bookId,
      type,
      quantity,
    }, { transaction: t });

    // Create stock card record
    await StockCard.create({
      BookId: bookId,
      TransactionId: transaction.id,
      previousStock,
      change,
      currentStock,
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Transaction successful', currentStock });
  } catch (error) {
    await t.rollback();
    res.status(400).json({ error: error.message });
  }
});

// Stock Card history
app.get('/api/books/:id/history', async (req, res) => {
  try {
    const history = await StockCard.findAll({
      where: { BookId: req.params.id },
      include: [Transaction],
      order: [['createdAt', 'DESC']],
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Sync database and start server
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
