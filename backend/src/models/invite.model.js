import mongoose from 'mongoose';
import crypto from 'crypto';

const inviteSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    invitedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['ADMIN', 'MEMBER', 'GUEST'],
      default: 'MEMBER',
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'],
      default: 'PENDING',
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    acceptedAt: {
      type: Date,
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    // For bulk invites
    invitedUserIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    customMessage: {
      type: String,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// Indexes
inviteSchema.index({ token: 1 });
inviteSchema.index({ workspaceId: 1 });
inviteSchema.index({ email: 1 });
inviteSchema.index({ expiresAt: 1 });

// Virtual for invite URL
inviteSchema.virtual('inviteUrl').get(function() {
  const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  return `${baseUrl}/invite/${this.token}`;
});

// Method to check if invite is valid
inviteSchema.methods.isValid = function() {
  return this.status === 'PENDING' && this.expiresAt > new Date();
};

// Method to accept invite
inviteSchema.methods.accept = function(userId) {
  if (!this.isValid()) {
    throw new Error('Invalid or expired invite');
  }
  
  this.status = 'ACCEPTED';
  this.acceptedAt = new Date();
  this.acceptedBy = userId;
  
  return this.save();
};

// Method to decline invite
inviteSchema.methods.decline = function() {
  if (this.status !== 'PENDING') {
    throw new Error('Invite cannot be declined');
  }
  
  this.status = 'DECLINED';
  return this.save();
};

// Pre-save middleware to generate token
inviteSchema.pre('validate', function(next) {
  if (this.isNew && !this.token) {
    this.token = crypto.randomBytes(32).toString('hex');
  }
  next();
});

const Invite = mongoose.model('Invite', inviteSchema);

export default Invite;



