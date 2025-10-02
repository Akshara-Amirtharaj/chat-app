import mongoose from 'mongoose';

const challengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 1000,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      default: null, // null means personal challenge
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    frequency: {
      type: String,
      enum: ['DAILY', 'WEEKLY', 'CUSTOM'],
      default: 'DAILY',
    },
    target: {
      type: String,
      required: true,
      maxlength: 200,
    },
    evidenceType: {
      type: String,
      enum: ['MANUAL_CHECK', 'PHOTO', 'NUMBER', 'TEXT'],
      default: 'MANUAL_CHECK',
    },
    category: {
      type: String,
      enum: ['FITNESS', 'READING', 'MEDITATION', 'CODING', 'JOURNALING', 'CUSTOM'],
      default: 'CUSTOM',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    participants: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      totalCompletions: {
        type: Number,
        default: 0,
      },
      lastCompletionDate: {
        type: Date,
      },
    }],
    reminderTime: {
      type: String, // Format: "HH:MM" in 24-hour format
      default: '09:00',
    },
    reminderEnabled: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
challengeSchema.index({ workspaceId: 1, isActive: 1 });
challengeSchema.index({ 'participants.userId': 1 });
challengeSchema.index({ startDate: 1, endDate: 1 });

// Method to check if challenge is ongoing
challengeSchema.methods.isOngoing = function() {
  const now = new Date();
  return this.startDate <= now && this.endDate >= now && this.isActive;
};

// Method to get participant by userId
challengeSchema.methods.getParticipant = function(userId) {
  return this.participants.find(p => p.userId.toString() === userId.toString());
};

// Method to check if user is participant
challengeSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.userId.toString() === userId.toString());
};

const Challenge = mongoose.model('Challenge', challengeSchema);

export default Challenge;
