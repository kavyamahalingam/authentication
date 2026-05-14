import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, Shield, AlertCircle, CheckCircle, Info, Clock, X, Check } from 'lucide-react';

const NotificationPanel = ({ user, isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/auth/notifications');
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unread_count);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_access_token='))?.split('=')[1];
      const response = await fetch('/api/auth/notifications/mark-read', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ ids: unreadIds })
      });
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Failed to mark read:', error);
    }
  };

  const getIcon = (category) => {
    switch (category) {
      case 'Exam Scheduled': return <Calendar className="text-blue-500" size={18} />;
      case 'Exam Completed': return <CheckCircle className="text-emerald-500" size={18} />;
      case 'Exam Attended': return <Info className="text-indigo-500" size={18} />;
      case 'Security': return <Shield className="text-rose-500" size={18} />;
      case 'System': return <Clock className="text-slate-500" size={18} />;
      case 'Logistics': return <AlertCircle className="text-amber-500" size={18} />;
      default: return <Bell className="text-primary" size={18} />;
    }
  };

  const getRoleHeader = () => {
    if (['Admin'].includes(user.role)) return "System Logistics";
    if (['Teacher', 'Content Creator', 'staff'].includes(user.role)) return "Academic Activities";
    return "Curriculum Updates";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-slate-900/20 backdrop-blur-sm lg:hidden"
          />
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-24 right-6 md:right-10 w-96 max-h-[600px] bg-white rounded-[32px] shadow-2xl z-[101] flex flex-col border border-slate-100 overflow-hidden"
          >
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="font-black text-slate-900 tracking-tight">{getRoleHeader()}</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                  {unreadCount > 0 ? `${unreadCount} New Alerts` : 'System Synchronized'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                 <button onClick={markAllAsRead} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors" title="Mark all as read">
                   <Check size={20} />
                 </button>
                 <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                   <X size={20} />
                 </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 scrollbar-hide">
              {loading ? (
                <div className="py-20 text-center font-bold text-slate-300 animate-pulse">Synchronizing feed...</div>
              ) : notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className={`p-4 rounded-2xl mb-1 transition-all flex gap-4 ${notif.is_read ? 'opacity-60 grayscale-[0.5]' : 'bg-slate-50 border border-slate-100 shadow-sm shadow-slate-100/50'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notif.is_read ? 'bg-slate-100' : 'bg-white shadow-sm'}`}>
                      {getIcon(notif.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{notif.category}</span>
                        <span className="text-[10px] font-medium text-slate-400">{new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-sm font-bold text-slate-800 leading-snug">{notif.description}</p>
                      {notif.email && !['Admin'].includes(user.role) && (
                        <p className="text-[10px] font-medium text-primary mt-1">Initiated by {notif.email.split('@')[0]}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                   <div className="w-16 h-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-4 text-slate-200">
                      <Bell size={32} />
                   </div>
                   <p className="font-bold text-slate-400">No recent notifications</p>
                   <p className="text-xs text-slate-300 mt-1">All clear for today.</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-50 text-center">
               <button onClick={onClose} className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">Dismiss Panel</button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
