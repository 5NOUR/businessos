import { useState } from "react";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from "@/hooks/use-notifications";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NotificationBell() {
  const orgId = localStorage.getItem("currentOrgId");
  const [open, setOpen] = useState(false);
  const { data, isLoading } = useNotifications(orgId);
  const markRead = useMarkNotificationRead(orgId);
  const markAllRead = useMarkAllNotificationsRead(orgId);

  const unreadCount = data?.items.filter((n) => !n.isRead).length || 0;

  return (
    <div className="relative">
      <button
        className="p-2 rounded-full hover:bg-gray-100 relative"
        onClick={() => setOpen(!open)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllRead.mutate()}
              >
                Mark all read
              </Button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Loading...</div>
            ) : data?.items.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              data?.items.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 border-b cursor-pointer ${notification.isRead ? "bg-white" : "bg-blue-50"}`}
                  onClick={() => markRead.mutate(notification.id)}
                >
                  <p className="font-medium text-sm">{notification.title}</p>
                  {notification.body && (
                    <p className="text-xs text-gray-600">{notification.body}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
