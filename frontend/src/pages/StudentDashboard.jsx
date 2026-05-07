import React, { useState, useEffect } from 'react';
import { 
  BookOpen, ListTree, HelpCircle, TrendingUp, 
  ArrowRight, Award, Activity, Star, Zap, Clock, Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="bg-bg-card p-8 rounded-[32px] border border-border flex items-start justify-between group hover:border-primary transition-all duration-500 shadow-sm hover:shadow-xl"
  >
    <div>
      <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] mb-3">{title}</p>
      <h3 className="text-3xl font-black text-white mb-2">{value}</h3>
      {subtitle && (
        <div className="flex items-center gap-1 text-text-muted text-xs font-bold">
          <span>{subtitle}</span>
        </div>
      )}
    </div>
    <div className={`p-4 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
      <Icon className={color.replace('bg-', 'text-')} size={24} />
    </div>
  </motion.div>
);

const StudentDashboard = ({ user, setView, setExamFilter }) => {
  const [stats, setStats] = useState({ subjects: 0, topics: 0, questions: 0, exams: 0 });
  const [subjects, setSubjects] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, resultsRes, subjectsRes] = await Promise.all([
        fetch('/api/portal/stats?active_only=true'),
        fetch('/api/portal/exams/results'),
        fetch('/api/portal/subjects?active_only=true')
      ]);
      
      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      
      if (resultsRes.ok) {
        const data = await resultsRes.json();
        setResults(data.slice(0, 3));
      }

      if (subjectsRes.ok) {
        const data = await subjectsRes.json();
        setSubjects(data.slice(0, 4));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectClick = (subjectName) => {
    setExamFilter(subjectName);
    setView('exam_center');
  };

  const handleStatClick = () => {
    setExamFilter('all');
    setView('exam_center');
  };

  const avgScore = results.length > 0 
    ? Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / results.length) 
    : 0;

  return (
    <div className="space-y-10 animate-fade font-body pb-32">
      {/* Premium Welcome Banner */}
      <div className="relative bg-bg-surface rounded-[48px] p-12 text-white overflow-hidden border border-border shadow-2xl">
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
          <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-primary rounded-full blur-[120px]" />
          <div className="absolute bottom-[-20%] left-[20%] w-[400px] h-[400px] bg-accent rounded-full blur-[120px]" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/20">
              <Zap size={12} /> Live Curriculum
            </div>
            <h1 className="text-5xl font-black mb-6 tracking-tight leading-tight">
              Welcome back, <span className="text-gradient">{user?.email?.split('@')[0]}</span>
            </h1>
            <p className="text-text-secondary font-medium leading-relaxed max-w-lg">
              Explore the latest assessment modules updated by our academic team. Your path to professional certification starts here.
            </p>
          </div>
          <div className="flex shrink-0">
            <button 
              onClick={() => { setExamFilter('all'); setView('exam_center'); }}
              className="btn-premium px-10 py-5 text-lg shadow-2xl shadow-primary/40 flex items-center gap-3 active:scale-95"
            >
              Explore Exams <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <div onClick={handleStatClick} className="cursor-pointer">
          <StatCard title="Available Subjects" value={stats.subjects} icon={BookOpen} color="bg-blue-500" subtitle="Broad Knowledge" />
        </div>
        <div onClick={handleStatClick} className="cursor-pointer">
          <StatCard title="Specialized Topics" value={stats.topics} icon={ListTree} color="bg-indigo-500" subtitle="Deep Learning" />
        </div>
        <div onClick={handleStatClick} className="cursor-pointer">
          <StatCard title="Live Assessments" value={stats.exams} icon={Award} color="bg-rose-500" subtitle="Test Ready" />
        </div>
        <div className="cursor-default opacity-80">
          <StatCard title="Global Questions" value={stats.questions} icon={HelpCircle} color="bg-purple-500" subtitle="Practice Pool" />
        </div>
      </div>

      {/* Latest Subjects Section */}
      <div className="bg-bg-card p-10 rounded-[40px] border border-border shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[100px] pointer-events-none" />
        <div className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight">Explore Curriculum</h3>
            <p className="text-text-muted text-sm font-bold mt-1">Recently updated subjects and modules</p>
          </div>
          <button 
            onClick={() => { setExamFilter('all'); setView('exam_center'); }}
            className="text-primary text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
          >
            View All Subjects <ArrowRight size={16} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {subjects.length > 0 ? subjects.map((sub) => (
            <div key={sub.id} className="group cursor-pointer" onClick={() => handleSubjectClick(sub.name)}>
              <div className="p-8 bg-bg-surface border border-white/5 rounded-[32px] group-hover:border-primary/50 transition-all duration-500 h-full flex flex-col justify-between hover:shadow-2xl hover:shadow-primary/10">
                <div>
                   <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                      <BookOpen size={24} />
                   </div>
                   <h4 className="text-lg font-black text-white mb-2 leading-tight group-hover:text-primary transition-colors">{sub.name}</h4>
                   <p className="text-text-muted text-xs font-medium line-clamp-2 leading-relaxed">
                      Comprehensive modules covering core concepts and advanced applications.
                   </p>
                </div>
                <div className="mt-8 flex items-center justify-between">
                   <span className="px-3 py-1 bg-white/5 text-text-muted rounded-full text-[10px] font-black uppercase tracking-widest group-hover:bg-primary group-hover:text-white transition-all">
                      {sub.topic_count || 0} Topics
                   </span>
                   <div className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight size={18} />
                   </div>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-10 text-center text-text-muted font-bold bg-white/5 rounded-3xl border border-dashed border-white/10">
               Fetching available subjects...
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Quick Progress */}
        <div className="lg:col-span-1">
          <div className="bg-bg-card p-10 rounded-[40px] border border-border shadow-sm h-full relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl" />
             <h3 className="text-xl font-black text-white mb-10 flex items-center justify-between">
                Quick Analytics
                <div className="p-2 bg-white/5 rounded-xl"><Activity size={16} className="text-primary" /></div>
             </h3>
             
             <div className="space-y-8">
                <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl">
                         <Star size={20} />
                      </div>
                      <span className="font-bold text-text-secondary">Avg. Score</span>
                   </div>
                   <span className="text-2xl font-black text-emerald-500">{avgScore}%</span>
                </div>

                <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                         <Shield size={20} />
                      </div>
                      <span className="font-bold text-text-secondary">Rank</span>
                   </div>
                   <span className="text-2xl font-black text-blue-500">Pro</span>
                </div>

                <button 
                  onClick={() => setView('profile')}
                  className="w-full py-5 bg-white/5 text-text-secondary rounded-2xl font-black hover:bg-primary hover:text-white transition-all border border-white/10 flex items-center justify-center gap-2 group"
                >
                   View Full History <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
             </div>
          </div>
        </div>

        {/* Recent Performance */}
        <div className="lg:col-span-2">
          <div className="bg-bg-card p-10 rounded-[40px] border border-border shadow-sm h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 blur-3xl" />
            <h3 className="text-xl font-black text-white mb-10 flex items-center justify-between">
               Recent Performance
               <Clock size={20} className="text-text-muted" />
            </h3>
            
            <div className="space-y-6">
              {results.length > 0 ? results.map((res) => (
                <div key={res.id} className="flex gap-6 items-center p-6 border border-white/5 rounded-3xl hover:border-primary/20 hover:bg-white/5 transition-all">
                  <div className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${res.score >= res.passing_score ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    <Award size={24} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                       <p className="text-white font-black text-lg tracking-tight">{res.exam_title}</p>
                       <span className="text-lg font-black text-white">{res.score}%</span>
                    </div>
                    <p className="text-text-muted text-sm font-bold uppercase tracking-widest">{res.subject_name} • {new Date(res.completed_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-20 bg-white/5 rounded-3xl border border-dashed border-white/10">
                   <HelpCircle size={48} className="mx-auto text-white/10 mb-4" />
                   <p className="text-text-muted font-bold">No recent attempts recorded.</p>
                   <p className="text-white/20 text-sm mt-1">Your journey starts with your first exam.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
