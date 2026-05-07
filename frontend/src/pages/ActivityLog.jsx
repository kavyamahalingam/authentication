import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, Download, Calendar, User, Globe, Monitor, Mail, Shield, ChevronRight } from 'lucide-react';

const ActivityLog = () => {
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
      case 'page_view': return 'bg-slate-50 text-slate-500';
      default: return 'bg-indigo-50 text-indigo-600';
    }
  };

  return (
    <div className="space-y-8 animate-fade">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Audit & Compliance</h2>
          <p className="text-slate-500 font-medium">Real-time surveillance of system-wide transactional events.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search audit trail..." 
                className="w-full sm:w-64 pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="w-full sm:w-48 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 appearance-none font-bold text-slate-800"
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
            >
              <option value="all">All Events</option>
              <option value="login">Logins</option>
              <option value="logout">Logouts</option>
              <option value="register">Enrollments</option>
              <option value="page_view">Navigation</option>
            </select>
          </div>
          <button 
            onClick={handleExport}
            className="btn-pro btn-pro-secondary h-[54px] px-8 border-emerald-100 text-emerald-600 hover:bg-emerald-50"
          >
            <Download size={20} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Activity Table */}
      <div className="admin-table-container">
        <div className="card-header">
           <div className="flex items-center gap-3">
              <Activity size={20} className="text-primary" />
              <h3 className="font-black text-slate-900">System Logs</h3>
           </div>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Initiator</th>
                <th>Event Type</th>
                <th>Transactional Detail</th>
                <th>Origin / Client</th>
                <th className="text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center text-slate-400 animate-pulse font-bold">Retrieving Security Logs...</td></tr>
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
                      {act.action_type}
                    </span>
                  </td>
                  <td>
                    <div className="text-sm font-medium text-slate-700 max-w-xs truncate" title={act.description}>
                      {act.description}
                    </div>
                    {act.page_url && (
                      <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-bold uppercase tracking-widest">
                        <Globe size={10} /> {act.page_url}
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="text-xs font-black text-slate-900 flex items-center gap-2">
                      <Shield size={12} className="text-slate-300" />
                      {act.ip_address}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 truncate w-40 font-medium">
                      <Monitor size={10} /> {act.user_agent}
                    </div>
                  </td>
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
            <div className="py-20 text-center font-bold text-slate-400 italic">No events recorded in this period.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLog;
