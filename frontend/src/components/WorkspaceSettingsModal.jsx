import { useState } from "react";
import { X, UserMinus, LogOut, Shield, User as UserIcon } from "lucide-react";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { useAuthStore } from "../store/useAuthStore";
import { useNavigate } from "react-router-dom";

const WorkspaceSettingsModal = ({ isOpen, onClose, workspace }) => {
  const { removeMember, leaveWorkspace } = useWorkspaceStore();
  const { authUser } = useAuthStore();
  const navigate = useNavigate();
  const [isLeaving, setIsLeaving] = useState(false);

  if (!isOpen || !workspace) return null;

  const isOwner = workspace.ownerId === authUser?._id;
  const userRole = workspace.members?.find(m => m.userId?._id === authUser?._id || m.userId === authUser?._id)?.role;
  const isAdmin = userRole === 'ADMIN' || userRole === 'OWNER';

  const handleRemoveMember = async (memberId) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    
    try {
      await removeMember(workspace._id, memberId);
      // Close and reopen modal to show updated list
      onClose();
    } catch (error) {
      // Error handled in store
    }
  };

  const handleLeaveWorkspace = async () => {
    if (!confirm("Are you sure you want to leave this workspace? You'll need to be re-invited to rejoin.")) return;
    
    setIsLeaving(true);
    try {
      await leaveWorkspace(workspace._id);
      onClose();
      navigate('/workspaces');
    } catch (error) {
      // Error handled in store
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-base-100 rounded-lg shadow-xl w-full max-w-2xl p-6 m-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Workspace Settings</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workspace Info */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">{workspace.name}</h3>
          <p className="text-sm opacity-70">{workspace.description || "No description"}</p>
        </div>

        {/* Members List */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">Members ({workspace.members?.length || 0})</h3>
          <div className="space-y-2">
            {workspace.members?.map((member) => {
              const memberUser = member.userId;
              const memberId = memberUser?._id || memberUser;
              const isCurrentUser = memberId === authUser?._id;
              
              return (
                <div key={memberId} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-content flex items-center justify-center font-medium">
                      {memberUser?.fullName?.[0] || memberUser?.email?.[0] || "?"}
                    </div>
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {memberUser?.fullName || memberUser?.email || "Unknown"}
                        {isCurrentUser && <span className="badge badge-sm">You</span>}
                      </div>
                      <div className="text-xs opacity-70">{memberUser?.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {member.status === 'PENDING' ? (
                      <div className="badge badge-warning badge-sm">PENDING</div>
                    ) : (
                      <div className="badge badge-sm gap-1">
                        {member.role === 'OWNER' && <Shield className="w-3 h-3" />}
                        {member.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {member.role === 'MEMBER' && <UserIcon className="w-3 h-3" />}
                        {member.role}
                      </div>
                    )}
                    {isAdmin && !isCurrentUser && member.role !== 'OWNER' && (
                      <button
                        className="btn btn-ghost btn-xs btn-circle text-error"
                        onClick={() => handleRemoveMember(memberId)}
                        title="Remove member"
                      >
                        <UserMinus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leave Workspace */}
        {!isOwner && (
          <div className="border-t border-base-300 pt-4">
            <button
              className="btn btn-error btn-sm gap-2"
              onClick={handleLeaveWorkspace}
              disabled={isLeaving}
            >
              <LogOut className="w-4 h-4" />
              {isLeaving ? "Leaving..." : "Leave Workspace"}
            </button>
            <p className="text-xs opacity-60 mt-2">
              You'll need to be re-invited to rejoin this workspace.
            </p>
          </div>
        )}

        {isOwner && (
          <div className="border-t border-base-300 pt-4">
            <p className="text-sm opacity-70">
              <Shield className="w-4 h-4 inline mr-1" />
              As the owner, you cannot leave this workspace. Transfer ownership or delete it instead.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceSettingsModal;
