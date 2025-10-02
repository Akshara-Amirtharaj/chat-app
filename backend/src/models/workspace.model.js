import mongoose from 'mongoose';

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^[a-z0-9-]+$/,
    },
    description: {
      type: String,
      maxlength: 500,
      default: '',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      role: {
        type: String,
        enum: ['OWNER', 'ADMIN', 'MEMBER', 'GUEST'],
        default: 'MEMBER',
      },
      status: {
        type: String,
        enum: ['ACTIVE', 'PENDING'],
        default: 'ACTIVE',
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
      invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
    settings: {
      allowInvites: {
        type: Boolean,
        default: true,
      },
      allowMemberInvites: {
        type: Boolean,
        default: false,
      },
      defaultChannelName: {
        type: String,
        default: 'general',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Indexes
workspaceSchema.index({ slug: 1 });
workspaceSchema.index({ ownerId: 1 });
workspaceSchema.index({ 'members.userId': 1 });

// Virtual for member count
workspaceSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Method to check if user is member (only ACTIVE members)
workspaceSchema.methods.isMember = function(userId) {
  return this.members.some(member => 
    member.userId.toString() === userId.toString() && 
    (!member.status || member.status === 'ACTIVE')
  );
};

// Method to get user role
workspaceSchema.methods.getUserRole = function(userId) {
  const member = this.members.find(member => member.userId.toString() === userId.toString());
  return member ? member.role : null;
};

// Method to check if user has permission
workspaceSchema.methods.hasPermission = function(userId, requiredRole) {
  const userRole = this.getUserRole(userId);
  if (!userRole) return false;
  
  const roleHierarchy = { GUEST: 0, MEMBER: 1, ADMIN: 2, OWNER: 3 };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Pre-save middleware to ensure owner is a member
workspaceSchema.pre('save', function(next) {
  if (this.isNew) {
    // Add owner as member if not already present
    const ownerExists = this.members.some(member => 
      member.userId.toString() === this.ownerId.toString()
    );
    
    if (!ownerExists) {
      this.members.push({
        userId: this.ownerId,
        role: 'OWNER',
        status: 'ACTIVE',
        joinedAt: new Date(),
      });
    }
  }
  next();
});

const Workspace = mongoose.model('Workspace', workspaceSchema);

export default Workspace;

