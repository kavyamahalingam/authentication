import React, { useState } from 'react';
import { 
  LayoutDashboard, BookOpen, ListTree, HelpCircle, 
  Settings, LogOut, Menu, X, Shield, Bell, User, Users, Activity as ActivityIcon, Award, Search 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PortalLayout = ({ user, activeView, setView, onLogout, children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { id: 'staff_dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'topics', label: 'Topics', icon: ListTree },
    { id: 'questions', label: 'Questions', icon: HelpCircle },
    { id: 'exams', label: 'Exams', icon: Award },
    { id: 'exam_performance', label: 'Exam Performance', icon: ActivityIcon },
    { id: 'users', label: 'Users Directory', icon: Users },
    user?.role === 'Admin' && { id: 'activities', label: 'System Logs', icon: ActivityIcon },
    { id: 'settings', label: 'Settings', icon: Settings },
  ].filter(Boolean);

  return (
    <div className="flex h-screen bg-bg-deep text-text-primary font-body">
      {/* Premium Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="w-72 bg-bg-surface text-white flex flex-col shadow-2xl z-50 fixed lg:relative h-full border-r border-border"
          >
            <div className="p-8 flex items-center gap-4 border-b border-border">
              <div className="w-11 h-11 bg-primary rounded-[18px] flex items-center justify-center shadow-2xl shadow-primary/30">
                <Shield size={24} color="white" />
              </div>
              <div>
                <h1 className="font-display text-lg leading-tight tracking-tight">StaffPro</h1>
                <p className="text-[10px] text-primary font-black uppercase tracking-[0.2em]">{user?.role}</p>
              </div>
              <button className="lg:hidden ml-auto text-text-muted" onClick={() => setSidebarOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="p-4 mt-6">
              <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] mb-4 ml-4">Management</p>
              <nav className="space-y-1.5">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 relative group ${
                      activeView === item.id 
                        ? 'bg-primary/10 text-primary shadow-sm' 
                        : 'hover:bg-white/5 text-text-secondary hover:text-white'
                    }`}
                  >
                    <item.icon size={20} className={activeView === item.id ? 'text-primary' : 'group-hover:text-white'} />
                    <span className="font-bold text-sm tracking-tight">{item.label}</span>
                    {activeView === item.id && (
                       <motion.div layoutId="active" className="absolute left-0 w-1.5 h-6 bg-primary rounded-r-full" />
                    )}
                  </button>
                ))}
              </nav>
            </div>

            <div className="mt-auto p-6 border-t border-border">
              <div className="p-4 bg-bg-card rounded-2xl mb-6 border border-border">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-bg-surface border border-border flex items-center justify-center text-xs font-black">
                       {user?.email?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                       <p className="text-sm font-bold truncate">{user?.email?.split('@')[0]}</p>
                       <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Enterprise</p>
                    </div>
                 </div>
              </div>
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl text-rose-500 hover:bg-rose-500/10 transition-all font-black text-xs uppercase tracking-[0.2em] border border-rose-500/10"
              >
                <LogOut size={18} />
                <span>Term. Session</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Modern Header */}
        <header className="h-24 bg-bg-deep/80 backdrop-blur-xl border-b border-border px-6 md:px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-6">
            {!isSidebarOpen && (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-3 bg-bg-card text-white rounded-2xl hover:bg-primary transition-all border border-border"
              >
                <Menu size={20} />
              </button>
            )}
            <div>
              <h2 className="text-font-lg font-display text-white tracking-tight capitalize">
                {menuItems.find(m => m.id === activeView)?.label || 'Dashboard'}
              </h2>
              <p className="text-xs text-text-muted font-medium">System / Management / {activeView.replace('_', ' ')}</p>
            </div>
          </div>

          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center bg-bg-card rounded-2xl px-5 py-3 border border-border w-80 group focus-within:border-primary transition-all">
               <Search size={18} className="text-text-muted group-focus-within:text-primary" />
               <input type="text" placeholder="Global system search..." className="bg-transparent border-none outline-none ml-3 text-sm font-bold w-full text-white" />
            </div>

            <div className="flex items-center gap-4">
              <button className="p-3 text-text-muted hover:text-primary hover:bg-primary/5 rounded-2xl transition-all relative">
                <Bell size={22} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-bg-deep"></span>
              </button>
              <div className="h-10 w-px bg-border mx-2" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-bg-card rounded-[18px] flex items-center justify-center text-primary font-black border border-border hover:scale-105 transition-transform cursor-pointer">
                  <User size={22} />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Viewport */}
        <main className="flex-1 overflow-y-auto bg-bg-deep">
          <div className="p-6 md:p-10 max-w-7xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PortalLayout;
