import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      maxlength: 2000,
      default: '',
    },
    workspaceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Workspace',
      required: true,
    },
    channelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Channel',
    },
    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'],
      default: 'TODO',
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
    },
    dueDate: {
      type: Date,
    },
    labels: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      color: {
        type: String,
        default: '#3B82F6',
      },
    }],
    checklist: [{
      text: {
        type: String,
        required: true,
        trim: true,
      },
      completed: {
        type: Boolean,
        default: false,
      },
      completedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      completedAt: {
        type: Date,
      },
    }],
    attachments: [{
      filename: String,
      url: String,
      size: Number,
      uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    }],
    // Task position in board (for drag & drop)
    position: {
      type: Number,
      default: 0,
    },
    // Task dependencies
    dependencies: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Task',
    }],
    // Time tracking
    timeTracking: {
      estimatedHours: {
        type: Number,
        default: 0,
      },
      loggedHours: {
        type: Number,
        default: 0,
      },
      timeEntries: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        hours: Number,
        description: String,
        loggedAt: {
          type: Date,
          default: Date.now,
        },
      }],
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Indexes
taskSchema.index({ workspaceId: 1 });
taskSchema.index({ channelId: 1 });
taskSchema.index({ assigneeId: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ workspaceId: 1, status: 1 });

// Virtual for completion percentage
taskSchema.virtual('completionPercentage').get(function() {
  if (this.checklist.length === 0) return 0;
  const completed = this.checklist.filter(item => item.completed).length;
  return Math.round((completed / this.checklist.length) * 100);
});

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function() {
  if (!this.dueDate) return false;
  return this.dueDate < new Date() && this.status !== 'DONE';
});

// Method to add checklist item
taskSchema.methods.addChecklistItem = function(text) {
  this.checklist.push({ text });
  return this.save();
};

// Method to toggle checklist item
taskSchema.methods.toggleChecklistItem = function(itemId, userId) {
  const item = this.checklist.id(itemId);
  if (item) {
    item.completed = !item.completed;
    if (item.completed) {
      item.completedBy = userId;
      item.completedAt = new Date();
    } else {
      item.completedBy = undefined;
      item.completedAt = undefined;
    }
    return this.save();
  }
  throw new Error('Checklist item not found');
};

// Method to add time entry
taskSchema.methods.addTimeEntry = function(userId, hours, description) {
  this.timeTracking.timeEntries.push({
    userId,
    hours,
    description,
  });
  this.timeTracking.loggedHours += hours;
  return this.save();
};

const Task = mongoose.model('Task', taskSchema);

export default Task;

