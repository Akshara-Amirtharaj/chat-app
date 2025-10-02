import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import CreateWorkspaceModal from "../components/CreateWorkspaceModal";
import InviteMembersModal from "../components/InviteMembersModal";
import { Loader, Users, MessageSquare, UserPlus, Plus, Trash2 } from "lucide-react";

const WorkspaceDashboard = () => {
  const { authUser } = useAuthStore();
  const { workspaces, getWorkspaces, isLoadingWorkspaces, deleteWorkspace } = useWorkspaceStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteWorkspace, setInviteWorkspace] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getWorkspaces();
  }, [getWorkspaces]);

  const handleOpenWorkspace = (workspaceId) => {
    // Navigate to first channel or board
    navigate(`/workspaces/${workspaceId}/board`);
  };

  const handleDeleteWorkspace = async (workspaceId, workspaceName) => {
    if (window.confirm(`Are you sure you want to delete "${workspaceName}"? This action cannot be undone.`)) {
      try {
        await deleteWorkspace(workspaceId);
      } catch (error) {
        // Error is handled in the store
      }
    }
  };

  return (
    <div className="min-h-screen pt-20 p-6 bg-gradient-to-br from-base-200 via-base-300 to-base-200">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Workspaces
          </h1>
          <p className="text-base opacity-70 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
            Welcome{authUser ? `, ${authUser.fullName || authUser.username}` : ""}. Manage or create workspaces.
          </p>

          <button 
            className="btn btn-primary gap-2 shadow-lg hover:shadow-xl transition-all duration-200" 
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-5 h-5" />
            New Workspace
          </button>
        </div>

        {isLoadingWorkspaces ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 animate-spin" />
          </div>
        ) : workspaces.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No workspaces yet</h3>
            <p className="text-sm opacity-70 mb-4">Create your first workspace to get started</p>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              Create Workspace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <div key={workspace._id} className="card bg-gradient-to-br from-base-100 to-base-200 hover:shadow-2xl transition-all duration-300 hover:scale-105 border border-base-300/50 rounded-2xl overflow-hidden group">
                <div className="card-body p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg flex-shrink-0">
                      <span className="text-xl font-bold text-primary-content">
                        {workspace.name?.[0] || "W"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="card-title text-lg font-bold truncate">{workspace.name}</h2>
                      <p className="text-xs opacity-60 line-clamp-2 mt-1">
                        {workspace.description || "No description"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 mt-4 p-3 bg-base-200/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-primary/10 rounded-lg">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm font-semibold">{workspace.members?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-secondary/10 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-secondary" />
                      </div>
                      <span className="text-sm font-semibold">{workspace.channels?.length || 0}</span>
                    </div>
                  </div>
                  
                  <div className="card-actions justify-between mt-4 gap-2">
                    <button
                      className="btn btn-sm btn-error btn-outline gap-2 hover:btn-error"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteWorkspace(workspace._id, workspace.name);
                      }}
                      title="Delete workspace"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-sm btn-ghost gap-2 hover:bg-base-300"
                        onClick={() => setInviteWorkspace(workspace)}
                      >
                        <UserPlus className="w-4 h-4" />
                        Invite
                      </button>
                      <button
                        className="btn btn-sm btn-primary gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                        onClick={() => handleOpenWorkspace(workspace._id)}
                      >
                        Open
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateWorkspaceModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {inviteWorkspace && (
        <InviteMembersModal
          isOpen={!!inviteWorkspace}
          onClose={() => setInviteWorkspace(null)}
          workspaceId={inviteWorkspace._id}
          workspaceName={inviteWorkspace.name}
        />
      )}
    </div>
  );
};

export default WorkspaceDashboard;
