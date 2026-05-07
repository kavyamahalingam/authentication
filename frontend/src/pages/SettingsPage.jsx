import React, { useState, useEffect } from 'react';
import { 
  User, Shield, Bell, Globe, Moon, Sun, 
  Monitor, Layout, Database, Key, Clock, 
  Smartphone, Trash2, Save, RotateCcw, 
  Check, AlertCircle, Camera, Mail, Phone,
  Lock, Languages, Eye, EyeOff, LayoutDashboard,
  Table as TableIcon, Info, Terminal, Settings as SettingsIcon,
  ChevronRight, ArrowLeft, LogOut, ShieldCheck, Activity,
  Globe2, Upload, ToggleLeft, ToggleRight, Laptop, Smartphone as SmartphoneIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SettingsPage = ({ user, setView }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'system');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  
  // Profile State
  const [profileData, setProfileData] = useState({
    fullName: user?.email?.split('@')[0] || '',
    email: user?.email || '',
    phone: '+1 (555) 000-0000',
    avatar: null
  });

  // Account State
  const [accountSettings, setAccountSettings] = useState({
    notifications: true,
    language: 'English',
    timezone: 'UTC-05:00 (Eastern Time)',
    privateAccount: false
  });

  // Dashboard State
  const [dashPrefs, setDashPrefs] = useState({
    showWidgets: true,
    layout: 'grid',
    pageSize: 10
  });

  // Security State
  const [twoFactor, setTwoFactor] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);

  // System State (Admin)
  const [systemConfig, setSystemConfig] = useState({
    siteTitle: 'Quantum Portal v2.0',
    logo: null,
    maintenanceMode: false,
    defaultRole: 'Candidate (L1)'
  });

  // Theme applying logic
  useEffect(() => {
    const applyTheme = (t) => {
      const root = window.document.documentElement;
      if (t === 'system') {
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        root.setAttribute('data-theme', systemTheme);
      } else {
        root.setAttribute('data-theme', t);
      }
      localStorage.setItem('theme', t);
    };
    applyTheme(theme);
  }, [theme]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      showToast('Settings successfully synchronized');
    }, 1000);
  };

  const handleReset = () => {
    showToast('Settings reverted to defaults', 'info');
  };

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: <User size={20} /> },
    { id: 'account', label: 'Account Settings', icon: <Globe size={20} /> },
    { id: 'theme', label: 'Theme Settings', icon: <Sun size={20} /> },
    { id: 'dashboard', label: 'Dashboard Prefs', icon: <LayoutDashboard size={20} /> },
    { id: 'security', label: 'Security Settings', icon: <ShieldCheck size={20} /> },
    ...(user?.role?.toLowerCase() === 'admin' || user?.role === 'Admin' ? [
      { id: 'system', label: 'System Settings', icon: <Terminal size={20} /> }
    ] : [])
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-[var(--bg-deep)] rounded-[32px] border border-[var(--border)]">
               <div className="relative group">
                  <div className="w-32 h-32 rounded-[40px] bg-[var(--bg-card)] flex items-center justify-center text-[var(--text-primary)] text-4xl font-black overflow-hidden border border-[var(--border)] shadow-inner">
                     {profileData.avatar ? <img src={profileData.avatar} className="w-full h-full object-cover" alt="Avatar" /> : profileData.fullName.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-xl hover:scale-110 transition-transform ring-4 ring-[var(--bg-surface)]">
                     <Camera size={18} />
                  </button>
               </div>
               <div className="text-center sm:text-left">
                  <h3 className="text-xl font-black text-[var(--text-primary)] mb-1">Profile Identity</h3>
                  <p className="text-[var(--text-secondary)] font-medium text-sm">Update your public identity and avatar.</p>
                  <div className="mt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                      {user?.role || 'User'}
                    </span>
                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                      Active
                    </span>
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Full Name</label>
                  <div className="relative">
                     <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                     <input 
                       type="text" 
                       className="w-full pl-12 pr-4 py-4 bg-[var(--bg-deep)] border border-[var(--border)] rounded-2xl font-bold text-[var(--text-primary)] outline-none focus:border-primary transition-all"
                       value={profileData.fullName}
                       onChange={e => setProfileData({...profileData, fullName: e.target.value})}
                       placeholder="Enter full name"
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative">
                     <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                     <input 
                       type="email" 
                       className="w-full pl-12 pr-4 py-4 bg-[var(--bg-deep)] border border-[var(--border)] rounded-2xl font-bold text-[var(--text-primary)] outline-none focus:border-primary transition-all"
                       value={profileData.email}
                       onChange={e => setProfileData({...profileData, email: e.target.value})}
                       placeholder="Enter email address"
                     />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Phone Number</label>
                  <div className="relative">
                     <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                     <input 
                       type="text" 
                       className="w-full pl-12 pr-4 py-4 bg-[var(--bg-deep)] border border-[var(--border)] rounded-2xl font-bold text-[var(--text-primary)] outline-none focus:border-primary transition-all"
                       value={profileData.phone}
                       onChange={e => setProfileData({...profileData, phone: e.target.value})}
                       placeholder="+1 (555) 000-0000"
                     />
                  </div>
               </div>
            </div>

            <div className="pt-8 border-t border-[var(--border)]">
               <h4 className="text-sm font-black text-[var(--text-primary)] mb-6 uppercase tracking-widest">Authentication Security</h4>
               <div className="space-y-4">
                  <button 
                    onClick={() => setShowPasswordChange(!showPasswordChange)}
                    className="flex items-center justify-between w-full p-6 bg-[var(--bg-deep)] hover:bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl transition-all group"
                  >
                     <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--bg-surface)] rounded-xl text-[var(--text-muted)] group-hover:text-primary transition-colors"><Lock size={18} /></div>
                        <div className="text-left">
                           <p className="font-bold text-[var(--text-primary)] text-sm">Change Password</p>
                           <p className="text-xs text-[var(--text-muted)] font-medium">Update your account password regularly.</p>
                        </div>
                     </div>
                     <ChevronRight size={18} className={`text-[var(--text-muted)] transition-transform ${showPasswordChange ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                  </button>
                  
                  <AnimatePresence>
                    {showPasswordChange && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: 'auto', opacity: 1 }} 
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-[var(--bg-card)] rounded-2xl border border-[var(--border)] p-6 space-y-4"
                      >
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="password" placeholder="Current Password" className="w-full px-5 py-4 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl font-bold text-sm outline-none focus:border-primary" />
                            <input type="password" placeholder="New Password" className="w-full px-5 py-4 bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl font-bold text-sm outline-none focus:border-primary" />
                         </div>
                         <button className="w-full py-4 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:brightness-110 transition-all">Update Encryption Key</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
            </div>
          </motion.div>
        );
      case 'account':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
             <div className="space-y-6">
                <h3 className="text-xl font-black text-[var(--text-primary)]">Interface Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Language Selection</label>
                      <div className="relative">
                        <Languages className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <select 
                          className="w-full pl-12 pr-10 py-4 bg-[var(--bg-deep)] border border-[var(--border)] rounded-2xl font-bold text-[var(--text-primary)] outline-none focus:border-primary appearance-none"
                          value={accountSettings.language}
                          onChange={e => setAccountSettings({...accountSettings, language: e.target.value})}
                        >
                           <option>English (United States)</option>
                           <option>Spanish (ES)</option>
                           <option>French (FR)</option>
                           <option>German (DE)</option>
                           <option>Hindi (IN)</option>
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] rotate-90" size={18} />
                      </div>
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Temporal Zone</label>
                      <div className="relative">
                        <Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <select 
                          className="w-full pl-12 pr-10 py-4 bg-[var(--bg-deep)] border border-[var(--border)] rounded-2xl font-bold text-[var(--text-primary)] outline-none focus:border-primary appearance-none"
                          value={accountSettings.timezone}
                          onChange={e => setAccountSettings({...accountSettings, timezone: e.target.value})}
                        >
                           <option>UTC-05:00 (Eastern Time)</option>
                           <option>UTC+00:00 (London)</option>
                           <option>UTC+05:30 (Mumbai/Kolkata)</option>
                           <option>UTC+09:00 (Tokyo)</option>
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] rotate-90" size={18} />
                      </div>
                   </div>
                </div>
             </div>

             <div className="space-y-6">
                <h3 className="text-xl font-black text-[var(--text-primary)]">System Toggles</h3>
                <div className="space-y-4">
                   <div className="flex items-center justify-between p-6 bg-[var(--bg-deep)] border border-[var(--border)] rounded-[32px] hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--bg-surface)] text-primary rounded-2xl"><Bell size={20} /></div>
                        <div>
                           <p className="font-bold text-[var(--text-primary)]">Push Notifications</p>
                           <p className="text-xs text-[var(--text-muted)] font-medium">Receive real-time system alerts and updates.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setAccountSettings({...accountSettings, notifications: !accountSettings.notifications})}
                        className={`w-14 h-8 rounded-full p-1 transition-all ${accountSettings.notifications ? 'bg-emerald-500' : 'bg-[var(--bg-card)]'}`}
                      >
                         <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${accountSettings.notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                   </div>
                   <div className="flex items-center justify-between p-6 bg-[var(--bg-deep)] border border-[var(--border)] rounded-[32px] hover:border-primary/20 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-[var(--bg-surface)] text-purple-500 rounded-2xl"><Eye size={20} /></div>
                        <div>
                           <p className="font-bold text-[var(--text-primary)]">Account Privacy</p>
                           <p className="text-xs text-[var(--text-muted)] font-medium">Hide your profile activity from public discovery.</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setAccountSettings({...accountSettings, privateAccount: !accountSettings.privateAccount})}
                        className={`w-14 h-8 rounded-full p-1 transition-all ${accountSettings.privateAccount ? 'bg-emerald-500' : 'bg-[var(--bg-card)]'}`}
                      >
                         <div className={`w-6 h-6 bg-white rounded-full shadow-lg transition-transform ${accountSettings.privateAccount ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                   </div>
                </div>
             </div>
          </motion.div>
        );
      case 'theme':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { id: 'light', label: 'Luminal Mode', icon: <Sun size={24} />, desc: 'Optimized for day' },
                  { id: 'dark', label: 'Obsidian Mode', icon: <Moon size={24} />, desc: 'Premium deep dark' },
                  { id: 'system', label: 'Quantum Sync', icon: <Monitor size={24} />, desc: 'System matched' }
                ].map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => setTheme(t.id)}
                    className={`p-8 rounded-[40px] border-2 transition-all text-left group relative overflow-hidden ${theme === t.id ? 'border-primary bg-primary/5' : 'border-[var(--border)] bg-[var(--bg-deep)] hover:border-primary/30'}`}
                  >
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all ${theme === t.id ? 'bg-primary text-white rotate-12 scale-110 shadow-lg shadow-primary/30' : 'bg-[var(--bg-card)] text-[var(--text-muted)] group-hover:bg-primary/10 group-hover:text-primary'}`}>
                        {t.icon}
                     </div>
                     <p className={`font-black text-sm mb-1 ${theme === t.id ? 'text-primary' : 'text-[var(--text-primary)]'}`}>{t.label}</p>
                     <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{t.desc}</p>
                     {theme === t.id && (
                       <div className="absolute top-4 right-4 text-primary">
                         <Check size={16} strokeWidth={4} />
                       </div>
                     )}
                  </button>
                ))}
             </div>
             
             <div className="p-10 bg-slate-900 rounded-[40px] text-white relative overflow-hidden group">
                <div className="relative z-10">
                   <h4 className="text-xl font-black mb-2 flex items-center gap-2">
                     <div className="w-2 h-8 bg-primary rounded-full animate-pulse" />
                     Live Rendering Preview
                   </h4>
                   <p className="text-slate-400 font-medium mb-8 max-w-md">Selected theme is applied instantly to the current session using hardware acceleration.</p>
                   <div className="flex gap-4">
                      <div className="w-12 h-2 bg-primary rounded-full group-hover:w-24 transition-all duration-500" />
                      <div className="w-20 h-2 bg-white/10 rounded-full" />
                      <div className="w-8 h-2 bg-white/10 rounded-full" />
                   </div>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] group-hover:bg-primary/40 transition-all duration-1000" />
             </div>
          </motion.div>
        );
      case 'dashboard':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
             <div className="space-y-6">
                <h3 className="text-xl font-black text-[var(--text-primary)]">Interface Layout</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <button 
                     onClick={() => setDashPrefs({...dashPrefs, layout: 'grid'})}
                     className={`p-8 rounded-3xl border-2 flex items-center gap-6 transition-all ${dashPrefs.layout === 'grid' ? 'border-primary bg-primary/5 text-primary' : 'border-[var(--border)] bg-[var(--bg-deep)] text-[var(--text-muted)] hover:border-primary/20'}`}
                   >
                      <div className={`p-4 rounded-2xl ${dashPrefs.layout === 'grid' ? 'bg-primary text-white' : 'bg-[var(--bg-card)]'}`}>
                        <Layout size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-sm">Grid Architecture</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Multi-column layout</p>
                      </div>
                   </button>
                   <button 
                     onClick={() => setDashPrefs({...dashPrefs, layout: 'list'})}
                     className={`p-8 rounded-3xl border-2 flex items-center gap-6 transition-all ${dashPrefs.layout === 'list' ? 'border-primary bg-primary/5 text-primary' : 'border-[var(--border)] bg-[var(--bg-deep)] text-[var(--text-muted)] hover:border-primary/20'}`}
                   >
                      <div className={`p-4 rounded-2xl ${dashPrefs.layout === 'list' ? 'bg-primary text-white' : 'bg-[var(--bg-card)]'}`}>
                        <TableIcon size={24} />
                      </div>
                      <div className="text-left">
                        <p className="font-black text-sm">Linear Stream</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-60">Single-column list</p>
                      </div>
                   </button>
                </div>
             </div>

             <div className="space-y-6">
                <h3 className="text-xl font-black text-[var(--text-primary)]">Data Visualization</h3>
                <div className="flex items-center justify-between p-8 bg-[var(--bg-deep)] border border-[var(--border)] rounded-[40px] hover:border-primary/20 transition-all">
                   <div className="flex items-center gap-6">
                      <div className="p-4 bg-orange-500/10 text-orange-500 rounded-2xl border border-orange-500/20"><LayoutDashboard size={24} /></div>
                      <div>
                         <p className="font-black text-[var(--text-primary)]">Intelligent Widgets</p>
                         <p className="text-sm text-[var(--text-muted)] font-medium">Render advanced analytics modules on home screen.</p>
                      </div>
                   </div>
                   <button 
                     onClick={() => setDashPrefs({...dashPrefs, showWidgets: !dashPrefs.showWidgets})}
                     className={`w-16 h-10 rounded-full p-1.5 transition-all ${dashPrefs.showWidgets ? 'bg-primary' : 'bg-[var(--bg-card)]'}`}
                   >
                      <div className={`w-7 h-7 bg-white rounded-full shadow-xl transition-transform ${dashPrefs.showWidgets ? 'translate-x-6' : 'translate-x-0'}`} />
                   </button>
                </div>
                
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Table Pagination Density</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[10, 25, 50, 100].map(val => (
                      <button 
                        key={val}
                        onClick={() => setDashPrefs({...dashPrefs, pageSize: val})}
                        className={`py-4 rounded-2xl font-black text-sm transition-all border-2 ${dashPrefs.pageSize === val ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-[var(--bg-deep)] border-[var(--border)] text-[var(--text-muted)] hover:border-primary/20'}`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                </div>
             </div>
          </motion.div>
        );
      case 'security':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
             <div className={`p-8 rounded-[40px] border flex items-center gap-8 transition-all ${twoFactor ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
                <div className={`p-5 rounded-3xl shadow-xl ${twoFactor ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                  <ShieldCheck size={32} />
                </div>
                <div className="flex-1">
                   <h4 className={`font-black text-lg mb-1 ${twoFactor ? 'text-emerald-500' : 'text-rose-500'}`}>
                     Two-Factor Authentication {twoFactor ? 'Active' : 'Disabled'}
                   </h4>
                   <p className="text-sm text-[var(--text-muted)] font-medium mb-4">Add an extra layer of security to your professional identity.</p>
                   <button 
                     onClick={() => setTwoFactor(!twoFactor)}
                     className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${twoFactor ? 'bg-[var(--bg-deep)] text-[var(--text-primary)] hover:bg-rose-500 hover:text-white' : 'bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20'}`}
                   >
                     {twoFactor ? 'Deactivate Protocol' : 'Initialize 2FA'}
                   </button>
                </div>
             </div>

             <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-black text-[var(--text-primary)]">Login Activity History</h3>
                  <button className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline">View All Logs</button>
                </div>
                <div className="space-y-3">
                   {[
                     { action: 'Login Success', date: 'Today, 12:45 PM', location: 'Mumbai, India', icon: <Check className="text-emerald-500" /> },
                     { action: 'Password Change', date: 'Yesterday, 09:12 AM', location: 'London, UK', icon: <RotateCcw className="text-blue-500" /> },
                     { action: 'New Device Linked', date: 'May 05, 2026', location: 'California, US', icon: <Shield className="text-purple-500" /> }
                   ].map((log, i) => (
                     <div key={i} className="flex items-center justify-between p-6 bg-[var(--bg-deep)] border border-[var(--border)] rounded-3xl group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-[var(--bg-surface)] rounded-xl group-hover:scale-110 transition-transform">{log.icon}</div>
                           <div>
                              <p className="font-bold text-[var(--text-primary)] text-sm">{log.action}</p>
                              <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">{log.date} • {log.location}</p>
                           </div>
                        </div>
                        <Activity size={16} className="text-[var(--text-muted)] opacity-20" />
                     </div>
                   ))}
                </div>
             </div>

             <div className="space-y-6 pt-6">
                <h3 className="text-xl font-black text-[var(--text-primary)]">Authorized Hardware</h3>
                <div className="space-y-3">
                   {[
                     { name: 'MacBook Pro 16"', ip: '192.168.1.1', status: 'Primary Session', icon: <Laptop size={20} /> },
                     { name: 'iPhone 15 Pro Max', ip: '172.20.10.4', status: 'Mobile Access', icon: <SmartphoneIcon size={20} /> }
                   ].map((d, i) => (
                     <div key={i} className="flex items-center justify-between p-8 bg-[var(--bg-deep)] border border-[var(--border)] rounded-[40px] group hover:border-primary/20 transition-all">
                        <div className="flex items-center gap-6">
                           <div className="p-4 bg-[var(--bg-card)] rounded-2xl text-[var(--text-muted)] group-hover:text-primary group-hover:bg-primary/5 transition-all">{d.icon}</div>
                           <div>
                              <p className="font-black text-[var(--text-primary)] text-sm">{d.name}</p>
                              <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">{d.ip} • <span className="text-primary">{d.status}</span></p>
                           </div>
                        </div>
                        <button className="p-4 text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all">
                          <Trash2 size={20} />
                        </button>
                     </div>
                   ))}
                </div>
             </div>
          </motion.div>
        );
      case 'system':
        return (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Platform Brand Title</label>
                   <input 
                     type="text" 
                     className="w-full px-6 py-5 bg-[var(--bg-deep)] border border-[var(--border)] rounded-[24px] font-bold text-[var(--text-primary)] outline-none focus:border-primary transition-all" 
                     value={systemConfig.siteTitle}
                     onChange={e => setSystemConfig({...systemConfig, siteTitle: e.target.value})}
                   />
                </div>
                <div className="space-y-3">
                   <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Default Role Allocation</label>
                   <div className="relative">
                      <select 
                        className="w-full px-6 py-5 bg-[var(--bg-deep)] border border-[var(--border)] rounded-[24px] font-bold text-[var(--text-primary)] outline-none focus:border-primary appearance-none"
                        value={systemConfig.defaultRole}
                        onChange={e => setSystemConfig({...systemConfig, defaultRole: e.target.value})}
                      >
                         <option>Candidate (L1)</option>
                         <option>Instructor (L2)</option>
                         <option>Administrator (L3)</option>
                         <option>Content Strategist (L2)</option>
                      </select>
                      <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] rotate-90" size={18} />
                   </div>
                </div>
             </div>

             <div className="p-8 bg-[var(--bg-deep)] border border-[var(--border)] rounded-[48px] space-y-6">
                <div className="flex items-center justify-between">
                   <div>
                      <h4 className="font-black text-[var(--text-primary)]">Organization Assets</h4>
                      <p className="text-xs text-[var(--text-muted)] font-medium">Manage platform logos and branding elements.</p>
                   </div>
                   <button className="px-6 py-3 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:brightness-110 shadow-lg shadow-primary/20">
                     <Upload size={14} /> Upload Vector Logo
                   </button>
                </div>
                <div className="h-40 bg-[var(--bg-card)] rounded-[32px] border-2 border-dashed border-[var(--border)] flex items-center justify-center group hover:border-primary/40 transition-colors">
                   <div className="text-center">
                      <div className="w-12 h-12 bg-[var(--bg-surface)] rounded-2xl mx-auto mb-3 flex items-center justify-center text-[var(--text-muted)] group-hover:text-primary transition-colors">
                        <Monitor size={24} />
                      </div>
                      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Preview Branding Window</p>
                   </div>
                </div>
             </div>

             <div className={`p-10 rounded-[48px] border-2 transition-all flex flex-col md:flex-row items-center justify-between gap-8 ${systemConfig.maintenanceMode ? 'bg-amber-500/5 border-amber-500/20' : 'bg-slate-900 border-white/5 shadow-2xl'}`}>
                <div className="flex items-center gap-8">
                   <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl ${systemConfig.maintenanceMode ? 'bg-amber-500 text-white' : 'bg-white/10 text-primary'}`}>
                     <Database size={36} />
                   </div>
                   <div className="text-center md:text-left">
                      <h4 className={`text-xl font-black mb-1 ${systemConfig.maintenanceMode ? 'text-amber-500' : 'text-white'}`}>System Maintenance Protocol</h4>
                      <p className="text-slate-400 font-medium text-sm max-w-sm">Offline mode will prevent all non-administrative identities from accessing the portal clusters.</p>
                   </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-[10px] font-black uppercase tracking-widest ${systemConfig.maintenanceMode ? 'text-amber-500' : 'text-slate-500'}`}>
                    {systemConfig.maintenanceMode ? 'Active Shutdown' : 'Operational'}
                  </span>
                  <button 
                    onClick={() => setSystemConfig({...systemConfig, maintenanceMode: !systemConfig.maintenanceMode})}
                    className={`w-20 h-10 rounded-full p-1.5 transition-all ${systemConfig.maintenanceMode ? 'bg-amber-500' : 'bg-slate-800'}`}
                  >
                     <div className={`w-7 h-7 bg-white rounded-full shadow-2xl transition-transform ${systemConfig.maintenanceMode ? 'translate-x-10' : 'translate-x-0'}`} />
                  </button>
                </div>
             </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] text-[var(--text-primary)] pb-20 transition-colors duration-500">
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} 
            animate={{ y: 20, opacity: 1 }} 
            exit={{ y: -100, opacity: 0 }}
            className={`fixed top-0 left-1/2 -translate-x-1/2 z-[100] px-10 py-5 rounded-[24px] shadow-2xl flex items-center gap-4 font-black text-xs uppercase tracking-widest ${toast.type === 'success' ? 'bg-emerald-500 text-white' : (toast.type === 'info' ? 'bg-primary text-white' : 'bg-rose-500 text-white')}`}
          >
             <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
               {toast.type === 'success' ? <Check size={14} strokeWidth={4} /> : <Info size={14} strokeWidth={4} />}
             </div>
             {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Settings Sidebar */}
          <div className="lg:w-80 shrink-0">
             <button 
               onClick={() => setView('staff_dashboard')}
               className="flex items-center gap-3 text-[var(--text-muted)] hover:text-primary transition-all font-black text-[10px] uppercase tracking-widest mb-12 group bg-[var(--bg-surface)] w-fit px-5 py-3 rounded-2xl border border-[var(--border)] shadow-sm"
             >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Back to Terminal
             </button>

             <div className="mb-12">
               <div className="w-12 h-2 bg-primary rounded-full mb-4" />
               <h2 className="text-5xl font-black text-[var(--text-primary)] tracking-tighter mb-2 leading-none">Settings</h2>
               <p className="text-[var(--text-secondary)] font-medium text-lg">Platform Configuration</p>
             </div>

             <div className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 px-6 py-5 rounded-[24px] transition-all font-black text-sm group relative overflow-hidden ${activeTab === tab.id ? 'bg-primary text-white shadow-2xl shadow-primary/30' : 'text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border)]'}`}
                  >
                     <span className={`transition-all duration-500 ${activeTab === tab.id ? 'text-white rotate-6 scale-110' : 'group-hover:text-primary group-hover:rotate-12'}`}>
                        {tab.icon}
                     </span>
                     {tab.label}
                     {activeTab === tab.id && (
                       <motion.div layoutId="active-pill" className="absolute right-4 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_white]" />
                     )}
                  </button>
                ))}
             </div>

             <div className="mt-12 p-8 bg-[var(--bg-surface)] rounded-[40px] border border-[var(--border)] relative overflow-hidden group">
               <div className="relative z-10">
                 <h4 className="text-xs font-black uppercase tracking-widest text-[var(--text-primary)] mb-2">Cloud Storage</h4>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[10px] font-bold text-[var(--text-muted)]">84.2 GB used of 100 GB</span>
                   <span className="text-[10px] font-black text-primary">84%</span>
                 </div>
                 <div className="w-full h-1.5 bg-[var(--bg-deep)] rounded-full overflow-hidden">
                   <div className="h-full bg-primary rounded-full w-[84%] group-hover:bg-accent transition-colors duration-500" />
                 </div>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[50px]" />
             </div>
          </div>

          {/* Settings Content Area */}
          <div className="flex-1 min-w-0">
             <div className="bg-[var(--bg-surface)] rounded-[56px] p-8 md:p-16 shadow-2xl border border-[var(--border)] relative overflow-hidden transition-all duration-700 min-h-[800px]">
                <div className="relative z-10 h-full flex flex-col">
                   <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8 mb-16 pb-8 border-b border-[var(--border)]">
                      <div>
                         <div className="flex items-center gap-3 mb-2">
                            <div className="w-2 h-2 bg-primary rounded-full" />
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Configuration Module</span>
                         </div>
                         <h2 className="text-4xl font-black text-[var(--text-primary)] tracking-tight">{tabs.find(t => t.id === activeTab).label}</h2>
                         <p className="text-[var(--text-muted)] font-medium text-sm mt-1">Initialize and calibrate {activeTab} protocols for your session environment.</p>
                      </div>
                      <div className="flex gap-4">
                         <button 
                           onClick={handleReset}
                           className="px-8 py-5 bg-[var(--bg-deep)] text-[var(--text-muted)] rounded-[20px] font-black text-[10px] uppercase tracking-[0.1em] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-all flex items-center gap-2 border border-[var(--border)] shadow-sm"
                         >
                            <RotateCcw size={14} /> Reset Defaults
                         </button>
                         <button 
                           onClick={handleSave}
                           disabled={loading}
                           className="px-10 py-5 bg-[var(--text-primary)] text-[var(--bg-surface)] rounded-[20px] font-black text-[10px] uppercase tracking-[0.1em] hover:bg-primary hover:text-white transition-all flex items-center gap-3 disabled:opacity-50 shadow-xl shadow-[var(--text-primary)]/10"
                         >
                            {loading ? <div className="w-4 h-4 border-2 border-primary border-t-white rounded-full animate-spin" /> : <Save size={16} />}
                            Synchronize Changes
                         </button>
                      </div>
                   </div>

                   <div className="flex-1">
                     <AnimatePresence mode="wait">
                       {renderTabContent()}
                     </AnimatePresence>
                   </div>
                </div>

                {/* Background Aesthetics */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] pointer-events-none rounded-full" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/5 blur-[100px] pointer-events-none rounded-full" />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
