import { useState } from "react";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { useFinanceStore } from "../store/useFinanceStore";
import toast from "react-hot-toast";

const RecordSettlementModal = ({ isOpen, onClose, workspaceId, workspace }) => {
  const { recordSettlement } = useFinanceStore();
  const [isRecording, setIsRecording] = useState(false);
  
  const [formData, setFormData] = useState({
    payerId: "",
    payeeId: "",
    amount: "",
    currency: "USD",
    notes: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.payerId || !formData.payeeId || !formData.amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (formData.payerId === formData.payeeId) {
      toast.error("Payer and payee cannot be the same");
      return;
    }

    setIsRecording(true);
    try {
      await recordSettlement({
        workspaceId,
        ...formData,
        amount: parseFloat(formData.amount),
      });
      
      // Reset form
      setFormData({
        payerId: "",
        payeeId: "",
        amount: "",
        currency: "USD",
        notes: "",
      });
      
      onClose();
    } catch (error) {
      // Error handled in store
    } finally {
      setIsRecording(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose}></div>

      <div className="relative bg-base-100 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="sticky top-0 bg-base-100 border-b border-base-300 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success to-primary flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-primary-content" />
            </div>
            <h2 className="text-2xl font-bold">Record Settlement</h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm btn-circle"
            disabled={isRecording}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Payer */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Who Paid? *</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={formData.payerId}
              onChange={(e) => setFormData({ ...formData, payerId: e.target.value })}
              required
              disabled={isRecording}
            >
              <option value="">Select payer</option>
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

          {/* Payee */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">To Whom? *</span>
            </label>
            <select
              className="select select-bordered w-full"
              value={formData.payeeId}
              onChange={(e) => setFormData({ ...formData, payeeId: e.target.value })}
              required
              disabled={isRecording}
            >
              <option value="">Select payee</option>
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
                disabled={isRecording}
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
                disabled={isRecording}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="INR">INR</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Notes</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full"
              placeholder="Payment method, reference, etc..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={isRecording}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-base-300">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isRecording}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-success gap-2"
              disabled={isRecording}
            >
              {isRecording ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Record Settlement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordSettlementModal;
