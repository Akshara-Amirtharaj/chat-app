import Challenge from '../models/challenge.model.js';
import ChallengeLog from '../models/challengeLog.model.js';
import Workspace from '../models/workspace.model.js';

// Create a new challenge
export const createChallenge = async (req, res) => {
  try {
    const { workspaceId, title, description, startDate, endDate, frequency, target, evidenceType, category, reminderTime } = req.body;
    const userId = req.user._id;

    // Validate dates
    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: 'Start date must be before end date' });
    }

    // If workspace challenge, check permissions
    if (workspaceId) {
      const workspace = await Workspace.findById(workspaceId);
      if (!workspace) {
        return res.status(404).json({ message: 'Workspace not found' });
      }
      if (!workspace.isMember(userId)) {
        return res.status(403).json({ message: 'You must be a member of this workspace' });
      }
    }

    const challenge = new Challenge({
      title,
      description,
      workspaceId: workspaceId || null,
      createdBy: userId,
      startDate,
      endDate,
      frequency,
      target,
      evidenceType,
      category: category || 'CUSTOM',
      reminderTime: reminderTime || '09:00',
      participants: [{
        userId,
        joinedAt: new Date(),
      }],
    });

    await challenge.save();

    const populatedChallenge = await Challenge.findById(challenge._id)
      .populate('createdBy', 'fullName email profilePic')
      .populate('participants.userId', 'fullName email profilePic');

    res.status(201).json({
      message: 'Challenge created successfully',
      challenge: populatedChallenge,
    });
  } catch (error) {
    console.error('Error in createChallenge:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get challenges (personal or workspace)
export const getChallenges = async (req, res) => {
  try {
    const { workspaceId, status } = req.query;
    const userId = req.user._id;

    const query = { isActive: true };

    if (workspaceId) {
      query.workspaceId = workspaceId;
    } else {
      // Personal challenges or challenges user is part of
      query.$or = [
        { workspaceId: null, createdBy: userId },
        { 'participants.userId': userId },
      ];
    }

    // Filter by status
    const now = new Date();
    if (status === 'ongoing') {
      query.startDate = { $lte: now };
      query.endDate = { $gte: now };
    } else if (status === 'upcoming') {
      query.startDate = { $gt: now };
    } else if (status === 'completed') {
      query.endDate = { $lt: now };
    }

    const challenges = await Challenge.find(query)
      .populate('createdBy', 'fullName email profilePic')
      .populate('participants.userId', 'fullName email profilePic')
      .populate('workspaceId', 'name')
      .sort({ startDate: -1 });

    res.status(200).json({ challenges });
  } catch (error) {
    console.error('Error in getChallenges:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get single challenge
export const getChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const challenge = await Challenge.findById(id)
      .populate('createdBy', 'fullName email profilePic')
      .populate('participants.userId', 'fullName email profilePic')
      .populate('workspaceId', 'name');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check access - allow viewing for workspace members or if it's a personal challenge
    if (challenge.workspaceId) {
      const workspace = await Workspace.findById(challenge.workspaceId);
      if (!workspace || !workspace.isMember(userId)) {
        return res.status(403).json({ message: 'Access denied to workspace challenge' });
      }
    }
    // For personal challenges, anyone can view (they can join if they want)

    res.status(200).json({ challenge });
  } catch (error) {
    console.error('Error in getChallenge:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Join a challenge
export const joinChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check if already joined
    if (challenge.isParticipant(userId)) {
      return res.status(400).json({ message: 'Already joined this challenge' });
    }

    // Check if challenge is ongoing or upcoming
    if (!challenge.isOngoing() && new Date() > challenge.endDate) {
      return res.status(400).json({ message: 'Challenge has ended' });
    }

    // If workspace challenge, check membership
    if (challenge.workspaceId) {
      const workspace = await Workspace.findById(challenge.workspaceId);
      if (!workspace || !workspace.isMember(userId)) {
        return res.status(403).json({ message: 'You must be a member of this workspace' });
      }
    }

    challenge.participants.push({
      userId,
      joinedAt: new Date(),
    });

    await challenge.save();

    const updatedChallenge = await Challenge.findById(id)
      .populate('createdBy', 'fullName email profilePic')
      .populate('participants.userId', 'fullName email profilePic');

    res.status(200).json({
      message: 'Successfully joined challenge',
      challenge: updatedChallenge,
    });
  } catch (error) {
    console.error('Error in joinChallenge:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Leave a challenge
export const leaveChallenge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Cannot leave if creator
    if (challenge.createdBy.toString() === userId.toString()) {
      return res.status(400).json({ message: 'Challenge creator cannot leave' });
    }

    challenge.participants = challenge.participants.filter(
      p => p.userId.toString() !== userId.toString()
    );

    await challenge.save();

    res.status(200).json({ message: 'Successfully left challenge' });
  } catch (error) {
    console.error('Error in leaveChallenge:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Log completion
export const logCompletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { value, date, notes, photoUrl } = req.body;
    const userId = req.user._id;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (!challenge.isParticipant(userId)) {
      return res.status(403).json({ message: 'You must join the challenge first' });
    }

    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(0, 0, 0, 0);

    // Check if already logged for this date
    const existingLog = await ChallengeLog.findOne({
      challengeId: id,
      userId,
      date: logDate,
    });

    if (existingLog) {
      // Update existing log
      existingLog.value = value;
      existingLog.notes = notes;
      if (photoUrl) existingLog.photoUrl = photoUrl;
      await existingLog.save();
    } else {
      // Create new log
      const log = new ChallengeLog({
        challengeId: id,
        userId,
        date: logDate,
        value,
        notes,
        photoUrl,
      });
      await log.save();
    }

    // Update participant stats
    const participant = challenge.getParticipant(userId);
    if (participant) {
      participant.totalCompletions += 1;
      participant.lastCompletionDate = logDate;

      // Calculate streak
      const yesterday = new Date(logDate);
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);

      const yesterdayLog = await ChallengeLog.findOne({
        challengeId: id,
        userId,
        date: yesterday,
      });

      if (yesterdayLog || !participant.lastCompletionDate) {
        participant.currentStreak += 1;
      } else {
        participant.currentStreak = 1;
      }

      if (participant.currentStreak > participant.longestStreak) {
        participant.longestStreak = participant.currentStreak;
      }

      await challenge.save();
    }

    res.status(200).json({
      message: 'Completion logged successfully',
      streak: participant.currentStreak,
    });
  } catch (error) {
    console.error('Error in logCompletion:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get challenge summary (streaks, compliance, leaderboard)
export const getChallengeSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const challenge = await Challenge.findById(id)
      .populate('participants.userId', 'fullName email profilePic');

    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    // Check access - allow viewing for workspace members or personal challenges
    if (challenge.workspaceId) {
      const workspace = await Workspace.findById(challenge.workspaceId);
      if (!workspace || !workspace.isMember(userId)) {
        return res.status(403).json({ message: 'Access denied to workspace challenge' });
      }
    }
    // For personal challenges, anyone can view the summary

    // Calculate days elapsed
    const now = new Date();
    const start = new Date(challenge.startDate);
    const daysElapsed = Math.max(0, Math.ceil((now - start) / (1000 * 60 * 60 * 24)));

    // Get leaderboard
    const leaderboard = challenge.participants
      .map(p => ({
        user: p.userId,
        currentStreak: p.currentStreak,
        longestStreak: p.longestStreak,
        totalCompletions: p.totalCompletions,
        complianceRate: daysElapsed > 0 ? ((p.totalCompletions / daysElapsed) * 100).toFixed(1) : 0,
      }))
      .sort((a, b) => b.currentStreak - a.currentStreak || b.totalCompletions - a.totalCompletions);

    // Get user's stats
    const userParticipant = challenge.getParticipant(userId);
    const userStats = userParticipant ? {
      currentStreak: userParticipant.currentStreak,
      longestStreak: userParticipant.longestStreak,
      totalCompletions: userParticipant.totalCompletions,
      complianceRate: daysElapsed > 0 ? ((userParticipant.totalCompletions / daysElapsed) * 100).toFixed(1) : 0,
      rank: leaderboard.findIndex(l => l.user._id.toString() === userId.toString()) + 1,
    } : null;

    res.status(200).json({
      summary: {
        daysElapsed,
        totalDays: Math.ceil((new Date(challenge.endDate) - start) / (1000 * 60 * 60 * 24)),
        participantCount: challenge.participants.length,
        leaderboard: leaderboard.slice(0, 10), // Top 10
        userStats,
      },
    });
  } catch (error) {
    console.error('Error in getChallengeSummary:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

// Get user's logs for a challenge
export const getUserLogs = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const challenge = await Challenge.findById(id);
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found' });
    }

    if (!challenge.isParticipant(userId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const logs = await ChallengeLog.find({
      challengeId: id,
      userId,
    }).sort({ date: -1 });

    res.status(200).json({ logs });
  } catch (error) {
    console.error('Error in getUserLogs:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
