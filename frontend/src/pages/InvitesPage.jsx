import { useEffect } from "react";
import { useInviteStore } from "../store/useInviteStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { Loader, Mail, Users } from "lucide-react";

const InvitesPage = () => {
  const { invites, getInvites, acceptInvite, declineInvite, isLoadingInvites, isRespondingToInvite } = useInviteStore();
  const { getWorkspaces } = useWorkspaceStore();

  useEffect(() => {
    getInvites();
  }, [getInvites]);

  const handleAccept = async (inviteToken) => {
    await acceptInvite(inviteToken, () => {
      // Refresh workspaces to update member count
      getWorkspaces();
    });
  };

  const handleDecline = async (inviteToken) => {
    await declineInvite(inviteToken);
  };

  return (
    <div className="min-h-screen pt-20 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Invites</h1>
        <p className="text-sm opacity-70 mb-6">Accept or decline workspace invitations.</p>

        {isLoadingInvites ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 animate-spin" />
          </div>
        ) : invites.length === 0 ? (
          <div className="text-center py-12">
            <Mail className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No pending invites</h3>
            <p className="text-sm opacity-70">You're all caught up!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {invites.map((invite) => (
              <div key={invite._id} className="card bg-base-200">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h2 className="card-title text-lg mb-1">
                        {invite.workspaceId?.name || "Workspace"}
                      </h2>
                      <p className="text-sm opacity-70 mb-2">
                        From: {invite.invitedBy?.fullName || invite.invitedBy?.email || "Admin"}
                      </p>
                      {invite.workspaceId?.description && (
                        <p className="text-sm opacity-60 mb-2">{invite.workspaceId.description}</p>
                      )}
                      <div className="flex items-center gap-2 text-xs opacity-50">
                        <Users className="w-3 h-3" />
                        <span>{invite.workspaceId?.members?.length || 0} members</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => handleAccept(invite.token)}
                        disabled={isRespondingToInvite}
                      >
                        {isRespondingToInvite ? <Loader className="w-4 h-4 animate-spin" /> : "Accept"}
                      </button>
                      <button
                        className="btn btn-error btn-sm"
                        onClick={() => handleDecline(invite.token)}
                        disabled={isRespondingToInvite}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitesPage;
