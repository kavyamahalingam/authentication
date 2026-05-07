import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { 
  Users, 
  UserCheck, 
  TrendingUp, 
  Search,
  Edit2,
  Trash2,
  Filter,
  Download,
  Calendar,
  Activity as ActivityIcon,
  Award,
  BookOpen,
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import '../styles/admin.css';

const AdminPanel = ({ user, onLogout }) => {
  if (user?.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center p-20 bg-slate-900 text-white">
        <div className="w-24 h-24 bg-rose-500/10 text-rose-500 rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-rose-500/20">
           <ShieldAlert size={48} />
        </div>
        <h1 className="text-5xl font-black mb-4 tracking-tight">Access Denied</h1>
        <p className="text-slate-400 text-lg font-medium max-w-md leading-relaxed mb-10">
          Your credentials do not possess the necessary administrative clearance for this terminal.
        </p>
        <button className="btn-pro btn-pro-primary px-12" onClick={() => window.location.href = '/'}>Return to Safety</button>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeNow: 0,
    loginsToday: 0,
    examsCount: 0
  });

  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [examActivities, setExamActivities] = useState([]);
  const [filters, setFilters] = useState({
    user_id: '',
    action_type: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchActivities();
    fetchExamActivities();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/auth/admin/stats');
      if (res.ok) {
        const data = await res.json();
        setStats({
          totalUsers: data.total_users,
          activeNow: data.active_sessions,
          loginsToday: data.logins_today,
          examsCount: 0 // Placeholder
        });
      }
    } catch (err) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchActivities = async (appliedFilters = filters) => {
    try {
      const queryParams = new URLSearchParams(appliedFilters).toString();
      const res = await fetch(`/api/auth/admin/activities?${queryParams}`);
      if (res.ok) {
        setActivities(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch activities');
    }
  };

  const fetchExamActivities = async () => {
    try {
      const res = await fetch('/api/portal/admin/exams/activities');
      if (res.ok) {
        setExamActivities(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch exam activities');
    }
  };

  const handleExport = () => {
    window.location.href = '/api/auth/admin/export-activities';
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        setUsers(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch users');
    }
  };

  const DashboardStat = ({ icon, label, value, trend, color }) => (
    <div className="stat-card group">
      <div className={`stat-icon ${color} group-hover:scale-110 transition-transform`}>{icon}</div>
      <div className="stat-info">
        <span className="stat-label">{label}</span>
        <h3 className="stat-value">{value}</h3>
        <span className="stat-trend positive">{trend} this interval</span>
      </div>
    </div>
  );

  return (
    <div className="admin-layout animate-fade">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />
      
      <main className="admin-main">
        <header className="admin-header px-6 md:px-10">
          <div className="header-left">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight capitalize">{activeTab}</h1>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">AdminPro Governance Console</p>
          </div>
          <div className="header-right flex items-center gap-6">
            <div className="search-bar hidden md:flex">
              <Search size={18} className="text-slate-300" />
              <input type="text" placeholder="Global audit search..." className="bg-transparent border-none outline-none text-sm font-bold w-full" />
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black shadow-xl">AD</div>
          </div>
        </header>

        <div className="admin-content p-6 md:p-10">
          {activeTab === 'dashboard' && (
            <div className="space-y-10">
              <div className="stats-grid">
                <DashboardStat icon={<Users size={24} />} label="System Population" value={stats.totalUsers} trend="+4.2%" color="blue" />
                <DashboardStat icon={<UserCheck size={24} />} label="Live Sessions" value={stats.activeNow} trend="+2.1%" color="green" />
                <DashboardStat icon={<TrendingUp size={24} />} label="Logins (24h)" value={stats.loginsToday} trend="+1.5%" color="purple" />
                <DashboardStat icon={<Award size={24} />} label="Certifications" value={examActivities.length} trend="+8.4%" color="red" />
              </div>

              <div className="admin-table-container">
                <div className="card-header">
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-primary" />
                    <h3 className="font-black text-slate-900">Privileged Accounts</h3>
                  </div>
                  <button className="btn-pro btn-pro-secondary text-xs py-2 px-4" onClick={() => setActiveTab('users')}>Expand Directory</button>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Identity</th>
                        <th>Classification</th>
                        <th>Deployment Status</th>
                        <th>Registry Date</th>
                        <th className="text-right">Governance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.slice(0, 6).map(u => (
                        <tr key={u.id} className="group">
                          <td>
                            <div className="user-cell">
                              <div className="user-avatar">{u.email.charAt(0).toUpperCase()}</div>
                              <div>
                                <div className="user-name">{u.email.split('@')[0]}</div>
                                <div className="user-email">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td><span className={`badge ${u.role === 'admin' ? 'role-admin' : 'role-staff'}`}>{u.role}</span></td>
                          <td>
                             <div className="status-indicator active font-black text-[10px] uppercase tracking-widest">Active System</div>
                          </td>
                          <td className="text-xs font-bold text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                          <td>
                            <div className="action-buttons justify-end">
                              <button className="action-btn"><Edit2 size={16} /></button>
                              <button className="action-btn delete"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-8">
              <div className="card-pro flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                  <Users size={16} className="text-slate-400" />
                  <select 
                    className="bg-transparent border-none outline-none text-xs font-black"
                    value={filters.user_id} 
                    onChange={(e) => setFilters({...filters, user_id: e.target.value})}
                  >
                    <option value="">Full Audit Trail</option>
                    {users.map(u => <option key={u.id} value={u.id}>{u.email}</option>)}
                  </select>
                </div>
                <button className="btn-pro btn-pro-primary text-xs py-3 px-6" onClick={() => fetchActivities()}>Run Analytics</button>
                <button className="btn-pro btn-pro-secondary text-xs py-3 px-6 ml-auto" onClick={handleExport}>
                  <Download size={16} /> Export Governance Data (CSV)
                </button>
              </div>

              <div className="admin-table-container">
                <div className="card-header">
                  <div className="flex items-center gap-3">
                    <ActivityIcon size={20} className="text-primary" />
                    <h3 className="font-black text-slate-900">Real-time Transaction Logs</h3>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Event Category</th>
                        <th>Transaction Summary</th>
                        <th className="text-right">Time Offset</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activities.map(act => (
                        <tr key={act.id} className="group">
                          <td><div className="font-black text-slate-900 text-sm">{act.email || 'Anonymous'}</div></td>
                          <td><span className={`badge ${act.action_type === 'login' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-500'}`}>{act.action_type}</span></td>
                          <td><div className="text-sm font-medium text-slate-500 max-w-md truncate">{act.description}</div></td>
                          <td className="text-right text-xs font-black text-slate-800">{new Date(act.timestamp).toLocaleString([], {hour:'2-digit', minute:'2-digit', second:'2-digit'})}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'exams' && (
             <div className="admin-table-container">
                <div className="card-header">
                  <div className="flex items-center gap-3">
                    <Award size={20} className="text-primary" />
                    <h3 className="font-black text-slate-900">Certification Performance</h3>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Assessment Module</th>
                        <th>Governance Status</th>
                        <th>Score Index</th>
                        <th className="text-right">Completion Offset</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examActivities.map(act => (
                        <tr key={act.id} className="group">
                          <td><div className="font-black text-slate-900 text-sm">{act.user_email}</div></td>
                          <td>
                            <div className="flex items-center gap-2">
                              <BookOpen size={14} className="text-primary" />
                              <span className="font-bold text-slate-700">{act.exam_title}</span>
                            </div>
                          </td>
                          <td>
                             <span className={`badge ${act.status === 'Completed' ? 'role-user' : 'bg-slate-50 text-slate-400'}`}>{act.status}</span>
                          </td>
                          <td>
                             <div className={`font-black text-lg ${act.score >= 50 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {act.status === 'Completed' ? `${act.score}%` : 'N/A'}
                             </div>
                          </td>
                          <td className="text-right text-xs font-bold text-slate-400">
                             {act.completed_at ? new Date(act.completed_at).toLocaleString() : 'Processing...'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          )}

          {['users', 'reports', 'settings', 'security'].includes(activeTab) && (
            <div className="py-40 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-slate-100">
                 <ShieldAlert size={40} className="text-slate-200" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 mb-2">Module Offline</h2>
              <p className="text-slate-500 font-medium max-w-md mx-auto">This specialized governing module is currently undergoing security maintenance and will be available in the next deployment cycle.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
