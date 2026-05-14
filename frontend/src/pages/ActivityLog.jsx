import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Download, Calendar, User, Globe, Monitor, Mail, Shield, ChevronRight } from 'lucide-react';

const ActivityLog = ({ mode = 'all' }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await fetch('/api/auth/admin/activities');
      if (response.ok) {
        setActivities(await response.json());
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    window.open('/api/auth/admin/export-activities', '_blank');
  };

  const filteredActivities = activities.filter(act => {
    // Mode-based filtering
    if (mode === 'logistics') {
      const logisticsTypes = ['login', 'logout', 'register', 'admin_action'];
      if (!logisticsTypes.includes(act.action_type)) return false;
    } else if (mode === 'attendance') {
      const attendanceTypes = ['exam_started', 'exam_completed'];
      if (!attendanceTypes.includes(act.action_type)) return false;
    } else if (mode === 'updates') {
      const updateTypes = ['exam_scheduled', 'system_update'];
      if (!updateTypes.includes(act.action_type)) return false;
    }

    const email = act.email || 'Anonymous';
    const matchesSearch = email.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         act.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || act.action_type === actionFilter;
    return matchesSearch && matchesAction;
  });

  const getActionBadgeClass = (type) => {
    switch (type) {
      case 'login': return 'bg-emerald-50 text-emerald-600';
      case 'logout': return 'bg-amber-50 text-amber-600';
      case 'register': return 'bg-blue-50 text-blue-600';
      case 'exam_completed': return 'bg-purple-50 text-purple-600';
      case 'exam_started': return 'bg-indigo-50 text-indigo-600';
      case 'exam_scheduled': return 'bg-pink-50 text-pink-600';
      default: return 'bg-slate-50 text-slate-500';
    }
  };

  const getHeaderTitle = () => {
    if (mode === 'logistics') return 'System Logistics & Authentication';
    if (mode === 'attendance') return 'Academic Attendance & Performance';
    if (mode === 'updates') return 'Curriculum Updates & Schedules';
    return 'Audit & Compliance';
  };

  const getHeaderSub = () => {
    if (mode === 'logistics') return 'Monitoring access patterns and security events.';
    if (mode === 'attendance') return 'Tracking real-time student engagement with assessments.';
    if (mode === 'updates') return 'Stay informed about new exams and system modifications.';
    return 'Real-time surveillance of system-wide transactional events.';
  };

  return (
    <div className="space-y-8 animate-fade">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">{getHeaderTitle()}</h2>
          <p className="text-slate-500 font-medium">{getHeaderSub()}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search events..." 
                className="w-full sm:w-64 pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          {mode !== 'updates' && (
            <button 
              onClick={handleExport}
              className="btn-pro btn-pro-secondary h-[54px] px-8 border-emerald-100 text-emerald-600 hover:bg-emerald-50"
            >
              <Download size={20} />
              <span>Export CSV</span>
            </button>
          )}
        </div>
      </div>

      {/* Activity Table */}
      <div className="admin-table-container">
        <div className="card-header">
           <div className="flex items-center gap-3">
              <Activity size={20} className="text-primary" />
              <h3 className="font-black text-slate-900">Event Registry</h3>
           </div>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Initiator</th>
                <th>Category</th>
                <th>Event Description</th>
                {mode !== 'updates' && <th>Client Intel</th>}
                <th className="text-right">Time Elapsed</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center text-slate-400 animate-pulse font-bold">Synchronizing Event Stream...</td></tr>
              ) : filteredActivities.map((act) => (
                <tr key={act.id} className="group">
                  <td>
                    <div className="user-cell">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <User size={18} />
                      </div>
                      <span className="font-bold text-slate-800 text-sm">{act.email || 'Anonymous'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getActionBadgeClass(act.action_type)}`}>
                      {act.action_type.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm font-medium text-slate-700 max-w-sm" title={act.description}>
                      {act.description}
                    </div>
                  </td>
                  {mode !== 'updates' && (
                    <td>
                      <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                        <Shield size={12} className="text-slate-300" />
                        {act.ip_address}
                      </div>
                    </td>
                  )}
                  <td className="text-right whitespace-nowrap">
                    <div className="text-xs font-black text-slate-800 flex items-center justify-end gap-2">
                      <Calendar size={12} className="text-slate-300" />
                      {new Date(act.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredActivities.length === 0 && !loading && (
            <div className="py-20 text-center font-bold text-slate-400 italic">No matching activities found for this category.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
