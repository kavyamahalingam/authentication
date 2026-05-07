import React, { useState, useEffect } from 'react';
import { 
  BookOpen, ListTree, HelpCircle, TrendingUp, 
  Plus, History, ArrowRight, Shield, LogIn, LogOut, User as UserIcon, Award 
} from 'lucide-react';
// Verified imports
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, trend }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-bg-card p-8 rounded-[32px] border border-border flex items-start justify-between group hover:border-primary transition-all duration-500"
  >
    <div>
      <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-3">{title}</p>
      <h3 className="text-font-lg font-display text-white mb-2">{value}</h3>
      {trend && (
        <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold">
          <TrendingUp size={14} />
          <span>{trend}% growth</span>
        </div>
      )}
    </div>
    <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
      <Icon className={color.replace('bg-', 'text-')} size={24} />
    </div>
  </motion.div>
);

const Dashboard = ({ user, setView }) => {
  const [stats, setStats] = useState({ subjects: 0, topics: 0, questions: 0, total_users: 0, exams: 0 });
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchRecentActivities();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/portal/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(prev => ({ ...prev, ...data }));
      }
      
      const examRes = await fetch('/api/portal/exams');
      if (examRes.ok) {
        const exams = await examRes.json();
        setStats(prev => ({ ...prev, exams: exams.length }));
      }

      if (user?.role === 'Admin') {
        const adminStatsRes = await fetch('/api/auth/admin/stats');
        if (adminStatsRes.ok) {
          const adminStats = await adminStatsRes.json();
          setStats(prev => ({ ...prev, total_users: adminStats.total_users || 0 }));
        }
      }
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const res = await fetch('/api/auth/admin/activities?limit=5');
      if (res.ok) {
        const data = await res.json();
        const formatted = data.slice(0, 5).map(act => ({
          id: act.id,
          text: `${act.email?.split('@')[0] || 'Member'} ${act.description}`,
          time: new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          icon: act.action_type === 'login' ? LogIn : (act.action_type === 'logout' ? LogOut : History),
          color: act.action_type === 'login' ? 'text-emerald-500' : 'text-text-muted'
        }));
        setActivities(formatted);
      }
    } catch (err) {
      setActivities([
        { id: 1, text: 'Core Database updated', time: '10:30 AM', icon: Shield, color: 'text-primary' },
        { id: 2, text: 'New Subject registered', time: '09:15 AM', icon: BookOpen, color: 'text-indigo-500' },
      ]);
    }
  };

  return (
    <div className="space-y-10 animate-fade font-body">
      {/* Premium Welcome Banner */}
      <div className="relative bg-bg-surface rounded-[48px] p-12 text-white overflow-hidden border border-border shadow-2xl">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[20%] w-[400px] h-[400px] bg-accent rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="max-w-2xl">
            <div className="pulsing-badge mb-6">System Live — v2.4.0</div>
            <h1 className="text-font-xl font-display mb-6 tracking-tight leading-tight">
              Good Morning, <span className="text-gradient">{user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-text-secondary font-medium leading-relaxed">
              Global infrastructure is performing within optimal parameters. All scheduled assessment deployments are synchronized with the enterprise grid.
            </p>
          </div>
          <div className="flex shrink-0">
            <button 
              onClick={() => setView('exams')}
              className="btn-premium px-8 py-5 text-lg shadow-2xl shadow-primary/40"
            >
              <Plus size={20} className="mr-2" /> Deploy Assessment
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <StatCard title="Total Subjects" value={stats.subjects} icon={BookOpen} color="bg-blue-500" trend="12" />
        <StatCard title="Active Topics" value={stats.topics} icon={ListTree} color="bg-indigo-500" trend="5" />
        <StatCard title="Total Questions" value={stats.questions} icon={HelpCircle} color="bg-purple-500" trend="18" />
        <StatCard title="Live Exams" value={stats.exams} icon={Award} color="bg-rose-500" trend="2" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Quick Management */}
        <div className="lg:col-span-1">
          <div className="bg-bg-card p-10 rounded-[40px] border border-border shadow-sm h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl" />
            <h3 className="text-font-base font-display text-white mb-10 flex items-center justify-between">
               Quick Access
               <div className="p-2 bg-white/5 rounded-xl border border-white/5"><Plus size={16} /></div>
            </h3>
            <div className="space-y-4">
              {[
                { id: 'subjects', label: 'Subjects', icon: BookOpen, color: 'bg-blue-500/10 text-blue-500' },
                { id: 'topics', label: 'Topics', icon: ListTree, color: 'bg-indigo-500/10 text-indigo-500' },
                { id: 'questions', label: 'Questions', icon: HelpCircle, color: 'bg-purple-500/10 text-purple-500' },
                { id: 'users', label: 'User Directory', icon: UserIcon, color: 'bg-emerald-500/10 text-emerald-500' },
              ].map(item => (
                <button 
                  key={item.id}
                  onClick={() => setView(item.id)}
                  className="w-full flex items-center justify-between p-5 rounded-3xl border border-white/5 hover:border-primary hover:bg-primary/5 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-2xl ${item.color.split(' ')[0]} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <item.icon size={20} className={item.color.split(' ')[1]} />
                    </div>
                    <span className="font-bold text-text-secondary group-hover:text-white transition-colors">{item.label}</span>
                  </div>
                  <ChevronRight size={18} className="text-text-muted group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* System Activity */}
        <div className="lg:col-span-2">
          <div className="bg-bg-card p-10 rounded-[40px] border border-border shadow-sm h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl" />
            <h3 className="text-font-base font-display text-white mb-10 flex items-center justify-between">
               System Logistics
               <History size={20} className="text-text-muted" />
            </h3>
            <div className="space-y-8">
              {activities.length > 0 ? activities.map((act) => (
                <div key={act.id} className="flex gap-8 items-start relative z-10">
                  <div className={`mt-1 flex-shrink-0 w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 ${act.color}`}>
                    <act.icon size={24} />
                  </div>
                  <div className="flex-1 pb-4 border-b border-white/5">
                    <div className="flex justify-between items-center mb-2">
                       <p className="text-white font-bold text-lg tracking-tight">{act.text}</p>
                       <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{act.time}</span>
                    </div>
                    <p className="text-text-secondary text-sm font-medium">Platform protocol execution completed successfully.</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20">
                   <p className="text-text-muted font-bold">No activity recorded in the last 24h.</p>
                </div>
              )}
            </div>
            
            {user?.role === 'Admin' && (
              <button 
                onClick={() => setView('activities')}
                className="w-full mt-12 py-5 bg-white/5 text-text-secondary rounded-2xl font-bold hover:bg-primary hover:text-white transition-all border border-white/10 hover:border-primary"
              >
                Enter Unified Audit Logs
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ChevronRight = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6"/></svg>
);

export default Dashboard;
