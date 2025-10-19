import { Bell, CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Card, CardContent } from "./ui/card";

interface NotificationsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsDialog({ isOpen, onClose }: NotificationsDialogProps) {
  const notifications = [
    {
      id: 1,
      type: "alert",
      title: "Heavy Rainfall Warning",
      message: "PAGASA issued a heavy rainfall warning for NCR. Monitor updates.",
      time: "2 hours ago",
      read: false,
      icon: AlertTriangle,
      color: "text-orange-600"
    },
    {
      id: 2,
      type: "success",
      title: "Emergency Kit Updated",
      message: "Your emergency kit checklist has been updated successfully.",
      time: "5 hours ago",
      read: true,
      icon: CheckCircle2,
      color: "text-green-600"
    },
    {
      id: 3,
      type: "info",
      title: "Evacuation Center Reminder",
      message: "Know your nearest evacuation center: Quezon City Hall (6km away).",
      time: "1 day ago",
      read: true,
      icon: Info,
      color: "text-blue-600"
    },
    {
      id: 4,
      type: "alert",
      title: "Thunderstorm Advisory",
      message: "Moderate to heavy rainshowers expected this afternoon.",
      time: "2 days ago",
      read: true,
      icon: AlertTriangle,
      color: "text-orange-600"
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

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
            Stay updated with emergency alerts and app activity
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {notifications.map((notification) => {
              const IconComponent = notification.icon;
              return (
                <Card 
                  key={notification.id} 
                  className={`${!notification.read ? 'bg-blue-50 border-blue-200' : ''}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1">
                        <IconComponent className={`h-5 w-5 mt-0.5 ${notification.color}`} />
                        <div className="flex-1">
                          <h4 className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
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

        <div className="flex justify-between items-center pt-4 border-t">
          <Button variant="ghost" size="sm">
            Mark all as read
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
