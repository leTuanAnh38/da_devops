import bcrypt from 'bcryptjs';
import { User } from './models.js';
import sequelize from './db.js';

async function seedUser() {
  try {
    await sequelize.sync();
    
    const adminExists = await User.findOne({ where: { username: 'admin' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        username: 'admin',
        password: hashedPassword,
        fullName: 'Quản trị viên',
        role: 'admin'
      });
      console.log('--- Đã tạo tài khoản admin mặc định: admin / admin123 ---');
    } else {
      console.log('--- Tài khoản admin đã tồn tại ---');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('LỖI SEED USER:', error);
    process.exit(1);
  }
}

seedUser();
