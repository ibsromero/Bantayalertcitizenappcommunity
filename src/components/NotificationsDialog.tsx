import { useState, useEffect } from "react";
import { Bell, CheckCircle2, AlertTriangle, Info, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";
import { toast } from "sonner@2.0.3";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearAllNotifications,
  type Notification,
} from "../utils/notificationsManager";

interface NotificationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: { name: string; email: string; accessToken?: string } | null;
}

export function NotificationsDialog({ isOpen, onClose, user }: NotificationsDialogProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, user?.accessToken]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const notifs = await getNotifications(user?.accessToken);
      setNotifications(notifs);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user?.accessToken);
      await loadNotifications();
      toast.success("Marked all as read");
    } catch (error) {
      toast.error("Failed to mark notifications as read");
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId, user?.accessToken);
      await loadNotifications();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications(user?.accessToken);
      await loadNotifications();
      toast.success("All notifications cleared");
    } catch (error) {
      toast.error("Failed to clear notifications");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return CheckCircle2;
      case "alert":
      case "warning":
        return AlertTriangle;
      default:
        return Info;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "alert":
      case "warning":
        return "text-orange-600";
      default:
        return "text-blue-600";
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Notifications</span>
            </div>
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2">
                {unreadCount} new
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            View and manage your emergency alerts and system notifications
          </DialogDescription>
          <DialogDescription>
            Stay updated with emergency alerts and app activity
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-gray-500">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No notifications</p>
          </div>
        ) : (
          <>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const IconComponent = getIcon(notification.type);
                  const iconColor = getColor(notification.type);

                  return (
                    <Card
                      key={notification.id}
                      className={`cursor-pointer transition-colors ${
                        !notification.read ? "bg-blue-50 border-blue-200" : ""
                      }`}
                      onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <IconComponent className={`h-5 w-5 mt-0.5 ${iconColor}`} />
                            <div className="flex-1">
                              <h4
                                className={`text-sm font-medium ${
                                  !notification.read ? "text-gray-900" : "text-gray-700"
                                }`}
                              >
                                {notification.title}
                              </h4>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">{notification.time}</p>
                            </div>
                          </div>
                          {!notification.read && (
                            <div className="h-2 w-2 bg-blue-600 rounded-full mt-2 ml-2"></div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>

            <div className="flex justify-between items-center pt-4 border-t gap-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead}>
                  Mark all as read
                </Button>
              )}
              {notifications.length > 0 && (
                <Button variant="ghost" size="sm" onClick={handleClearAll} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={onClose} className="ml-auto">
                Close
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
