import cron from 'node-cron';
import Challenge from '../models/challenge.model.js';
import { io } from './socket.js';

// Send daily reminders to all challenge participants
export const sendChallengeReminders = async () => {
  try {
    const now = new Date();
    
    // Find all active ongoing challenges
    const challenges = await Challenge.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      reminderEnabled: true,
    }).populate('participants.userId', 'fullName email');

    for (const challenge of challenges) {
      // Send reminder to each participant
      for (const participant of challenge.participants) {
        const userId = participant.userId._id || participant.userId;
        
        // Create reminder notification
        const reminderMessage = {
          type: 'CHALLENGE_REMINDER',
          challengeId: challenge._id,
          challengeTitle: challenge.title,
          target: challenge.target,
          message: `🎯 Chatty Reminder: Don't forget to log your progress for "${challenge.title}"!\n\nTarget: ${challenge.target}\n\nKeep your streak going! 🔥`,
          timestamp: new Date(),
        };

        // Emit socket event to user
        io.to(userId.toString()).emit('challengeReminder', reminderMessage);
        
        console.log(`Sent reminder for challenge "${challenge.title}" to user ${userId}`);
      }
    }

    console.log(`✅ Sent reminders for ${challenges.length} challenges`);
  } catch (error) {
    console.error('Error sending challenge reminders:', error);
  }
};

// Schedule daily reminders at 9 AM
export const scheduleChallengeReminders = () => {
  // Run every day at 9:00 AM
  cron.schedule('0 9 * * *', () => {
    console.log('🔔 Running daily challenge reminders...');
    sendChallengeReminders();
  });

  console.log('✅ Challenge reminders scheduled for 9:00 AM daily');
};
