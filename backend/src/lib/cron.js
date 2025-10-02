import cron from 'node-cron';
import User from '../models/user.model.js';

// Runs daily at 02:00 server time
cron.schedule('0 2 * * *', async () => {
  const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  try {
    await User.deleteMany({ deletedAt: { $lte: cutoff } });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Cron purge error:', err.message);
  }
});



