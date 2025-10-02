import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotificationStore } from "../store/useNotificationStore";
import { Loader, Bell, Check, Trash2, CheckCheck, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    isLoadingNotifications,
    getNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  } = useNotificationStore();

  useEffect(() => {
    getNotifications();
  }, [getNotifications]);

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'MENTION': return '💬';
      case 'TASK_ASSIGNED': return '📋';
      case 'TASK_DEADLINE': return '⏰';
      case 'INVITE': return '✉️';
      case 'CHALLENGE_REMINDER': return '🎯';
      case 'EXPENSE_ADDED': return '💰';
      case 'SETTLEMENT_REQUEST': return '💵';
      case 'WORKSPACE_UPDATE': return '🏢';
      case 'MESSAGE': return '💬';
      default: return '🔔';
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div className="min-h-screen pt-20 p-6 bg-gradient-to-br from-base-200 via-base-300 to-base-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-info to-primary flex items-center justify-center shadow-lg">
                  <Bell className="w-6 h-6 text-primary-content" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-info to-primary bg-clip-text text-transparent">
                    Notifications
                  </h1>
                  <p className="text-sm opacity-60 flex items-center gap-2">
                    {unreadCount > 0 ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
                        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-success"></span>
                        All caught up!
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="btn btn-ghost btn-sm gap-2"
                >
                  <CheckCheck className="w-4 h-4" />
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="btn btn-error btn-outline btn-sm gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        {isLoadingNotifications ? (
          <div className="flex items-center justify-center h-64">
            <Loader className="w-8 h-8 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No notifications</h3>
            <p className="text-sm opacity-70">You're all caught up! Check back later.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`card ${
                  notification.read ? 'bg-base-100' : 'bg-gradient-to-br from-info/10 to-primary/5 border-l-4 border-primary'
                } shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="card-body p-4">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="text-3xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className={`font-semibold ${!notification.read ? 'text-primary' : ''}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></span>
                        )}
                      </div>
                      <p className="text-sm opacity-70 mb-2">{notification.message}</p>
                      <div className="flex items-center gap-3 text-xs opacity-60">
                        <span>{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span>
                        {notification.workspaceId && (
                          <>
                            <span>•</span>
                            <span>{notification.workspaceId.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!notification.read && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            markAsRead(notification._id);
                          }}
                          className="btn btn-ghost btn-xs btn-circle"
                          title="Mark as read"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(notification._id);
                        }}
                        className="btn btn-ghost btn-xs btn-circle text-error"
                        title="Delete"
                      >
                        <X className="w-4 h-4" />
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

export default NotificationsPage;
