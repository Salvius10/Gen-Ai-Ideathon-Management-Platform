import { useState, useEffect } from 'react';
import { notificationsApi } from '../api/notifications';
import { Notification } from '../types';
import { formatDistanceToNow } from '../utils/date';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    notificationsApi.getAll().then(setNotifications).catch(() => {});
    const interval = setInterval(() => {
      notificationsApi.getAll().then(setNotifications).catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              {unread > 0 && (
                <button onClick={markAllRead} className="text-xs text-brand-600 hover:text-brand-700 font-medium">
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
              {notifications.length === 0 ? (
                <p className="text-center text-sm text-gray-400 py-8">No notifications</p>
              ) : (
                notifications.map((n) => (
                  <div key={n.id} className={`p-4 ${n.read ? 'opacity-60' : 'bg-brand-50'}`}>
                    <p className="text-sm font-medium text-gray-900">{n.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(n.createdAt)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
