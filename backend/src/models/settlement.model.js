import mongoose from 'mongoose';

const settlementSchema = new mongoose.Schema(
  {
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    payerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    payeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    notes: {
      type: String,
      maxlength: 500,
    },
    settledAt: {
      type: Date,
      default: Date.now,
    },
    relatedExpenses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expense',
    }],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
settlementSchema.index({ workspaceId: 1, settledAt: -1 });
settlementSchema.index({ payerId: 1 });
settlementSchema.index({ payeeId: 1 });

const Settlement = mongoose.model('Settlement', settlementSchema);

export default Settlement;
