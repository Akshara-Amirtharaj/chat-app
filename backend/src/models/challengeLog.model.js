import mongoose from 'mongoose';

const challengeLogSchema = new mongoose.Schema(
  {
    challengeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed, // Can be boolean, number, string, or photo URL
      required: true,
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    photoUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
challengeLogSchema.index({ challengeId: 1, userId: 1, date: 1 }, { unique: true });
challengeLogSchema.index({ userId: 1, date: -1 });

const ChallengeLog = mongoose.model('ChallengeLog', challengeLogSchema);

export default ChallengeLog;
