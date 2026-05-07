import React, { useState, useEffect } from 'react';
import { 
  Award, Activity, Users, Search, 
  Filter, Download, Calendar, BookOpen,
  ChevronRight, ArrowUpRight, TrendingUp,
  BarChart3
} from 'lucide-react';
import { motion } from 'framer-motion';

const ExamPerformance = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const res = await fetch('/api/portal/admin/exams/activities');
      if (res.ok) {
        setActivities(await res.json());
      }
    } catch (err) {
      console.error('Failed to fetch exam performance data');
    } finally {
      setLoading(false);
    }
  };

  const filtered = activities.filter(a => 
    (a.user_email.toLowerCase().includes(searchTerm.toLowerCase()) || 
     a.exam_title.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || a.status === statusFilter)
  );

  const stats = {
    total: activities.length,
    completed: activities.filter(a => a.status === 'Completed').length,
    avgScore: activities.filter(a => a.status === 'Completed').length > 0 
      ? Math.round(activities.filter(a => a.status === 'Completed').reduce((acc, curr) => acc + curr.score, 0) / activities.filter(a => a.status === 'Completed').length) 
      : 0,
    passRate: activities.filter(a => a.status === 'Completed').length > 0
      ? Math.round((activities.filter(a => a.status === 'Completed' && a.score >= 50).length / activities.filter(a => a.status === 'Completed').length) * 100)
      : 0
  };

  return (
    <div className="space-y-8 animate-fade">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Performance Analytics</h2>
          <p className="text-slate-500 font-medium">Global intelligence and candidate success metrics.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
           <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                className="w-full sm:w-64 pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <button className="btn-pro btn-pro-secondary h-[54px] px-8">
              <Download size={20} /> <span>Export Data</span>
           </button>
        </div>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <div className="card-pro">
            <div className="flex items-start justify-between mb-4">
               <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Activity size={20} /></div>
               <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+2.5%</div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Active Modules</p>
            <h4 className="text-3xl font-black text-slate-900">{stats.total}</h4>
         </div>
         <div className="card-pro">
            <div className="flex items-start justify-between mb-4">
               <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle2 size={20} /></div>
               <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+4.1%</div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Completion Index</p>
            <h4 className="text-3xl font-black text-slate-900">{stats.completed}</h4>
         </div>
         <div className="card-pro">
            <div className="flex items-start justify-between mb-4">
               <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><TrendingUp size={20} /></div>
               <div className="text-[10px] font-black text-rose-500 uppercase tracking-widest">-1.2%</div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Avg Accuracy</p>
            <h4 className="text-3xl font-black text-slate-900">{stats.avgScore}%</h4>
         </div>
         <div className="card-pro">
            <div className="flex items-start justify-between mb-4">
               <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Award size={20} /></div>
               <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">+12%</div>
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Pass Ratio</p>
            <h4 className="text-3xl font-black text-slate-900">{stats.passRate}%</h4>
         </div>
      </div>

      {/* Main Data View */}
      <div className="admin-table-container">
        <div className="card-header">
           <div className="flex items-center gap-3">
              <BarChart3 size={20} className="text-primary" />
              <h3 className="font-black text-slate-900">Candidate Performance Ledger</h3>
           </div>
           <div className="flex gap-2">
              <button 
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                All
              </button>
              <button 
                onClick={() => setStatusFilter('Completed')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'Completed' ? 'bg-emerald-500 text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                Finalized
              </button>
              <button 
                onClick={() => setStatusFilter('Started')}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === 'Started' ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
              >
                In Progress
              </button>
           </div>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Candidate Identity</th>
                <th>Assessment Module</th>
                <th>Phase Status</th>
                <th>Score Matrix</th>
                <th className="text-right">Activity Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center text-slate-400 animate-pulse font-bold">Synchronizing Intelligence Data...</td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((act) => (
                  <tr key={act.id} className="group">
                    <td>
                      <div className="user-cell">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black">
                           {act.user_email.charAt(0).toUpperCase()}
                        </div>
                        <div className="font-bold text-slate-900 text-sm">{act.user_email}</div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-primary" />
                        <span className="font-bold text-slate-700">{act.exam_title}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                         {act.status === 'Started' && <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />}
                         <span className={`badge ${act.status === 'Completed' ? 'role-user' : 'bg-slate-50 text-slate-400'}`}>
                           {act.status}
                         </span>
                      </div>
                    </td>
                    <td>
                       <div className={`font-black text-lg ${act.status === 'Completed' ? (act.score >= 50 ? 'text-emerald-500' : 'text-rose-500') : 'text-slate-200'}`}>
                          {act.status === 'Completed' ? `${act.score}%` : 'N/A'}
                       </div>
                    </td>
                    <td className="text-right">
                       <div className="text-xs font-black text-slate-800 flex items-center justify-end gap-2">
                          <Calendar size={12} className="text-slate-300" />
                          {new Date(act.started_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="py-20 text-center font-bold text-slate-400">No performance records found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CheckCircle2 = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
);

export default ExamPerformance;
