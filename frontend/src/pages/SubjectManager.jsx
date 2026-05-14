import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, BookOpen, 
  MoreVertical, Filter, ChevronRight, X, Check, AlertCircle, RefreshCw, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SubjectManager = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'Active',
    thumbnail_url: ''
  });
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [pendingSubjects, setPendingSubjects] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [bulkData, setBulkData] = useState({
    field: '',
    count: 5
  });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/portal/subjects');
      if (res.ok) {
        const data = await res.json();
        setSubjects(data);
      }
    } catch (err) {
      console.error('Failed to fetch subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async (e) => {
    if (e) e.preventDefault();
    setBulkLoading(true);
    try {
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_access_token='))?.split('=')[1];
      const res = await fetch('/api/portal/generate-questions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
          subject: bulkData.field,
          type: 'Topics Only', // Reusing topic logic for subjects too
          count: bulkData.count,
          auto_save: false
        })
      });

      if (res.ok) {
        const result = await res.json();
        if (result.topics) {
          // Map AI topics to subjects structure
          const mapped = result.topics.map((t, i) => ({
            name: t.name,
            code: `${bulkData.field.substring(0, 3).toUpperCase()}-${101 + i}`,
            description: t.description
          }));
          setPendingSubjects(mapped);
          setReviewMode(true);
        }
      }
    } catch (err) {
      alert('Generation failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSaveAllSubjects = async () => {
    setBulkLoading(true);
    try {
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_access_token='))?.split('=')[1];
      for (const sub of pendingSubjects) {
        await fetch('/api/portal/subjects', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
          },
          body: JSON.stringify({
            name: sub.name,
            code: sub.code,
            description: sub.description,
            status: 'Active',
            thumbnail_url: ''
          })
        });
      }
      fetchSubjects();
      setShowBulkModal(false);
      setReviewMode(false);
      setPendingSubjects([]);
      alert('All subjects saved successfully');
    } catch (err) {
      alert('Error saving subjects');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingSubject ? `/api/portal/subjects/${editingSubject.id}` : '/api/portal/subjects';
    const method = editingSubject ? 'PUT' : 'POST';

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
        fetchSubjects();
        setShowModal(false);
        setFormData({ name: '', code: '', description: '', status: 'Active', thumbnail_url: '' });
      }
    } catch (err) {
      console.error('Save failed');
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Subject Library</h2>
          <p className="text-slate-500 font-medium">Manage and organize your core academic categories.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Filter by name or code..." 
              className="w-full sm:w-80 pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setShowBulkModal(true)}
            className="btn-pro bg-indigo-50 text-indigo-600 h-[54px] px-6 border border-indigo-100 hover:bg-indigo-100"
          >
            <Zap size={20} />
            <span>AI Suggest Subjects</span>
          </button>
          <button 
            onClick={() => { setEditingSubject(null); setFormData({ name: '', code: '', description: '', status: 'Active', thumbnail_url: '' }); setShowModal(true); }}
            className="btn-pro btn-pro-primary h-[54px] px-8"
          >
            <Plus size={20} />
            <span>New Subject</span>
          </button>
        </div>
      </div>

      {/* Bulk AI Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBulkModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Subject Library</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Populate your academic categories instantly.</p>
                </div>
                <button onClick={() => setShowBulkModal(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400"><X size={20} /></button>
              </div>

              {reviewMode ? (
                <div className="flex flex-col h-full max-h-[70vh]">
                  <div className="p-10 space-y-6 overflow-y-auto flex-1 bg-slate-50/50">
                    {pendingSubjects.map((s, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                           <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs">{idx + 1}</div>
                              <h4 className="font-bold text-slate-800">{s.name}</h4>
                           </div>
                           <span className="text-[10px] font-mono font-black text-slate-400">{s.code}</span>
                        </div>
                        <p className="text-slate-500 text-sm font-medium pl-9">{s.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-10 border-t border-slate-100 bg-white flex gap-4">
                    <button onClick={() => { setReviewMode(false); setPendingSubjects([]); }} className="flex-1 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-50 border border-slate-200">Discard</button>
                    <button onClick={handleSaveAllSubjects} disabled={bulkLoading} className="flex-[1.5] py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">
                      {bulkLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Check size={20} />}
                      Save Subject Library
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBulkGenerate} className="p-10 space-y-8">
                  <div>
                    <label className="input-pro-label">Educational Field / Domain</label>
                    <input required type="text" className="input-pro" placeholder="e.g. Software Engineering" value={bulkData.field} onChange={(e) => setBulkData({...bulkData, field: e.target.value})} />
                  </div>
                  <div>
                    <label className="input-pro-label">Suggestions Count</label>
                    <input type="number" min="1" max="10" className="input-pro" value={bulkData.count} onChange={(e) => setBulkData({...bulkData, count: e.target.value})} />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowBulkModal(false)} className="flex-1 py-5 rounded-2xl font-black text-slate-500 hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={bulkLoading} className="flex-1 py-5 btn-pro btn-pro-primary rounded-2xl">
                      {bulkLoading ? 'Synthesizing...' : 'Generate Catalog'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Table Section */}
      <div className="admin-table-container">
        <div className="card-header">
           <div className="flex items-center gap-3">
              <BookOpen size={20} className="text-primary" />
              <h3 className="font-black text-slate-900">Academic Subjects</h3>
           </div>
           <div className="flex items-center gap-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredSubjects.length} Entries</span>
           </div>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Subject Details</th>
                <th>Access Code</th>
                <th>Status</th>
                <th>Created Date</th>
                <th className="text-right">Manage</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    <td colSpan="5" className="px-6 py-10">
                      <div className="flex items-center gap-4 animate-pulse">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                        <div className="space-y-2 flex-1">
                           <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                           <div className="h-3 bg-slate-50 rounded w-1/2"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : filteredSubjects.length > 0 ? (
                filteredSubjects.map((subject) => (
                  <tr key={subject.id} className="group">
                    <td>
                      <div className="user-cell">
                        <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          <BookOpen size={22} />
                        </div>
                        <div>
                          <p className="user-name">{subject.name}</p>
                          <p className="user-email truncate max-w-[200px]">{subject.description || 'No description provided.'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="px-3 py-1.5 bg-slate-50 text-slate-900 rounded-lg text-xs font-black font-mono border border-slate-100">
                        {subject.code}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${
                        subject.status === 'Active' ? 'role-user' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {subject.status}
                      </span>
                    </td>
                    <td className="text-slate-500 font-medium">
                      {new Date(subject.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      <div className="action-buttons justify-end">
                        <button 
                          onClick={() => { setEditingSubject(subject); setFormData(subject); setShowModal(true); }}
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
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex flex-col items-center">
                       <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                          <BookOpen size={32} className="text-slate-200" />
                       </div>
                       <h4 className="text-xl font-black text-slate-900 mb-1">Vault is empty</h4>
                       <p className="text-slate-500 font-medium">Add your first academic subject to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Professional Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight">
                    {editingSubject ? 'Configure Subject' : 'Initialize Subject'}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Define the core parameters for this curriculum block.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="input-pro-label">Identification Name</label>
                    <input 
                      required
                      type="text" 
                      className="input-pro"
                      placeholder="e.g. Computer Science"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="input-pro-label">Curriculum Code</label>
                    <input 
                      required
                      type="text" 
                      className="input-pro font-mono uppercase"
                      placeholder="CS-101"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                <div>
                  <label className="input-pro-label">Extended Description</label>
                  <textarea 
                    className="input-pro h-32 resize-none"
                    placeholder="Provide a comprehensive summary of the subject scope..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                        {formData.status === 'Active' ? <Check size={20} /> : <X size={20} />}
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-900">Module Availability</p>
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
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-5 px-8 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-colors"
                  >
                    Discard Changes
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-5 px-8 btn-pro btn-pro-primary rounded-2xl"
                  >
                    {editingSubject ? 'Save Changes' : 'Save Subject'}
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

export default SubjectManager;
