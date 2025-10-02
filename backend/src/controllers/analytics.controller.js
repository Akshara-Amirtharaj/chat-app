import Workspace from '../models/workspace.model.js';
import Task from '../models/task.model.js';
import Message from '../models/message.model.js';
import Expense from '../models/expense.model.js';
import Challenge from '../models/challenge.model.js';
import ChallengeLog from '../models/challengeLog.model.js';

// Get workspace analytics
export const getWorkspaceAnalytics = async (req, res) => {
  try {
    const { workspaceId } = req.query;
    const userId = req.user._id;

    // Verify workspace access
    const workspace = await Workspace.findById(workspaceId).populate('members.userId', 'fullName email');
    if (!workspace || !workspace.isMember(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Task Analytics
    const totalTasks = await Task.countDocuments({ workspaceId });
    const completedTasks = await Task.countDocuments({ workspaceId, status: 'DONE' });
    const inProgressTasks = await Task.countDocuments({ workspaceId, status: 'IN_PROGRESS' });
    const todoTasks = await Task.countDocuments({ workspaceId, status: 'TODO' });
    const overdueTasks = await Task.countDocuments({
      workspaceId,
      dueDate: { $lt: now },
      status: { $ne: 'DONE' },
    });

    const taskCompletionRate = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

    // Tasks completed in last 30 days
    const recentCompletedTasks = await Task.countDocuments({
      workspaceId,
      status: 'DONE',
      updatedAt: { $gte: thirtyDaysAgo },
    });

    // Member Activity
    const activeMembers = workspace.members.filter(m => m.status === 'ACTIVE').length;
    const pendingMembers = workspace.members.filter(m => m.status === 'PENDING').length;

    // Message Analytics
    const totalMessages = await Message.countDocuments({ workspaceId });
    const recentMessages = await Message.countDocuments({
      workspaceId,
      createdAt: { $gte: sevenDaysAgo },
    });

    // Finance Analytics
    const totalExpenses = await Expense.countDocuments({ workspaceId });
    const expenses = await Expense.find({ workspaceId });
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const recentExpenses = await Expense.countDocuments({
      workspaceId,
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Challenge Analytics
    const activeChallenges = await Challenge.countDocuments({
      workspaceId,
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });

    const challenges = await Challenge.find({ workspaceId });
    let totalChallengeParticipants = 0;
    let totalCompletions = 0;

    for (const challenge of challenges) {
      totalChallengeParticipants += challenge.participants.length;
      const logs = await ChallengeLog.countDocuments({ challengeId: challenge._id });
      totalCompletions += logs;
    }

    // Task distribution by status
    const tasksByStatus = [
      { status: 'TODO', count: todoTasks },
      { status: 'IN_PROGRESS', count: inProgressTasks },
      { status: 'IN_REVIEW', count: await Task.countDocuments({ workspaceId, status: 'IN_REVIEW' }) },
      { status: 'DONE', count: completedTasks },
    ];

    // Top contributors (by tasks completed)
    const topContributors = await Task.aggregate([
      { $match: { workspaceId: workspace._id, status: 'DONE' } },
      { $group: { _id: '$assigneeId', completedTasks: { $sum: 1 } } },
      { $sort: { completedTasks: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      { $unwind: '$user' },
      {
        $project: {
          user: { fullName: 1, email: 1, profilePic: 1 },
          completedTasks: 1,
        },
      },
    ]);

    // Activity timeline (last 7 days)
    const activityTimeline = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const tasksCompleted = await Task.countDocuments({
        workspaceId,
        status: 'DONE',
        updatedAt: { $gte: startOfDay, $lte: endOfDay },
      });

      const messagesCount = await Message.countDocuments({
        workspaceId,
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      });

      activityTimeline.push({
        date: startOfDay.toISOString().split('T')[0],
        tasksCompleted,
        messages: messagesCount,
      });
    }

    res.status(200).json({
      workspace: {
        name: workspace.name,
        memberCount: activeMembers,
        pendingMembers,
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks,
        todo: todoTasks,
        overdue: overdueTasks,
        completionRate: parseFloat(taskCompletionRate),
        recentCompleted: recentCompletedTasks,
        byStatus: tasksByStatus,
      },
      messages: {
        total: totalMessages,
        recent: recentMessages,
      },
      finance: {
        totalExpenses,
        totalSpent,
        recentExpenses,
      },
      challenges: {
        active: activeChallenges,
        totalParticipants: totalChallengeParticipants,
        totalCompletions,
      },
      topContributors,
      activityTimeline,
    });
  } catch (error) {
    console.error('Error in getWorkspaceAnalytics:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get user personal analytics
export const getUserAnalytics = async (req, res) => {
  try {
    const userId = req.user._id;

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Task stats
    const totalTasksAssigned = await Task.countDocuments({ assigneeId: userId });
    const completedTasks = await Task.countDocuments({ assigneeId: userId, status: 'DONE' });
    const pendingTasks = totalTasksAssigned - completedTasks;

    // Challenge stats
    const challenges = await Challenge.find({ 'participants.userId': userId });
    let totalStreak = 0;
    let longestStreak = 0;

    challenges.forEach(challenge => {
      const participant = challenge.participants.find(p => p.userId.toString() === userId.toString());
      if (participant) {
        totalStreak += participant.currentStreak;
        longestStreak = Math.max(longestStreak, participant.longestStreak);
      }
    });

    // Workspace participation
    const workspaces = await Workspace.find({ 'members.userId': userId });

    res.status(200).json({
      tasks: {
        total: totalTasksAssigned,
        completed: completedTasks,
        pending: pendingTasks,
        completionRate: totalTasksAssigned > 0 ? ((completedTasks / totalTasksAssigned) * 100).toFixed(1) : 0,
      },
      challenges: {
        participating: challenges.length,
        totalStreak,
        longestStreak,
      },
      workspaces: {
        total: workspaces.length,
      },
    });
  } catch (error) {
    console.error('Error in getUserAnalytics:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
