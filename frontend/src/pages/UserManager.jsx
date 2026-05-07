import React, { useState, useEffect } from 'react';
import { Users, Shield, User as UserIcon, UserCheck, MoreVertical, Search, Filter, Mail, Calendar, LogIn, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const UserManager = ({ currentUser }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/portal/users');
      if (response.ok) {
        setUsers(await response.json());
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    if (!window.confirm(`Escalate/De-escalate user role to ${newRole}?`)) return;
    
    setUpdatingId(userId);
    try {
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_access_token='))?.split('=')[1];
      const res = await fetch(`/api/portal/users/${userId}/role`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) fetchUsers();
    } catch (error) {
      alert('Role update failed');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8 animate-fade">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Identity & Access</h2>
          <p className="text-slate-500 font-medium">Govern system privileges and monitor staff enrollment.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search directory..." 
                className="w-full sm:w-64 pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="w-full sm:w-48 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 appearance-none font-bold text-slate-800"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Privileges</option>
              <option value="Admin">Administrator</option>
              <option value="Teacher">Instructional Staff</option>
              <option value="Content Creator">Content Creator</option>
              <option value="user">Candidate</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="card-pro flex items-center gap-6">
            <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
               <Users size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Directory</p>
               <h4 className="text-2xl font-black text-slate-900">{users.length}</h4>
            </div>
         </div>
         <div className="card-pro flex items-center gap-6">
            <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center">
               <Shield size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Admin Presence</p>
               <h4 className="text-2xl font-black text-slate-900">{users.filter(u => u.role === 'Admin').length}</h4>
            </div>
         </div>
         <div className="card-pro flex items-center gap-6">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
               <UserCheck size={24} />
            </div>
            <div>
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Now</p>
               <h4 className="text-2xl font-black text-slate-900">{users.filter(u => u.last_login).length}</h4>
            </div>
         </div>
      </div>

      {/* User Table */}
      <div className="admin-table-container">
        <div className="card-header">
           <div className="flex items-center gap-3">
              <Users size={20} className="text-primary" />
              <h3 className="font-black text-slate-900">User Enrollment</h3>
           </div>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Identity</th>
                <th>Classification</th>
                <th>Authentication History</th>
                <th className="text-right">Governance</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="py-20 text-center text-slate-400 animate-pulse font-bold">Synchronizing User Database...</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="group">
                  <td>
                    <div className="user-cell">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${user.role === 'Admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                        {user.role === 'Admin' ? <Shield size={22} /> : <span>{user.email.charAt(0).toUpperCase()}</span>}
                      </div>
                      <div>
                        <div className="user-name">{user.email}</div>
                        <div className="user-email flex items-center gap-1">
                          <Calendar size={12} /> Joined {new Date(user.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${
                      user.role === 'Admin' ? 'role-admin' : (user.role === 'user' ? 'role-user' : 'role-staff')
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.last_login ? (
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-emerald-500" />
                        <span className="text-xs font-bold text-slate-700">{new Date(user.last_login).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase">No Activity Logged</span>
                    )}
                  </td>
                  <td className="text-right">
                    {currentUser.role === 'Admin' && user.id !== currentUser.id ? (
                      <div className="flex items-center justify-end gap-3">
                        <select 
                          className="px-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-black focus:border-primary outline-none"
                          value={user.role}
                          disabled={updatingId === user.id}
                          onChange={(e) => handleRoleUpdate(user.id, e.target.value)}
                        >
                          <option value="user">Candidate</option>
                          <option value="Teacher">Teacher</option>
                          <option value="Content Creator">Creator</option>
                          <option value="Admin">Administrator</option>
                        </select>
                        <ChevronRight size={16} className="text-slate-200" />
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-slate-300 uppercase italic">Immutable</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredUsers.length === 0 && !loading && (
            <div className="py-20 text-center font-bold text-slate-400">No identities match the current query.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManager;
