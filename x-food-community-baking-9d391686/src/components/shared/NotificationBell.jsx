import React, { useState, useEffect } from "react";
import { Notification, User } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Bell, Mail, Star, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { formatDistanceToNow } from 'date-fns';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const user = await User.me();
      const userNotifications = await Notification.filter({ user_email: user.email }, "-created_date", 20);
      setNotifications(userNotifications);
      setUnreadCount(userNotifications.filter(n => !n.is_read).length);
    } catch (error) {
      // Not logged in or error fetching
    }
  };

  const handleMarkAsRead = async (notification) => {
    if (!notification.is_read) {
      await Notification.update(notification.id, { is_read: true });
      fetchNotifications();
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'message': return <MessageCircle className="w-4 h-4 text-purple-500" />;
      case 'like': return <Star className="w-4 h-4 text-yellow-500" />;
      case 'comment': return <Mail className="w-4 h-4 text-blue-500" />;
      default: return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 justify-center bg-red-500 text-white rounded-full text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-4 border-b">
          <h4 className="font-medium text-lg">Notifications</h4>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <Link
                key={notification.id}
                to={notification.link_to || "#"}
                onClick={() => handleMarkAsRead(notification)}
                className={`flex items-start gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 ${!notification.is_read ? 'bg-orange-50' : ''}`}
              >
                <div className="mt-1">{getIcon(notification.type)}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{notification.content}</p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
                  </p>
                </div>
              </Link>
            ))
          ) : (
            <p className="p-8 text-center text-sm text-gray-500">No new notifications.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}