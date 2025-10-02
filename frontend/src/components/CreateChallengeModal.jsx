import { useState } from "react";
import { X, Target, Loader2 } from "lucide-react";
import { useChallengeStore } from "../store/useChallengeStore";
import toast from "react-hot-toast";

const CreateChallengeModal = ({ isOpen, onClose, workspaceId = null }) => {
  const { createChallenge, isCreatingChallenge } = useChallengeStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: new Date().toISOString().split('T')[0],
    endDate: "",
    frequency: "DAILY",
    target: "",
    evidenceType: "MANUAL_CHECK",
    category: "CUSTOM",
    reminderTime: "09:00",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.startDate || !formData.endDate || !formData.target) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("End date must be after start date");
      return;
    }

    try {
      await createChallenge({
        ...formData,
        workspaceId,
      });
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        startDate: new Date().toISOString().split('T')[0],
        endDate: "",
        frequency: "DAILY",
        target: "",
        evidenceType: "MANUAL_CHECK",
        category: "CUSTOM",
        reminderTime: "09:00",
      });
      
      onClose();
    } catch (error) {
      // Error handled in store
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      {/* Modal */}
      <div className="relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-base-100 border-b border-base-300 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-primary flex items-center justify-center">
              <Target className="w-5 h-5 text-primary-content" />
            </div>
            <h2 className="text-2xl font-bold">Create Challenge</h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={isCreatingChallenge}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Challenge Title *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g., 30-Day Fitness Challenge"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              disabled={isCreatingChallenge}
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-24"
              placeholder="Describe your challenge goals and rules..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isCreatingChallenge}
            />
          </div>

          {/* Category */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Category</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              disabled={isCreatingChallenge}
            >
              <option value="CUSTOM">🎯 Custom</option>
              <option value="FITNESS">💪 Fitness</option>
              <option value="READING">📚 Reading</option>
              <option value="MEDITATION">🧘 Meditation</option>
              <option value="CODING">💻 Coding</option>
              <option value="JOURNALING">📝 Journaling</option>
            </select>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Start Date *</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
                disabled={isCreatingChallenge}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">End Date *</span>
              </label>
              <input
                type="date"
                className="input input-bordered w-full"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
                disabled={isCreatingChallenge}
              />
            </div>
          </div>

          {/* Frequency & Evidence Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Frequency</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                disabled={isCreatingChallenge}
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="CUSTOM">Custom</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Evidence Type</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.evidenceType}
                onChange={(e) => setFormData({ ...formData, evidenceType: e.target.value })}
                disabled={isCreatingChallenge}
              >
                <option value="MANUAL_CHECK">✓ Manual Check</option>
                <option value="NUMBER">🔢 Number</option>
                <option value="TEXT">📝 Text</option>
                <option value="PHOTO">📷 Photo</option>
              </select>
            </div>
          </div>

          {/* Target */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Target Goal *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g., Read 20 pages, 30 minutes exercise, 100 push-ups"
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              required
              disabled={isCreatingChallenge}
            />
          </div>

          {/* Reminder Time */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Daily Reminder Time</span>
            </label>
            <input
              type="time"
              className="input input-bordered w-full"
              value={formData.reminderTime}
              onChange={(e) => setFormData({ ...formData, reminderTime: e.target.value })}
              disabled={isCreatingChallenge}
            />
            <label className="label">
              <span className="label-text-alt opacity-60">Get reminded to log your progress</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isCreatingChallenge}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={isCreatingChallenge}
            >
              {isCreatingChallenge ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4" />
                  Create Challenge
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChallengeModal;
