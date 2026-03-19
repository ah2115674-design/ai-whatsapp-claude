import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../AuthContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  Trash2,
  Loader2,
  Inbox,
  MessageSquare,
  Users,
  TrendingUp,
} from 'lucide-react';
import { cn } from '../lib/utils';
import type { Notification } from '../types';

export function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  async function fetchNotifications() {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setNotifications(data || []);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
      if (error) throw error;
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase.from('notifications').delete().eq('id', id);
      if (error) throw error;
      setNotifications(notifications.filter((n) => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  const getIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('lead')) return <Users className="text-blue-600" />;
    if (t.includes('message') || t.includes('inquiry')) return <MessageSquare className="text-emerald-600" />;
    if (t.includes('conversion') || t.includes('sale')) return <TrendingUp className="text-purple-600" />;
    return <Bell className="text-orange-600" />;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Notifications</h1>
          <p className="text-zinc-500">Stay updated with your business activity.</p>
        </div>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={() => notifications.filter((n) => !n.is_read).forEach((n) => markAsRead(n.id))}
            className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            Mark all as read
          </button>
        )}
      </header>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-3xl border border-zinc-200 p-12 text-center shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-50 text-zinc-400 mb-4">
            <Inbox size={32} />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900">All caught up!</h3>
          <p className="text-zinc-500 mt-1">No new notifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={cn(
                'bg-white p-4 rounded-2xl border transition-all flex items-start gap-4 group',
                notification.is_read
                  ? 'border-zinc-100 opacity-75'
                  : 'border-emerald-100 bg-emerald-50/10 shadow-sm'
              )}
            >
              <div
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  notification.is_read ? 'bg-zinc-100' : 'bg-white shadow-sm'
                )}
              >
                {getIcon(notification.title)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4
                    className={cn(
                      'text-sm font-bold',
                      notification.is_read ? 'text-zinc-700' : 'text-zinc-900'
                    )}
                  >
                    {notification.title}
                  </h4>
                  <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <Clock size={10} />
                    {new Date(notification.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-zinc-600 line-clamp-2">{notification.message}</p>
                <div className="mt-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!notification.is_read && (
                    <button
                      onClick={() => markAsRead(notification.id)}
                      className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline"
                    >
                      <CheckCircle2 size={12} />
                      Mark as read
                    </button>
                  )}
                  <button
                    onClick={() => deleteNotification(notification.id)}
                    className="text-xs font-bold text-red-600 flex items-center gap-1 hover:underline"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
