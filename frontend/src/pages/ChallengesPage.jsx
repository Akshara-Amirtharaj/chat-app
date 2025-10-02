import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useChallengeStore } from "../store/useChallengeStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { Loader, Plus, Target, Calendar, Users, TrendingUp, Award, Filter } from "lucide-react";
import CreateChallengeModal from "../components/CreateChallengeModal";

const ChallengesPage = () => {
  const { id } = useParams(); // workspace ID (optional)
  const navigate = useNavigate();
  const { challenges, getChallenges, isLoadingChallenges } = useChallengeStore();
  const { workspaces } = useWorkspaceStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("ongoing");

  const workspace = workspaces.find(w => w._id === id);

  useEffect(() => {
    getChallenges(id, statusFilter);
  }, [id, statusFilter, getChallenges]);

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

  const getCategoryColor = (category) => {
    switch (category) {
      case 'FITNESS': return 'badge-error';
      case 'READING': return 'badge-info';
      case 'MEDITATION': return 'badge-success';
      case 'CODING': return 'badge-warning';
      case 'JOURNALING': return 'badge-secondary';
      default: return 'badge-primary';
    }
  };

  const getStatusBadge = (challenge) => {
    const now = new Date();
    const start = new Date(challenge.startDate);
    const end = new Date(challenge.endDate);

    if (now < start) return <span className="badge badge-info badge-sm">Upcoming</span>;
    if (now > end) return <span className="badge badge-ghost badge-sm">Completed</span>;
    return <span className="badge badge-success badge-sm">Ongoing</span>;
  };

  const getDaysRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : 'Ended';
  };

  return (
    <div className="min-h-screen pt-20 p-6 bg-gradient-to-br from-base-200 via-base-300 to-base-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-success to-primary flex items-center justify-center shadow-lg">
                  <Target className="w-6 h-6 text-primary-content" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-success to-primary bg-clip-text text-transparent">
                    {workspace ? `${workspace.name} Challenges` : 'My Challenges'}
                  </h1>
                  <p className="text-sm opacity-60 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    Track habits, build streaks, achieve goals
                  </p>
                </div>
              </div>
            </div>
            <button
              className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <Plus className="w-5 h-5" />
              New Challenge
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 p-1 bg-base-100/50 backdrop-blur-sm rounded-xl border border-base-300/50 w-fit">
            {['ongoing', 'upcoming', 'completed'].map((status) => (
              <button
                key={status}
                className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setStatusFilter(status)}
              >
                <Filter className="w-4 h-4" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Challenges Grid */}
        {isLoadingChallenges ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 animate-spin" />
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-12">
            <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No {statusFilter} challenges</h3>
            <p className="text-sm opacity-70 mb-4">Create your first challenge to get started</p>
            <button className="btn btn-primary gap-2" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="w-5 h-5" />
              Create Challenge
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {challenges.map((challenge) => (
              <div
                key={challenge._id}
                className="card bg-gradient-to-br from-base-100 to-base-200 hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-base-300/50 rounded-2xl overflow-hidden cursor-pointer group"
                onClick={() => {
                  console.log('Navigating to:', `/challenges/${challenge._id}`);
                  navigate(`/challenges/${challenge._id}`);
                }}
              >
                <div className="card-body p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-3xl">{getCategoryIcon(challenge.category)}</span>
                      <span className={`badge ${getCategoryColor(challenge.category)} badge-sm`}>
                        {challenge.category}
                      </span>
                    </div>
                    {getStatusBadge(challenge)}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold mb-2 line-clamp-2">{challenge.title}</h3>
                  <p className="text-sm opacity-70 line-clamp-2 mb-4">
                    {challenge.description || 'No description'}
                  </p>

                  {/* Stats */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 opacity-60" />
                      <span className="opacity-80">{getDaysRemaining(challenge.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 opacity-60" />
                      <span className="opacity-80">{challenge.participants?.length || 0} participants</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="w-4 h-4 opacity-60" />
                      <span className="opacity-80">{challenge.frequency}</span>
                    </div>
                  </div>

                  {/* Target */}
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      <span className="text-sm font-semibold">Target: {challenge.target}</span>
                    </div>
                  </div>

                  {/* Participants Avatars */}
                  {challenge.participants && challenge.participants.length > 0 && (
                    <div className="flex -space-x-3 mt-4">
                      {challenge.participants.slice(0, 5).map((participant, index) => {
                        const user = participant.userId;
                        return (
                          <div
                            key={index}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center text-xs font-bold border-2 border-base-100 shadow-md"
                            title={user?.fullName || user?.email}
                          >
                            {user?.fullName?.[0] || user?.email?.[0] || '?'}
                          </div>
                        );
                      })}
                      {challenge.participants.length > 5 && (
                        <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-xs font-semibold border-2 border-base-100">
                          +{challenge.participants.length - 5}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Challenge Modal */}
      <CreateChallengeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        workspaceId={id}
      />
    </div>
  );
};

export default ChallengesPage;
