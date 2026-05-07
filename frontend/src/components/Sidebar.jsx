import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  ShieldCheck, 
  LogOut, 
  Activity, 
  Bell,
  ChevronRight,
  Award,
  Lock
} from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, onLogout }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'users', label: 'User Directory', icon: <Users size={20} /> },
    { id: 'exams', label: 'Certifications', icon: <Award size={20} /> },
    { id: 'activities', label: 'Audit Trail', icon: <Activity size={20} /> },
    { id: 'security', label: 'Security Phase', icon: <Lock size={20} /> },
    { id: 'settings', label: 'System Prefs', icon: <Settings size={20} /> },
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-brand px-8 py-10 flex items-center gap-4">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30">
          <ShieldCheck size={26} color="white" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight leading-none">AdminPro</h2>
          <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">Enterprise Console</p>
        </div>
      </div>

      <div className="sidebar-nav-container flex-1 px-4 mt-4">
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 ml-4">Governing Modules</p>
        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <button
              key={item.id}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative group ${
                activeTab === item.id 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <span className={`transition-colors ${activeTab === item.id ? 'text-primary' : 'group-hover:text-white'}`}>
                {item.icon}
              </span>
              <span className="font-bold text-sm tracking-tight">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="sidebar-active" className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full" />
              )}
              <ChevronRight size={14} className={`ml-auto transition-all ${activeTab === item.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'}`} />
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-footer p-6">
        <div className="p-4 bg-white/5 rounded-2xl mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-xs font-black text-white">AD</div>
            <div>
              <p className="text-sm font-bold text-white leading-none">Administrator</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">Level 4 Clearance</p>
            </div>
          </div>
        </div>
        <button className="logout-button-pro w-full" onClick={onLogout}>
          <LogOut size={18} />
          <span>Terminate Session</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
