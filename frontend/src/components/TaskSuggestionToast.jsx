import { useState } from "react";
import { CheckCircle, X, Sparkles } from "lucide-react";
import { useBoardStore } from "../store/useBoardStore";
import toast from "react-hot-toast";

const TaskSuggestionToast = ({ tasks, onClose, workspaceId }) => {
  const { createTask } = useBoardStore();
  const [creating, setCreating] = useState(false);

  const handleCreateTask = async (task) => {
    setCreating(true);
    try {
      await createTask({
        ...task,
        workspaceId: workspaceId || task.workspaceId,
      });
      toast.success(`Task created: ${task.title}`);
      onClose();
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setCreating(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'badge-error';
      case 'MEDIUM': return 'badge-warning';
      case 'LOW': return 'badge-info';
      default: return 'badge-ghost';
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 backdrop-blur-lg shadow-2xl border border-primary/20">
        <div className="card-body p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
              <h3 className="font-bold text-lg">AI Task Suggestions</h3>
            </div>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-xs btn-circle"
              disabled={creating}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-sm opacity-70 mb-3">
            I detected {tasks.length} potential task{tasks.length !== 1 ? 's' : ''} in your message:
          </p>

          <div className="space-y-2">
            {tasks.map((task, index) => (
              <div
                key={index}
                className="p-3 bg-base-100/50 rounded-lg border border-base-300/50 hover:border-primary/50 transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`badge badge-sm ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      {task.dueDate && (
                        <span className="text-xs opacity-60">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-xs opacity-60">
                        {Math.round(task.confidence * 100)}% confidence
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCreateTask(task)}
                    className="btn btn-primary btn-xs gap-1"
                    disabled={creating}
                  >
                    <CheckCircle className="w-3 h-3" />
                    Create
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 text-xs opacity-60 text-center">
            💡 Powered by AI pattern recognition
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskSuggestionToast;
