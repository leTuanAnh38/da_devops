import sequelize from './db.js';
import { Notification } from './models.js';

async function check() {
  try {
    console.log('--- SYNCING DATABASE ---');
    await sequelize.sync({ alter: true });
    console.log('Database synced successfully.');

    const count = await Notification.count();
    const latest = await Notification.findAll({ limit: 5, order: [['createdAt', 'DESC']] });
    console.log('--- DATABASE CHECK ---');
    console.log('Total Notifications:', count);
    console.log('Latest:', JSON.stringify(latest, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
}

check();
