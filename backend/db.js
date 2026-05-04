import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/warehouse', {
  dialect: 'postgres',
  logging: false,
});

export default sequelize;
