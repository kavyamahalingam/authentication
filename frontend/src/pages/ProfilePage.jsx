import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Calendar, Shield, Settings, 
  ChevronRight, LogOut, Camera, Bell, 
  ShieldCheck, Award, HelpCircle, Activity, 
  Trophy, Download, X, Printer, CheckCircle2,
  FileText, Star, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CertificateModal = ({ result, onClose }) => {
  if (!result) return null;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-12">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 50 }}
        className="relative w-full max-w-4xl bg-white rounded-[40px] shadow-2xl overflow-hidden border-[12px] border-slate-50"
      >
        <div className="p-12 text-center relative overflow-hidden">
          {/* Certificate Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full flex flex-wrap gap-20 p-20">
                {[...Array(20)].map((_, i) => <Award key={i} size={80} />)}
             </div>
          </div>

          <div className="relative z-10">
             <div className="flex justify-center mb-10">
                <div className="p-6 bg-primary/10 text-primary rounded-full relative">
                   <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
                   <Award size={64} className="relative z-10" />
                </div>
             </div>
             
             <h4 className="text-[12px] font-black text-primary uppercase tracking-[0.4em] mb-4">Official Certification</h4>
             <h1 className="text-5xl font-black text-slate-900 mb-8 tracking-tight">Professional Achievement</h1>
             
             <p className="text-slate-500 font-medium text-lg max-w-lg mx-auto leading-relaxed mb-12">
               This document formally recognizes that the candidate has successfully demonstrated proficiency and passed the assessment module for:
             </p>

             <div className="bg-slate-50 p-8 rounded-[32px] mb-12 border border-slate-100 inline-block px-16">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">{result.exam_title}</h2>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">{result.subject_name} Division</p>
             </div>

             <div className="grid grid-cols-2 gap-12 max-w-md mx-auto mb-16 pt-12 border-t border-slate-100">
                <div className="text-left">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Issue Date</p>
                   <p className="font-bold text-slate-900">{new Date(result.completed_at).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                </div>
                <div className="text-left">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance Index</p>
                   <p className="font-bold text-emerald-600">{result.score}% Accuracy Rating</p>
                </div>
             </div>

             <div className="flex justify-center gap-10 opacity-50">
                <div className="w-32 border-b-2 border-slate-900 h-10 flex items-end justify-center text-[8px] font-black uppercase tracking-widest text-slate-900 pb-2">Academic Director</div>
                <div className="w-32 border-b-2 border-slate-900 h-10 flex items-end justify-center text-[8px] font-black uppercase tracking-widest text-slate-900 pb-2">System Registrar</div>
             </div>
          </div>
        </div>

        <div className="bg-slate-900 p-8 flex items-center justify-between">
           <button 
             onClick={() => window.print()}
             className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-widest hover:text-primary transition-colors"
           >
              <Printer size={18} /> Print Record
           </button>
           <button 
             onClick={onClose}
             className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all"
           >
              Dismiss
           </button>
        </div>
      </motion.div>
    </div>
  );
};

const ProfilePage = ({ user, onLogout, onAdminClick }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await fetch('/api/portal/exams/results');
      if (res.ok) setResults(await res.json());
    } catch (err) {
      console.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const avgScore = results.length > 0 
    ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / results.length) 
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      <AnimatePresence>
        {selectedCert && <CertificateModal result={selectedCert} onClose={() => setSelectedCert(null)} />}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="h-64 bg-[#0f172a] relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
           <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]" />
           <div className="absolute bottom-[-20%] right-[-10%] w-[400px] h-[400px] bg-purple-600 rounded-full blur-[100px]" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-32 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Personal Info */}
          <div className="lg:col-span-1 space-y-8">
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              className="bg-white rounded-[40px] p-10 shadow-xl shadow-slate-200/50 border border-slate-100"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-8">
                   <div className="w-32 h-32 rounded-[38px] bg-slate-900 flex items-center justify-center text-white text-4xl font-black relative overflow-hidden group">
                      {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.email?.charAt(0).toUpperCase()}
                      <div className="absolute inset-0 bg-primary/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                         <Camera size={24} />
                      </div>
                   </div>
                   <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-2xl border-4 border-white flex items-center justify-center text-white shadow-lg">
                      <ShieldCheck size={18} />
                   </div>
                </div>
                
                <h2 className="text-2xl font-black text-slate-900 mb-1">{user?.email?.split('@')[0]}</h2>
                <div className="px-3 py-1 bg-slate-50 rounded-lg text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">
                   {user?.role} Verified Account
                </div>
                
                <div className="w-full space-y-4 pt-8 border-t border-slate-50 text-left">
                   <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                         <Mail size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Email Identity</p>
                         <p className="text-sm font-bold text-slate-700 truncate">{user?.email}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all">
                         <Calendar size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                         <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Registry Date</p>
                         <p className="text-sm font-bold text-slate-700">June 2024</p>
                      </div>
                   </div>
                </div>

                <button 
                  onClick={onLogout}
                  className="w-full mt-10 py-5 px-8 bg-slate-50 text-slate-500 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-rose-50 hover:text-rose-500 transition-all flex items-center justify-center gap-3"
                >
                  <LogOut size={18} /> Terminate
                </button>
              </div>
            </motion.div>

            {user?.role?.toLowerCase() === 'admin' && (
              <button 
                onClick={onAdminClick}
                className="w-full p-8 bg-slate-900 text-white rounded-[40px] shadow-2xl hover:bg-primary transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                     <Shield size={22} />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-black tracking-tight">Governing Panel</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Access</p>
                  </div>
                </div>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

          {/* Right Column: Metrics & History */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-center">
                  <div className="text-3xl font-black text-slate-900 mb-1">{results.length}</div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Modules Completed</p>
               </div>
               <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-center">
                  <div className="text-3xl font-black text-primary mb-1">{avgScore}%</div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance Index</p>
               </div>
               <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm text-center">
                  <div className="text-3xl font-black text-emerald-500 mb-1">
                     {results.filter(r => r.score >= r.passing_score).length}
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Certifications</p>
               </div>
            </div>

            {/* Assessment History */}
            <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm min-h-[500px]">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                     <Activity size={20} className="text-primary" />
                     Professional Records
                  </h3>
                  <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary">History Analytics</button>
               </div>

               {loading ? (
                 <div className="py-20 flex justify-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary"></div></div>
               ) : results.length > 0 ? (
                 <div className="space-y-6">
                    {results.map((res) => (
                       <div key={res.id} className="p-6 bg-slate-50/50 border border-slate-100 rounded-[28px] hover:bg-white hover:shadow-xl hover:border-primary/20 transition-all group">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                             <div className="flex items-start gap-4">
                                <div className={`p-4 rounded-2xl ${res.score >= res.passing_score ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                   <Award size={24} />
                                </div>
                                <div>
                                   <h4 className="font-black text-slate-900 group-hover:text-primary transition-colors">{res.exam_title}</h4>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                      {res.subject_name} • {new Date(res.completed_at).toLocaleDateString()}
                                   </p>
                                </div>
                             </div>
                             
                             <div className="flex items-center gap-6">
                                <div className="text-right">
                                   <div className={`text-xl font-black ${res.score >= res.passing_score ? 'text-emerald-500' : 'text-rose-500'}`}>{res.score}%</div>
                                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{res.score >= res.passing_score ? 'PASSED' : 'RETRY'}</p>
                                </div>
                                {res.score >= res.passing_score && (
                                   <button 
                                     onClick={() => setSelectedCert(res)}
                                     className="px-5 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-200"
                                   >
                                      View Certificate
                                   </button>
                                )}
                             </div>
                          </div>
                       </div>
                    ))}
                 </div>
               ) : (
                 <div className="py-32 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                       <FileText size={32} className="text-slate-200" />
                    </div>
                    <h4 className="text-lg font-black text-slate-900">No Professional Records Found</h4>
                    <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">Begin your assessment journey by selecting a module from the Exam Center.</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
