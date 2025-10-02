import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

const CreateWorkspaceModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const { createWorkspace, isCreatingWorkspace } = useWorkspaceStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    try {
      await createWorkspace(formData);
      setFormData({ name: "", description: "" });
      onClose();
    } catch (error) {
      // Error handled in store
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
          <h2 className="text-xl font-bold">Create Workspace</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={isCreatingWorkspace}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Workspace Name *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g., My Team"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isCreatingWorkspace}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium">Description (optional)</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="What's this workspace for?"
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isCreatingWorkspace}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isCreatingWorkspace}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreatingWorkspace || !formData.name.trim()}
            >
              {isCreatingWorkspace ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Workspace"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateWorkspaceModal;
