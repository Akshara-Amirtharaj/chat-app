import { useState } from "react";
import { X, DollarSign, Loader2 } from "lucide-react";
import { useFinanceStore } from "../store/useFinanceStore";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const AddExpenseModal = ({ isOpen, onClose, workspaceId, workspace }) => {
  const { createExpense, isCreatingExpense } = useFinanceStore();
  const { authUser } = useAuthStore();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    amount: "",
    currency: "USD",
    paidBy: authUser?._id || "",
    category: "OTHER",
    splitType: "EQUAL",
    participants: [],
    splits: [],
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.amount || formData.participants.length === 0) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      const data = {
        workspaceId,
        ...formData,
        amount: parseFloat(formData.amount),
      };

      // Prepare splits based on split type
      if (formData.splitType === 'EQUAL') {
        data.participants = formData.participants;
      } else {
        data.splits = formData.splits;
      }

      await createExpense(data);
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        amount: "",
        currency: "USD",
        paidBy: authUser?._id || "",
        category: "OTHER",
        splitType: "EQUAL",
        participants: [],
        splits: [],
        notes: "",
      });
      
      onClose();
    } catch (error) {
      // Error handled in store
    }
  };

  const toggleParticipant = (userId) => {
    if (formData.participants.includes(userId)) {
      setFormData({
        ...formData,
        participants: formData.participants.filter(id => id !== userId),
      });
    } else {
      setFormData({
        ...formData,
        participants: [...formData.participants, userId],
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-base-100 border-b border-base-300 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-primary flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary-content" />
            </div>
            <h2 className="text-2xl font-bold">Add Expense</h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={isCreatingExpense}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Title *</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              placeholder="e.g., Dinner at restaurant"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              disabled={isCreatingExpense}
            />
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Additional details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isCreatingExpense}
            />
          </div>

          {/* Amount & Currency */}
          <div className="grid grid-cols-3 gap-4">
            <div className="form-control col-span-2">
              <label className="label">
                <span className="label-text font-semibold">Amount *</span>
              </label>
              <input
                type="number"
                step="0.01"
                className="input input-bordered w-full"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                disabled={isCreatingExpense}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Currency</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                disabled={isCreatingExpense}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>

          {/* Category & Paid By */}
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Category</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={isCreatingExpense}
              >
                <option value="FOOD">🍔 Food</option>
                <option value="TRANSPORT">🚗 Transport</option>
                <option value="ACCOMMODATION">🏠 Accommodation</option>
                <option value="ENTERTAINMENT">🎬 Entertainment</option>
                <option value="UTILITIES">💡 Utilities</option>
                <option value="SHOPPING">🛍️ Shopping</option>
                <option value="OTHER">💰 Other</option>
              </select>
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Paid By</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={formData.paidBy}
                onChange={(e) => setFormData({ ...formData, paidBy: e.target.value })}
                disabled={isCreatingExpense}
              >
                {workspace?.members?.map((member) => {
                  const user = member.userId;
                  return (
                    <option key={user._id} value={user._id}>
                      {user.fullName || user.email}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Split Type */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Split Type</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={formData.splitType}
              onChange={(e) => setFormData({ ...formData, splitType: e.target.value })}
              disabled={isCreatingExpense}
            >
              <option value="EQUAL">Equal Split</option>
              <option value="PERCENTAGE">By Percentage</option>
              <option value="AMOUNT">By Amount</option>
            </select>
          </div>

          {/* Participants */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Split Between *</span>
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-base-300 rounded-lg">
              {workspace?.members?.map((member) => {
                const user = member.userId;
                return (
                  <label key={user._id} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded-lg cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={formData.participants.includes(user._id)}
                      onChange={() => toggleParticipant(user._id)}
                      disabled={isCreatingExpense}
                    />
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center text-sm font-bold">
                      {user.fullName?.[0] || user.email?.[0]}
                    </div>
                    <span>{user.fullName || user.email}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Notes</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isCreatingExpense}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isCreatingExpense}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary gap-2"
              disabled={isCreatingExpense}
            >
              {isCreatingExpense ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Add Expense
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
