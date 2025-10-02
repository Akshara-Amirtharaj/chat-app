import { useState } from "react";
import { X, Loader2, Mail, UserPlus } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const InviteMembersModal = ({ isOpen, onClose, workspaceId, workspaceName }) => {
  const [emails, setEmails] = useState("");
  const [role, setRole] = useState("MEMBER");
  const [isInviting, setIsInviting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const emailList = emails
      .split(",")
      .map(email => email.trim())
      .filter(email => email);

    if (emailList.length === 0) {
      toast.error("Please enter at least one email");
      return;
    }

    setIsInviting(true);
    try {
      await axiosInstance.post(`/workspaces/${workspaceId}/invites`, {
        emails: emailList,
        role,
      });
      
      toast.success(`Invited ${emailList.length} member(s) successfully`);
      setEmails("");
      onClose();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to send invites";
      toast.error(errorMsg);
    } finally {
      setIsInviting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-base-100 rounded-lg shadow-xl w-full max-w-md p-6 m-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            <h2 className="text-xl font-bold">Invite Members</h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={isInviting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm opacity-70 mb-4">
          Invite people to <span className="font-semibold">{workspaceName}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Email Addresses *</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Enter email addresses separated by commas&#10;e.g., user1@example.com, user2@example.com"
              rows="3"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              required
              disabled={isInviting}
            />
            <label className="label">
              <span className="label-text-alt opacity-60">
                <Mail className="w-3 h-3 inline mr-1" />
                Separate multiple emails with commas
              </span>
            </label>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Role</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              disabled={isInviting}
            >
              <option value="MEMBER">Member</option>
              <option value="ADMIN">Admin</option>
              <option value="GUEST">Guest</option>
            </select>
            <label className="label">
              <span className="label-text-alt opacity-60">
                {role === "ADMIN" && "Can manage workspace settings and members"}
                {role === "MEMBER" && "Can view and edit content"}
                {role === "GUEST" && "Limited access to workspace"}
              </span>
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isInviting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isInviting}
            >
              {isInviting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  Send Invites
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InviteMembersModal;
