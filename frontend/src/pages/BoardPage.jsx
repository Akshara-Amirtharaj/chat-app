import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useBoardStore } from "../store/useBoardStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";
import { Loader, Plus, MoreVertical, Trash2, Edit2, UserPlus, Settings, Users, DollarSign } from "lucide-react";
import InviteMembersModal from "../components/InviteMembersModal";
import WorkspaceSettingsModal from "../components/WorkspaceSettingsModal";

const BoardPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { columns, tasks, getBoardData, createTask, updateTask, deleteTask, isLoadingBoard } = useBoardStore();
  const { workspaces } = useWorkspaceStore();
  const [draggedTask, setDraggedTask] = useState(null);
  const [addingTaskToColumn, setAddingTaskToColumn] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const workspace = workspaces.find(w => w._id === id);

  useEffect(() => {
    if (id) {
      getBoardData(id);
    }
  }, [id, getBoardData]);

  const handleCreateTask = async (status) => {
    if (!newTaskTitle.trim()) return;

    try {
      await createTask({
        workspaceId: id,
        title: newTaskTitle,
        description: "",
        status,
      });
      setNewTaskTitle("");
      setAddingTaskToColumn(null);
    } catch (error) {
      // Error handled in store
    }
  };

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, status) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === status) {
      setDraggedTask(null);
      return;
    }

    try {
      await updateTask(draggedTask._id, {
        status,
        workspaceId: id,
      });
    } catch (error) {
      // Error handled in store
    }
    setDraggedTask(null);
  };

  const getTasksForColumn = (status) => {
    return tasks.filter(task => task.status === status);
  };

  return (
    <div className="min-h-screen pt-20 p-6 bg-gradient-to-br from-base-200 via-base-300 to-base-200">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                  <span className="text-2xl font-bold text-primary-content">
                    {workspace?.name?.[0] || "W"}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    {workspace?.name || "Workspace"}
                  </h1>
                  <p className="text-sm opacity-60 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
                    Organize tasks with drag & drop
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                className="btn btn-ghost btn-sm gap-2 hover:bg-base-100 transition-all duration-200"
                onClick={() => navigate(`/workspaces/${id}/finance`)}
              >
                <DollarSign className="w-4 h-4" />
                Finance
              </button>
              <button
                className="btn btn-ghost btn-sm gap-2 hover:bg-base-100 transition-all duration-200"
                onClick={() => setIsSettingsModalOpen(true)}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                className="btn btn-primary btn-sm gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setIsInviteModalOpen(true)}
              >
                <UserPlus className="w-4 h-4" />
                Invite
              </button>
            </div>
          </div>

          {/* Participants */}
          {workspace?.members && workspace.members.length > 0 && (
            <div className="flex items-center gap-4 p-4 bg-base-100/50 backdrop-blur-sm rounded-2xl border border-base-300/50 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {workspace.members.filter(m => m.status !== 'PENDING').length} Active
                    {workspace.members.filter(m => m.status === 'PENDING').length > 0 && 
                      <span className="text-warning ml-2">· {workspace.members.filter(m => m.status === 'PENDING').length} Pending</span>}
                  </div>
                  <div className="text-xs opacity-60">Team Members</div>
                </div>
              </div>
              <div className="flex -space-x-3">
                {workspace.members.filter(m => m.status !== 'PENDING').slice(0, 5).map((member, index) => {
                  const user = member.userId;
                  const memberId = user?._id || user || member._id;
                  return (
                    <div
                      key={`member-${memberId}-${index}`}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center text-sm font-bold border-3 border-base-100 tooltip hover:scale-110 transition-transform duration-200 cursor-pointer shadow-lg"
                      data-tip={`${user?.fullName || user?.email || 'Unknown'} (${member.role})`}
                    >
                      {user?.fullName?.[0] || user?.email?.[0] || '?'}
                    </div>
                  );
                })}
                {workspace.members.filter(m => m.status !== 'PENDING').length > 5 && (
                  <div className="w-10 h-10 rounded-full bg-base-300 flex items-center justify-center text-sm font-semibold border-3 border-base-100 shadow-lg">
                    +{workspace.members.filter(m => m.status !== 'PENDING').length - 5}
                  </div>
                )}
              </div>
              <button
                className="btn btn-ghost btn-sm ml-auto gap-2 hover:bg-base-200"
                onClick={() => setIsSettingsModalOpen(true)}
              >
                View All
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {isLoadingBoard ? (
          <div className="flex items-center justify-center h-[60vh]">
            <Loader className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {/* Columns */}
            {columns.map((column) => (
              <div
                key={column._id}
                className="flex-shrink-0 w-80 bg-base-100/70 backdrop-blur-sm rounded-2xl p-4 border border-base-300/50 shadow-lg hover:shadow-xl transition-all duration-200"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.status)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-base-300/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      column.status === 'TODO' ? 'bg-gray-400' :
                      column.status === 'IN_PROGRESS' ? 'bg-blue-500 animate-pulse' :
                      column.status === 'IN_REVIEW' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`}></div>
                    <h3 className="font-bold text-lg">{column.name}</h3>
                    <span className="badge badge-primary badge-sm">{getTasksForColumn(column.status).length}</span>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-2 min-h-[200px]">
                  {getTasksForColumn(column.status).map((task) => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task)}
                      className="card bg-gradient-to-br from-base-200 to-base-300 p-4 cursor-move hover:shadow-xl hover:scale-105 transition-all duration-200 group border border-base-300/50 rounded-xl"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            {task.title}
                          </h4>
                          {task.description && (
                            <p className="text-xs opacity-70 line-clamp-2 mb-3">{task.description}</p>
                          )}
                          {task.assigneeId && (
                            <div className="flex items-center gap-2 mt-3">
                              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary text-primary-content flex items-center justify-center text-xs font-bold border-2 border-base-100 shadow-md">
                                {task.assigneeId.fullName?.[0] || task.assigneeId.email?.[0] || "?"}
                              </div>
                              <span className="text-xs opacity-60">{task.assigneeId.fullName || task.assigneeId.email}</span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => deleteTask(task._id)}
                          className="btn btn-ghost btn-xs btn-circle opacity-0 group-hover:opacity-100 hover:bg-error/20 hover:text-error transition-all duration-200"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Add Task Button */}
                  {addingTaskToColumn === column.status ? (
                    <div className="card bg-base-200 p-3">
                      <input
                        type="text"
                        className="input input-sm input-bordered w-full mb-2"
                        placeholder="Task title..."
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleCreateTask(column.status);
                          if (e.key === "Escape") {
                            setAddingTaskToColumn(null);
                            setNewTaskTitle("");
                          }
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          className="btn btn-primary btn-xs"
                          onClick={() => handleCreateTask(column.status)}
                        >
                          Add
                        </button>
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => {
                            setAddingTaskToColumn(null);
                            setNewTaskTitle("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-ghost btn-sm w-full justify-start"
                      onClick={() => setAddingTaskToColumn(column.status)}
                    >
                      <Plus className="w-4 h-4" />
                      Add Task
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Members Modal */}
      <InviteMembersModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        workspaceId={id}
        workspaceName={workspace?.name || "Workspace"}
      />

      {/* Workspace Settings Modal */}
      <WorkspaceSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        workspace={workspace}
      />
    </div>
  );
};

export default BoardPage;
