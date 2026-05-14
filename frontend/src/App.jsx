import React, { useState, useEffect } from 'react';
import ProfilePage from './pages/ProfilePage';
import AdminPanel from './pages/AdminPanel';
import PortalLayout from './components/PortalLayout';
import Dashboard from './pages/Dashboard';
import SubjectManager from './pages/SubjectManager';
import TopicManager from './pages/TopicManager';
import QuestionManager from './pages/QuestionManager';
import ExamManager from './pages/ExamManager';
import UserManager from './pages/UserManager';
import ActivityLog from './pages/ActivityLog';
import ExamCenter from './pages/ExamCenter';
import StudentDashboard from './pages/StudentDashboard';
import ExamSession from './pages/ExamSession';
import ExamPerformance from './pages/ExamPerformance';
import LandingPage from './pages/LandingPage';
import SettingsPage from './pages/SettingsPage';
import { motion, AnimatePresence } from 'framer-motion';
import { LogIn, LogOut, UserPlus, Fingerprint, Mail, Lock, User, Home, Settings, Shield, BookOpen, ChevronRight, ArrowRight, HelpCircle, Bell } from 'lucide-react';
import { tracker } from './services/activityTracker';
import NotificationPanel from './components/NotificationPanel';

const API_BASE = '/api/auth';

