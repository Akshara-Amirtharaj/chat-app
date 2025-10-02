import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
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
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      default: 'USD',
      uppercase: true,
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    category: {
      type: String,
      enum: ['FOOD', 'TRANSPORT', 'ACCOMMODATION', 'ENTERTAINMENT', 'UTILITIES', 'SHOPPING', 'OTHER'],
      default: 'OTHER',
    },
    date: {
      type: Date,
      default: Date.now,
    },
    splitType: {
      type: String,
      enum: ['EQUAL', 'PERCENTAGE', 'AMOUNT', 'CUSTOM'],
      default: 'EQUAL',
    },
    participants: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      share: {
        type: Number,
        required: true,
      },
      settled: {
        type: Boolean,
        default: false,
      },
    }],
    attachments: [{
      url: String,
      filename: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
expenseSchema.index({ workspaceId: 1, date: -1 });
expenseSchema.index({ paidBy: 1 });
expenseSchema.index({ 'participants.userId': 1 });

// Calculate split amounts based on split type
expenseSchema.methods.calculateSplits = function(splits) {
  const participants = [];
  
  if (this.splitType === 'EQUAL') {
    const sharePerPerson = this.amount / splits.length;
    splits.forEach(userId => {
      participants.push({
        userId,
        share: sharePerPerson,
        settled: false,
      });
    });
  } else if (this.splitType === 'PERCENTAGE') {
    splits.forEach(split => {
      participants.push({
        userId: split.userId,
        share: (this.amount * split.percentage) / 100,
        settled: false,
      });
    });
  } else if (this.splitType === 'AMOUNT' || this.splitType === 'CUSTOM') {
    splits.forEach(split => {
      participants.push({
        userId: split.userId,
        share: split.amount,
        settled: false,
      });
    });
  }
  
  return participants;
};

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense;
