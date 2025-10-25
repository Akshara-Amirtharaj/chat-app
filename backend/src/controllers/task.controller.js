import Task from '../models/task.model.js';
import Workspace from '../models/workspace.model.js';
import Channel from '../models/channel.model.js';

// Create task
export const createTask = async (req, res) => {
  try {
    const { 
      workspaceId, 
      channelId, 
      title, 
      description, 
      assigneeId, 
      dueDate, 
      priority = 'MEDIUM',
      labels = [],
      checklist = []
    } = req.body;
    const userId = req.user._id;

    if (!workspaceId || !title) {
      return res.status(400).json({ message: 'Workspace ID and title are required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is member
    if (!workspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // If channelId provided, verify it exists and user has access
    if (channelId) {
      const channel = await Channel.findById(channelId);
      if (!channel || channel.workspaceId.toString() !== workspaceId) {
        return res.status(404).json({ message: 'Channel not found' });
      }
    }

    const task = new Task({
      title,
      description: description || '',
      workspaceId,
      channelId,
      assigneeId,
      createdBy: userId,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority,
      labels,
      checklist,
    });

    await task.save();
    await task.populate('createdBy', 'fullName profilePic');
    await task.populate('assigneeId', 'fullName profilePic');

    res.status(201).json({
      message: 'Task created successfully',
      task: {
        _id: task._id,
        title: task.title,
        description: task.description,
        workspaceId: task.workspaceId,
        channelId: task.channelId,
        assigneeId: task.assigneeId,
        createdBy: task.createdBy,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        labels: task.labels,
        checklist: task.checklist,
        completionPercentage: task.completionPercentage,
        isOverdue: task.isOverdue,
        createdAt: task.createdAt,
      },
    });
  } catch (error) {
    console.error('Error in createTask:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get tasks for workspace/channel
export const getTasks = async (req, res) => {
  try {
    const { workspaceId, channelId, status, assigneeId } = req.query;
    const userId = req.user._id;

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is member
    if (!workspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Build query
    const query = { 
      workspaceId, 
      isArchived: false 
    };

    if (channelId) query.channelId = channelId;
    if (status) query.status = status;
    if (assigneeId) query.assigneeId = assigneeId;

    const tasks = await Task.find(query)
      .populate('createdBy', 'fullName profilePic')
      .populate('assigneeId', 'fullName profilePic')
      .sort({ position: 1, createdAt: -1 });

    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error in getTasks:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get task by ID
export const getTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId)
      .populate('createdBy', 'fullName profilePic')
      .populate('assigneeId', 'fullName profilePic')
      .populate('workspaceId', 'name slug')
      .populate('channelId', 'name');

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const workspace = task.workspaceId;
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is member
    if (!workspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.status(200).json({ task });
  } catch (error) {
    console.error('Error in getTask:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Update task
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const updateData = req.body;
    const userId = req.user._id;

    const task = await Task.findById(taskId).populate('workspaceId');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const workspace = task.workspaceId;
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is member
    if (!workspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Handle due date conversion
    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      updateData,
      { new: true }
    )
      .populate('createdBy', 'fullName profilePic')
      .populate('assigneeId', 'fullName profilePic');

    res.status(200).json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Error in updateTask:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Delete task
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId).populate('workspaceId');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const workspace = task.workspaceId;
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check permissions (creator or admin)
    const userRole = workspace.getUserRole(userId);
    const isCreator = task.createdBy.toString() === userId.toString();
    
    if (!isCreator && !workspace.hasPermission(userId, 'ADMIN')) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    // Soft delete
    task.isArchived = true;
    await task.save();

    res.status(200).json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error in deleteTask:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Add checklist item
export const addChecklistItem = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: 'Checklist item text is required' });
    }

    const task = await Task.findById(taskId).populate('workspaceId');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const workspace = task.workspaceId;
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is member
    if (!workspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.addChecklistItem(text);

    res.status(200).json({
      message: 'Checklist item added successfully',
      checklist: task.checklist,
    });
  } catch (error) {
    console.error('Error in addChecklistItem:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Toggle checklist item
export const toggleChecklistItem = async (req, res) => {
  try {
    const { taskId, itemId } = req.params;
    const userId = req.user._id;

    const task = await Task.findById(taskId).populate('workspaceId');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const workspace = task.workspaceId;
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is member
    if (!workspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.toggleChecklistItem(itemId, userId);

    res.status(200).json({
      message: 'Checklist item toggled successfully',
      checklist: task.checklist,
      completionPercentage: task.completionPercentage,
    });
  } catch (error) {
    console.error('Error in toggleChecklistItem:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Add time entry
export const addTimeEntry = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { hours, description } = req.body;
    const userId = req.user._id;

    if (!hours || hours <= 0) {
      return res.status(400).json({ message: 'Valid hours are required' });
    }

    const task = await Task.findById(taskId).populate('workspaceId');
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const workspace = task.workspaceId;
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is member
    if (!workspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await task.addTimeEntry(userId, hours, description);

    res.status(200).json({
      message: 'Time entry added successfully',
      timeTracking: task.timeTracking,
    });
  } catch (error) {
    console.error('Error in addTimeEntry:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get task statistics
export const getTaskStats = async (req, res) => {
  try {
    const { workspaceId, channelId } = req.query;
    const userId = req.user._id;

    if (!workspaceId) {
      return res.status(400).json({ message: 'Workspace ID is required' });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }

    // Check if user is member
    if (!workspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = { workspaceId, isArchived: false };
    if (channelId) query.channelId = channelId;

    const tasks = await Task.find(query);
    
    const stats = {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'TODO').length,
      inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
      inReview: tasks.filter(t => t.status === 'IN_REVIEW').length,
      done: tasks.filter(t => t.status === 'DONE').length,
      overdue: tasks.filter(t => t.isOverdue).length,
      completionRate: tasks.length > 0 ? 
        Math.round((tasks.filter(t => t.status === 'DONE').length / tasks.length) * 100) : 0,
    };

    res.status(200).json({ stats });
  } catch (error) {
    console.error('Error in getTaskStats:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};



