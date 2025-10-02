import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChallengeStore } from "../store/useChallengeStore";
import { useAuthStore } from "../store/useAuthStore";
import { 
  Loader, ArrowLeft, Users, Calendar, TrendingUp, Award, 
  CheckCircle, Trophy, Flame, Target, LogOut, Plus, UserPlus 
} from "lucide-react";
import toast from "react-hot-toast";

const ChallengeDetailPage = () => {
  const { challengeId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthStore();
  const { 
    currentChallenge, 
    challengeSummary, 
    userLogs,
    getChallenge, 
    joinChallenge, 
    leaveChallenge,
    logCompletion,
    getChallengeSummary,
    getUserLogs,
    isLoggingCompletion,
  } = useChallengeStore();

  const [logValue, setLogValue] = useState("");
  const [logNotes, setLogNotes] = useState("");
  const [showLogModal, setShowLogModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    if (challengeId) {
      getChallenge(challengeId).catch(err => {
        console.error('Failed to load challenge:', err);
        toast.error('Challenge not found');
        navigate('/challenges');
      });
      getChallengeSummary(challengeId).catch(err => console.error('Failed to load summary:', err));
      getUserLogs(challengeId).catch(err => console.error('Failed to load logs:', err));
    }
  }, [challengeId]);

  const isParticipant = currentChallenge?.participants?.some(
    p => p.userId?._id === authUser?._id || p.userId === authUser?._id
  );

  const isCreator = currentChallenge?.createdBy?._id === authUser?._id;

  const handleJoin = async () => {
    try {
      await joinChallenge(challengeId);
      await getChallengeSummary(challengeId);
    } catch (error) {
      // Error handled in store
    }
  };

  const handleLeave = async () => {
    if (!confirm("Are you sure you want to leave this challenge?")) return;
    try {
      await leaveChallenge(challengeId);
      navigate('/challenges');
    } catch (error) {
      // Error handled in store
    }
  };

  const handleLogCompletion = async (e) => {
    e.preventDefault();
    
    let value = logValue;
    if (currentChallenge.evidenceType === 'MANUAL_CHECK') {
      value = true;
    } else if (currentChallenge.evidenceType === 'NUMBER') {
      value = parseFloat(logValue);
      if (isNaN(value)) {
        toast.error("Please enter a valid number");
        return;
      }
    }

    try {
      await logCompletion(challengeId, {
        value,
        notes: logNotes,
        date: new Date().toISOString(),
      });
      setLogValue("");
      setLogNotes("");
      setShowLogModal(false);
      await getUserLogs(challengeId);
    } catch (error) {
      // Error handled in store
    }
  };

  const hasLoggedToday = () => {
    if (!userLogs || userLogs.length === 0) return false;
    const today = new Date().toISOString().split('T')[0];
    return userLogs.some(log => {
      const logDate = new Date(log.date).toISOString().split('T')[0];
      return logDate === today;
    });
  };

  if (!currentChallenge) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'FITNESS': return '💪';
      case 'READING': return '📚';
      case 'MEDITATION': return '🧘';
      case 'CODING': return '💻';
      case 'JOURNALING': return '📝';
      default: return '🎯';
    }
  };

  const userParticipant = currentChallenge.participants?.find(
    p => p.userId?._id === authUser?._id || p.userId === authUser?._id
  );

  return (
    <div className="min-h-screen pt-20 p-6 bg-gradient-to-br from-base-200 via-base-300 to-base-200">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="btn btn-ghost btn-sm gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {/* Header */}
        <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-2xl rounded-2xl mb-6">
          <div className="card-body p-8">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="text-6xl">{getCategoryIcon(currentChallenge.category)}</div>
                <div>
                  <h1 className="text-3xl font-bold mb-2">{currentChallenge.title}</h1>
                  <p className="text-base opacity-70 mb-4">{currentChallenge.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="badge badge-primary">{currentChallenge.category}</span>
                    <span className="badge badge-ghost">{currentChallenge.frequency}</span>
                    <span className="badge badge-info">{currentChallenge.evidenceType}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2">
                {isParticipant && (
                  <button onClick={() => setShowInviteModal(true)} className="btn btn-ghost gap-2">
                    <UserPlus className="w-5 h-5" />
                    Invite
                  </button>
                )}
                {!isParticipant ? (
                  <button onClick={handleJoin} className="btn btn-primary gap-2">
                    <Plus className="w-5 h-5" />
                    Join Challenge
                  </button>
                ) : !isCreator && (
                  <button onClick={handleLeave} className="btn btn-error btn-outline gap-2">
                    <LogOut className="w-5 h-5" />
                    Leave
                  </button>
                )}
              </div>
            </div>

            {/* Target */}
            <div className="mt-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-primary" />
                <div>
                  <div className="text-sm opacity-70">Daily Target</div>
                  <div className="text-lg font-bold">{currentChallenge.target}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Stats & Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Stats */}
            {isParticipant && userParticipant && (
              <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl rounded-2xl">
                <div className="card-body p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Your Progress
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-base-200/50 rounded-xl">
                      <div className="text-3xl font-bold text-primary">{userParticipant.currentStreak}</div>
                      <div className="text-xs opacity-70 mt-1">Current Streak</div>
                    </div>
                    <div className="text-center p-4 bg-base-200/50 rounded-xl">
                      <div className="text-3xl font-bold text-secondary">{userParticipant.longestStreak}</div>
                      <div className="text-xs opacity-70 mt-1">Longest Streak</div>
                    </div>
                    <div className="text-center p-4 bg-base-200/50 rounded-xl">
                      <div className="text-3xl font-bold text-success">{userParticipant.totalCompletions}</div>
                      <div className="text-xs opacity-70 mt-1">Total Days</div>
                    </div>
                    <div className="text-center p-4 bg-base-200/50 rounded-xl">
                      <div className="text-3xl font-bold text-warning">
                        {challengeSummary?.userStats?.complianceRate || 0}%
                      </div>
                      <div className="text-xs opacity-70 mt-1">Compliance</div>
                    </div>
                  </div>

                  {/* Log Button */}
                  <button
                    onClick={() => setShowLogModal(true)}
                    className={`btn btn-primary w-full mt-4 gap-2 ${hasLoggedToday() ? 'btn-disabled' : ''}`}
                    disabled={hasLoggedToday() || isLoggingCompletion}
                  >
                    <CheckCircle className="w-5 h-5" />
                    {hasLoggedToday() ? "✓ Logged Today" : "Log Today's Progress"}
                  </button>
                </div>
              </div>
            )}

            {/* Leaderboard */}
            {challengeSummary && (
              <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl rounded-2xl">
                <div className="card-body p-6">
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    Leaderboard
                  </h2>
                  <div className="space-y-2">
                    {challengeSummary.leaderboard?.map((entry, index) => (
                      <div
                        key={index}
                        className={`flex items-center gap-3 p-3 rounded-xl ${
                          entry.user._id === authUser?._id ? 'bg-primary/10 border border-primary/20' : 'bg-base-200/50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                          index === 0 ? 'bg-yellow-500 text-white' :
                          index === 1 ? 'bg-gray-400 text-white' :
                          index === 2 ? 'bg-orange-600 text-white' :
                          'bg-base-300'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center font-bold">
                          {entry.user.fullName?.[0] || entry.user.email?.[0]}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold">{entry.user.fullName || entry.user.email}</div>
                          <div className="text-xs opacity-60">
                            🔥 {entry.currentStreak} streak · {entry.totalCompletions} days
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-primary">{entry.complianceRate}%</div>
                          <div className="text-xs opacity-60">compliance</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Info */}
          <div className="space-y-6">
            {/* Challenge Info */}
            <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl rounded-2xl">
              <div className="card-body p-6">
                <h2 className="text-xl font-bold mb-4">Challenge Info</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 opacity-60" />
                    <div>
                      <div className="text-xs opacity-60">Duration</div>
                      <div className="font-semibold">
                        {new Date(currentChallenge.startDate).toLocaleDateString()} - {new Date(currentChallenge.endDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 opacity-60" />
                    <div>
                      <div className="text-xs opacity-60">Participants</div>
                      <div className="font-semibold">{currentChallenge.participants?.length || 0} members</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-5 h-5 opacity-60" />
                    <div>
                      <div className="text-xs opacity-60">Progress</div>
                      <div className="font-semibold">
                        Day {challengeSummary?.daysElapsed || 0} of {challengeSummary?.totalDays || 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Participants */}
            <div className="card bg-gradient-to-br from-base-100 to-base-200 shadow-xl rounded-2xl">
              <div className="card-body p-6">
                <h2 className="text-xl font-bold mb-4">Participants</h2>
                <div className="flex flex-wrap gap-2">
                  {currentChallenge.participants?.map((participant, index) => {
                    const user = participant.userId;
                    return (
                      <div
                        key={index}
                        className="tooltip"
                        data-tip={user?.fullName || user?.email}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center font-bold shadow-lg">
                          {user?.fullName?.[0] || user?.email?.[0] || '?'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowLogModal(false)}></div>
          <div className="relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Log Today's Progress</h3>
            <form onSubmit={handleLogCompletion} className="space-y-4">
              {currentChallenge.evidenceType === 'NUMBER' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Value *</span>
                  </label>
                  <input
                    type="number"
                    className="input input-bordered"
                    placeholder="Enter number..."
                    value={logValue}
                    onChange={(e) => setLogValue(e.target.value)}
                    required
                  />
                </div>
              )}
              {currentChallenge.evidenceType === 'TEXT' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Description *</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered"
                    placeholder="Describe what you did..."
                    value={logValue}
                    onChange={(e) => setLogValue(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Notes (optional)</span>
                </label>
                <textarea
                  className="textarea textarea-bordered"
                  placeholder="Any additional notes..."
                  value={logNotes}
                  onChange={(e) => setLogNotes(e.target.value)}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setShowLogModal(false)} className="btn btn-ghost">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={isLoggingCompletion}>
                  {isLoggingCompletion ? <Loader className="w-4 h-4 animate-spin" /> : 'Log Progress'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowInviteModal(false)}></div>
          <div className="relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <UserPlus className="w-6 h-6" />
              Invite to Challenge
            </h3>
            <p className="text-sm opacity-70 mb-4">
              Share this challenge link with others to invite them!
            </p>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text">Challenge Link</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="input input-bordered flex-1"
                  value={`${window.location.origin}/challenges/${challengeId}`}
                  readOnly
                />
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/challenges/${challengeId}`);
                    toast.success('Link copied to clipboard!');
                  }}
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="text-sm opacity-60 p-3 bg-info/10 rounded-lg border border-info/20">
              💡 Anyone with this link can view and join the challenge!
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={() => setShowInviteModal(false)} className="btn btn-ghost">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeDetailPage;