const App = () => {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('landing');
  const [loading, setLoading] = useState(true);
  const [userExamId, setUserExamId] = useState(null);
  const [examId, setExamId] = useState(null);
  const [examFilter, setExamFilter] = useState('all');
  const [activityMode, setActivityMode] = useState('all');
  const [isNotificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [portal, setPortal] = useState('user'); 
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkAuth();
    // Apply theme on load
    const savedTheme = localStorage.getItem('theme') || 'system';
    const root = window.document.documentElement;
    if (savedTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.setAttribute('data-theme', systemTheme);
    } else {
      root.setAttribute('data-theme', savedTheme);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('/api/auth/notifications');
      if (response.ok) {
        const data = await response.json();
        setUnreadNotifications(data.unread_count);
      }
    } catch (err) {
      console.error('Failed to fetch unread count');
    }
  };

  useEffect(() => {
    tracker.pageView(view);
    if (view === 'register' && portal === 'admin' && email && email.includes('@')) {
      handleSendOtp();
    }
  }, [view, portal]);

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE}/me`);
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        const staffRoles = ['Admin', 'Teacher', 'Content Creator', 'staff'];
        if (staffRoles.includes(data.role)) {
          setView('staff_dashboard');
        } else if (data.role === 'admin') {
          setView('admin');
        } else {
          setView('student_dashboard');
        }
      }
    } catch (err) {
      console.log('Not logged in');
      if (view !== 'register') setView('landing');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    const endpoint = view === 'login' ? '/login' : (portal === 'admin' ? '/admin/register' : '/register');
    const payload = view === 'login' 
      ? { email, password } 
      : (portal === 'admin' 
          ? { email, password, otp_code: otp } 
          : { email, password, otp_code: otp });

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.ok) {
        if (view === 'login') {
          setUser(data.user);
          const staffRoles = ['Admin', 'Teacher', 'Content Creator', 'staff'];
          if (staffRoles.includes(data.user.role)) {
            setView('staff_dashboard');
          } else if (data.user.role === 'admin') {
            setView('admin');
          } else {
            setView('student_dashboard');
          }
        } else {
          setMessage('Registration successful! Please login.');
          setView('login');
        }
      } else {
        setError(data.msg || 'Action failed');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please enter your email first');
      return;
    }
    setError('');
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'verification' })
      });
      const data = await res.json();
      if (res.ok) {
        setMessage('OTP sent to your email!');
      } else {
        setError(data.msg || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Failed to send OTP');
    }
  };

  const handleLogout = async () => {
    await fetch(`${API_BASE}/logout`, { method: 'POST' });
    setUser(null);
    setView('landing');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  const renderStaffPortal = () => {
    const staffViews = ['staff_dashboard', 'subjects', 'topics', 'questions', 'exams', 'exam_performance', 'users', 'activities', 'settings', 'profile'];
    if (staffViews.includes(view)) {
      return (
        <PortalLayout 
          user={user} 
          activeView={view} 
          setView={setView} 
          onLogout={handleLogout} 
          setActivityMode={setActivityMode}
          unreadCount={unreadNotifications}
          onNotificationsRead={() => setUnreadNotifications(0)}
        >
          {view === 'staff_dashboard' && <Dashboard user={user} setView={setView} />}
          {view === 'subjects' && <SubjectManager />}
          {view === 'topics' && <TopicManager />}
          {view === 'questions' && <QuestionManager />}
          {view === 'exams' && <ExamManager />}
          {view === 'exam_performance' && <ExamPerformance />}
          {view === 'users' && <UserManager currentUser={user} />}
          {view === 'activities' && <ActivityLog mode={activityMode} />}
          {view === 'settings' && <SettingsPage user={user} setView={setView} />}
          {view === 'profile' && <ProfilePage user={user} onLogout={handleLogout} onAdminClick={() => setView('admin')} />}
        </PortalLayout>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-bg-deep selection:bg-primary/20">
      <AnimatePresence mode="wait">
        {user ? (
          view === 'admin' ? (
            <motion.div key="admin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <AdminPanel user={user} onLogout={handleLogout} />
            </motion.div>
          ) : ['staff_dashboard', 'subjects', 'topics', 'questions', 'exams', 'exam_performance', 'users', 'activities', 'settings'].includes(view) ? (
            <motion.div key="portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-screen">
              {renderStaffPortal()}
            </motion.div>
          ) : ['student_dashboard', 'exam_center', 'profile', 'settings'].includes(view) && !['Admin', 'Teacher', 'Content Creator', 'staff'].includes(user.role) ? (
            <motion.div key="student_portal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="max-w-6xl mx-auto px-6 py-10">
                <header className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/20 text-primary rounded-xl flex items-center justify-center">
                      <Shield size={22} />
                    </div>
                    <h2 className="text-xl font-black text-white tracking-tight">Quantum Academy</h2>
                  </div>
                  <div className="flex items-center gap-4 relative">
                    <button onClick={() => { setNotificationsOpen(!isNotificationsOpen); setUnreadNotifications(0); }} className={`p-3 text-text-muted hover:text-primary rounded-2xl border border-border transition-all relative ${isNotificationsOpen ? 'bg-primary/10 text-primary' : 'bg-bg-card'}`}>
                      <Bell size={20} />
                      {unreadNotifications > 0 && (
                        <span className="absolute top-2 right-2 min-w-[18px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-black rounded-full border-2 border-bg-deep flex items-center justify-center animate-bounce">
                          {unreadNotifications}
                        </span>
                      )}
                    </button>
                    
                    <NotificationPanel 
                      user={user} 
                      isOpen={isNotificationsOpen} 
                      onClose={() => setNotificationsOpen(false)} 
                    />

                    <button onClick={() => setView('profile')} className={`w-10 h-10 bg-bg-card rounded-xl border border-border flex items-center justify-center text-primary font-black hover:border-primary transition-all ${view === 'profile' ? 'border-primary shadow-lg shadow-primary/20' : ''}`}>
                      <User size={20} />
                    </button>
                  </div>
                </header>

                {view === 'student_dashboard' ? (
                  <StudentDashboard user={user} setView={setView} setExamFilter={setExamFilter} />
                ) : view === 'exam_center' ? (
                  <ExamCenter 
                    user={user} 
                    setView={setView} 
                    setUserExamId={setUserExamId} 
                    setExamId={setExamId}
                    initialFilter={examFilter} 
                  />
                ) : view === 'settings' ? (
                  <SettingsPage user={user} setView={setView} />
                ) : view === 'activities' ? (
                   <ActivityLog mode="updates" />
                ) : (
                  <ProfilePage user={user} onLogout={handleLogout} onAdminClick={() => setView('admin')} />
                )}
              </div>
            </motion.div>
          ) : view === 'exam_session' ? (
            <motion.div key="exam_session" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ExamSession 
                userExamId={userExamId} 
                examId={examId}
                setView={setView} 
                setUserExamId={setUserExamId}
              />
            </motion.div>
          ) : (
            <motion.div key="profile" initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -300, opacity: 0 }}>
              <ProfilePage user={user} onLogout={handleLogout} onAdminClick={() => setView('admin')} />
            </motion.div>
          )
        ) : view === 'landing' ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LandingPage setView={setView} />
          </motion.div>
        ) : (
          /* Professional Auth View */
          <div className="flex min-h-screen bg-bg-deep font-body">
            {/* Left Side - Visual */}
            <div className="hidden lg:flex flex-1 bg-bg-surface items-center justify-center p-20 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
                 <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]" />
                 <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-accent rounded-full blur-[120px]" />
               </div>
               <div className="relative z-10 text-center max-w-lg">
                 <div className="inline-flex p-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl mb-8 shadow-2xl">
                    <Fingerprint size={64} className="text-white" />
                 </div>
                 <h1 className="text-5xl font-black text-white mb-6 tracking-tight leading-tight font-display">
                   Unlock Your <span className="text-gradient">Professional</span> Potential.
                 </h1>
                 <p className="text-text-secondary text-lg font-medium leading-relaxed">
                   The ultimate platform for candidate assessment and staff management. Seamless, secure, and sophisticated.
                 </p>
               </div>
            </div>

            {/* Right Side - Form */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="w-full lg:w-[600px] bg-bg-surface flex flex-col justify-center p-8 md:p-20 relative border-l border-border"
            >
              <div className="mb-12">
                <button onClick={() => setView('landing')} className="flex items-center gap-2 text-text-muted hover:text-white transition-colors mb-8 font-bold text-sm">
                  <ArrowRight size={16} className="rotate-180" /> Back to Home
                </button>
                <div className="portal-toggle mb-10 w-fit p-1 bg-bg-card rounded-2xl border border-border">
                  <button className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${portal === 'user' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-white'}`} onClick={() => setPortal('user')}>User Access</button>
                  <button className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${portal === 'admin' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-muted hover:text-white'}`} onClick={() => setPortal('admin')}>Staff Access</button>
                </div>

                <h2 className="text-font-lg font-display text-white mb-2 leading-tight">
                  {view === 'login' ? 'Sign In' : 'Join Us'}
                </h2>
                <p className="text-text-secondary font-medium">Please enter your credentials to continue.</p>
              </div>

              <form onSubmit={handleAuth} className="space-y-6">
                {error && <div className="p-4 bg-rose-500/10 text-rose-500 rounded-2xl text-sm font-bold animate-shake border border-rose-500/20">{error}</div>}
                {message && <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl text-sm font-bold border border-emerald-500/20">{message}</div>}

                <div className="input-pro-group">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input type="email" className="w-full pl-12 pr-4 py-4 bg-bg-card border border-border rounded-2xl outline-none focus:border-primary transition-all text-white font-medium" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>

                <div className="input-pro-group">
                  <label className="text-xs font-black text-text-muted uppercase tracking-widest mb-3 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input type="password" className="w-full pl-12 pr-4 py-4 bg-bg-card border border-border rounded-2xl outline-none focus:border-primary transition-all text-white font-medium" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>

                {view === 'register' && (
                  <div className="input-pro-group">
                    <div className="flex justify-between items-center mb-3 px-1">
                      <label className="text-xs font-black text-text-muted uppercase tracking-widest block">Verification Code</label>
                      <button type="button" onClick={handleSendOtp} className="text-xs font-black text-primary hover:underline uppercase tracking-widest">Get Code</button>
                    </div>
                    <input type="text" className="w-full py-5 bg-bg-card border border-border rounded-2xl text-center text-3xl font-black tracking-[0.4em] text-white outline-none focus:border-primary transition-all" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} required />
                  </div>
                )}



                <button type="submit" className="btn-premium w-full py-5 text-lg group">
                  {view === 'login' ? 'Continue' : 'Create Account'}
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>

              <div className="mt-10 text-center">
                <p className="text-text-secondary font-medium">
                  {view === 'login' ? "New to the platform?" : "Already have an account?"}
                  <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className="ml-2 text-primary font-black hover:underline">
                    {view === 'login' ? 'Create one now' : 'Sign in here'}
                  </button>
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modern Bottom Navigation */}
      {user && view !== 'exam_session' && (
        <div className="bottom-nav animate-fade">
          {['Admin', 'Teacher', 'Content Creator', 'staff'].includes(user.role) ? (
            <>
              <button onClick={() => setView('staff_dashboard')} className={`nav-item ${view === 'staff_dashboard' ? 'active' : ''}`}>
                <Home size={22} />
                <span>Home</span>
              </button>
              <button onClick={() => setView('subjects')} className={`nav-item ${['subjects', 'topics'].includes(view) ? 'active' : ''}`}>
                <BookOpen size={22} />
                <span>Curriculum</span>
              </button>
              <button onClick={() => setView('questions')} className={`nav-item ${view === 'questions' ? 'active' : ''}`}>
                <HelpCircle size={22} />
                <span>Questions</span>
              </button>
              <button onClick={() => setView('settings')} className={`nav-item ${view === 'settings' ? 'active' : ''}`}>
                <Settings size={22} />
                <span>Settings</span>
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setView('student_dashboard')} className={`nav-item ${view === 'student_dashboard' ? 'active' : ''}`}>
                <Home size={22} />
                <span>Dashboard</span>
              </button>
              <button onClick={() => setView('exam_center')} className={`nav-item ${view === 'exam_center' ? 'active' : ''}`}>
                <BookOpen size={22} />
                <span>Exams</span>
              </button>
              <button onClick={() => setView('profile')} className={`nav-item ${view === 'profile' ? 'active' : ''}`}>
                <User size={22} />
                <span>Profile</span>
              </button>
              <button onClick={() => setView('settings')} className={`nav-item ${view === 'settings' ? 'active' : ''}`}>
                <Settings size={22} />
                <span>Settings</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
