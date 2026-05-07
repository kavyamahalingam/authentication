import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, Award, 
  BookOpen, Filter, X, Check, Clock, 
  ChevronRight, Calendar, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExamManager = () => {
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    subject_id: '',
    topic_id: '',
    title: '',
    description: '',
    duration_minutes: 30,
    passing_score: 50,
    status: 'Active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eRes, sRes, tRes] = await Promise.all([
        fetch('/api/portal/exams'),
        fetch('/api/portal/subjects'),
        fetch('/api/portal/topics')
      ]);
      if (eRes.ok) setExams(await eRes.json());
      if (sRes.ok) setSubjects(await sRes.json());
      if (tRes.ok) setTopics(await tRes.json());
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingExam ? `/api/portal/exams/${editingExam.id}` : '/api/portal/exams';
    const method = editingExam ? 'PUT' : 'POST';

    try {
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_access_token='))?.split('=')[1];
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        fetchData();
        setShowModal(false);
        setFormData({ subject_id: '', topic_id: '', title: '', description: '', duration_minutes: 30, passing_score: 50, status: 'Active' });
      }
    } catch (err) {
      console.error('Save failed');
    }
  };

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.subject_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Assessment Packages</h2>
          <p className="text-slate-500 font-medium">Design and deploy specialized examination modules.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search assessments..." 
              className="w-full sm:w-80 pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingExam(null); setFormData({ subject_id: '', topic_id: '', title: '', description: '', duration_minutes: 30, passing_score: 50, status: 'Active' }); setShowModal(true); }}
            className="btn-pro btn-pro-primary h-[54px] px-8"
          >
            <Plus size={20} />
            <span>New Exam</span>
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="admin-table-container">
        <div className="card-header">
           <div className="flex items-center gap-3">
              <Award size={20} className="text-primary" />
              <h3 className="font-black text-slate-900">Active Certifications</h3>
           </div>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Exam Title & Context</th>
                <th>Thresholds</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th className="text-right">Manage</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}><td colSpan="5" className="px-6 py-10 animate-pulse text-center">Synchronizing Data...</td></tr>
                ))
              ) : filteredExams.length > 0 ? (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="group">
                    <td>
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          <Award size={22} />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{exam.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                             <BookOpen size={12} className="text-slate-400" />
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{exam.subject_name} • {exam.topic_name || 'Full Course'}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                           <Clock size={14} className="text-slate-300" />
                           <span className="text-xs font-black text-slate-700">{exam.duration_minutes}m</span>
                        </div>
                        <div className="flex items-center gap-2">
                           <Activity size={14} className="text-slate-300" />
                           <span className="text-xs font-black text-slate-700">{exam.passing_score}%</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${exam.status === 'Active' ? 'role-user' : 'bg-slate-100 text-slate-500'}`}>
                        {exam.status}
                      </span>
                    </td>
                    <td>
                       <p className="text-xs font-bold text-slate-400 uppercase">{new Date(exam.created_at).toLocaleDateString()}</p>
                    </td>
                    <td>
                      <div className="action-buttons justify-end">
                        <button 
                          onClick={() => { setEditingExam(exam); setFormData(exam); setShowModal(true); }}
                          className="action-btn"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button className="action-btn delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5" className="py-20 text-center font-bold text-slate-300">No assessments found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Professional Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Assessment Designer</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Configure parameters for automated certification.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors"><X size={20} /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="input-pro-label">Exam Nomenclature (Title)</label>
                    <input required type="text" className="input-pro" placeholder="e.g. Advanced Quantum Analysis" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="input-pro-label">Context (Subject)</label>
                      <select required className="input-pro" value={formData.subject_id} onChange={(e) => setFormData({...formData, subject_id: e.target.value})}>
                        <option value="">Select Subject...</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="input-pro-label">Module (Topic)</label>
                      <select className="input-pro" value={formData.topic_id} onChange={(e) => setFormData({...formData, topic_id: e.target.value})}>
                        <option value="">Full Course Assessment</option>
                        {topics.filter(t => t.subject_id.toString() === formData.subject_id.toString()).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="input-pro-label">Time Constraint (Mins)</label>
                      <div className="relative">
                         <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                         <input type="number" className="input-pro pl-12" value={formData.duration_minutes} onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})} />
                      </div>
                    </div>
                    <div>
                      <label className="input-pro-label">Passing Threshold (%)</label>
                      <div className="relative">
                         <Award className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                         <input type="number" className="input-pro pl-12" value={formData.passing_score} onChange={(e) => setFormData({...formData, passing_score: parseInt(e.target.value)})} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="input-pro-label">Extended Summary</label>
                    <textarea className="input-pro h-24 resize-none" placeholder="Detail the scope and purpose of this assessment..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                        {formData.status === 'Active' ? <Check size={20} /> : <X size={20} />}
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-900">Deployment Status</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{formData.status}</p>
                     </div>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, status: formData.status === 'Active' ? 'Inactive' : 'Active'})}
                    className={`w-14 h-8 rounded-full p-1.5 transition-all duration-500 ${formData.status === 'Active' ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-slate-200'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-500 ${formData.status === 'Active' ? 'translate-x-6' : ''}`} />
                  </button>
                </div>

                <div className="pt-4 flex gap-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 px-8 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-5 px-8 btn-pro btn-pro-primary rounded-2xl">
                    {editingExam ? 'Save Changes' : 'Save Exam'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExamManager;
