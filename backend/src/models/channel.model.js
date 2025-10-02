import mongoose from 'mongoose';

const channelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    description: {
      type: String,
      maxlength: 200,
      default: '',
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    type: {
      type: String,
      enum: ['TEXT', 'VOICE', 'TASK_BOARD'],
      default: 'TEXT',
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    allowedUserIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    allowedRoles: [{
      type: String,
      enum: ['OWNER', 'ADMIN', 'MEMBER', 'GUEST'],
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Channel-specific settings
    settings: {
      allowFileUploads: {
        type: Boolean,
        default: true,
      },
      allowThreads: {
        type: Boolean,
        default: true,
      },
      slowMode: {
        enabled: {
          type: Boolean,
          default: false,
        },
        delay: {
          type: Number,
          default: 0, // seconds
        },
      },
    },
  },
  { timestamps: true }
);

// Indexes
channelSchema.index({ workspaceId: 1 });
channelSchema.index({ workspaceId: 1, name: 1 }, { unique: true });
channelSchema.index({ createdBy: 1 });

// Method to check if user can access channel
channelSchema.methods.canUserAccess = function(userId, userRole) {
  // Public channels - all workspace members can access
  if (!this.isPrivate) {
    return true;
  }
  
  // Private channels - check allowed users and roles
  const isAllowedUser = this.allowedUserIds.some(id => id.toString() === userId.toString());
  const isAllowedRole = this.allowedRoles.includes(userRole);
  
  return isAllowedUser || isAllowedRole;
};

// Method to get channel display name
channelSchema.methods.getDisplayName = function() {
  return this.type === 'TEXT' ? `#${this.name}` : this.name;
};

const Channel = mongoose.model('Channel', channelSchema);

export default Channel;

