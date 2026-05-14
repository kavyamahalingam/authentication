import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, ListTree, 
  BookOpen, Filter, X, Check, ChevronRight, RefreshCw, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TopicManager = () => {
  const [topics, setTopics] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [pendingTopics, setPendingTopics] = useState([]);
  const [reviewMode, setReviewMode] = useState(false);
  const [bulkData, setBulkData] = useState({
    subject_id: '',
    count: 5
  });
  const [formData, setFormData] = useState({
    subject_id: '',
    name: '',
    description: '',
    sequence: 0,
    status: 'Active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [topicsRes, subjectsRes] = await Promise.all([
        fetch('/api/portal/topics'),
        fetch('/api/portal/subjects')
      ]);
      if (topicsRes.ok) setTopics(await topicsRes.json());
      if (subjectsRes.ok) setSubjects(await subjectsRes.json());
    } catch (err) {
      console.error('Failed to fetch topics/subjects');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkGenerate = async (e) => {
    if (e) e.preventDefault();
    setBulkLoading(true);
    try {
      const subject = subjects.find(s => s.id === Number(bulkData.subject_id))?.name || "";
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_access_token='))?.split('=')[1];
      
      const res = await fetch('/api/portal/generate-questions', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({
          subject_id: bulkData.subject_id,
          type: 'Topics Only', 
          count: bulkData.count,
          subject,
          auto_save: false
        })
      });

      if (res.ok) {
        const result = await res.json();
        if (result.topics) {
          setPendingTopics(result.topics);
          setReviewMode(true);
        }
      }
    } catch (err) {
      alert('Generation failed');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSaveAllTopics = async () => {
    setBulkLoading(true);
    try {
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_access_token='))?.split('=')[1];
      for (const topic of pendingTopics) {
        await fetch('/api/portal/topics', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
          },
          body: JSON.stringify({
            subject_id: bulkData.subject_id,
            name: topic.name,
            description: topic.description,
            sequence: 0,
            status: 'Active'
          })
        });
      }
      fetchData();
      setShowBulkModal(false);
      setReviewMode(false);
      setPendingTopics([]);
      alert('All topics saved successfully');
    } catch (err) {
      alert('Error saving some topics');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingTopic ? `/api/portal/topics/${editingTopic.id}` : '/api/portal/topics';
    const method = editingTopic ? 'PUT' : 'POST';

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
        setFormData({ subject_id: '', name: '', description: '', sequence: 0, status: 'Active' });
      }
    } catch (err) {
      console.error('Save failed');
    }
  };

  const filteredTopics = topics.filter(t => 
    (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     t.subject_name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (subjectFilter === 'all' || t.subject_id.toString() === subjectFilter)
  );

  return (
    <div className="space-y-8 animate-fade">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Curriculum Topics</h2>
          <p className="text-slate-500 font-medium">Structure and sequence your academic modules.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search topics..." 
                className="w-full sm:w-64 pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all font-bold text-slate-800"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select 
                className="w-full sm:w-48 pl-12 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 appearance-none font-bold text-slate-800"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
              >
                <option value="all">All Subjects</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <button 
            onClick={() => setShowBulkModal(true)}
            className="btn-pro bg-indigo-50 text-indigo-600 h-[54px] px-6 border border-indigo-100 hover:bg-indigo-100"
          >
            <Zap size={20} />
            <span>AI Suggest Topics</span>
          </button>
          <button 
            onClick={() => { setEditingTopic(null); setFormData({ subject_id: '', name: '', description: '', sequence: 0, status: 'Active' }); setShowModal(true); }}
            className="btn-pro btn-pro-primary h-[54px] px-8"
          >
            <Plus size={20} />
            <span>New Topic</span>
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
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI Topic Suggestion</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Automatically structure your curriculum modules.</p>
                </div>
                <button onClick={() => setShowBulkModal(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400"><X size={20} /></button>
              </div>

              {reviewMode ? (
                <div className="flex flex-col h-full max-h-[70vh]">
                  <div className="p-10 space-y-6 overflow-y-auto flex-1 bg-slate-50/50">
                    {pendingTopics.map((t, idx) => (
                      <div key={idx} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                        <div className="flex items-start gap-4 mb-2">
                           <div className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0">{idx + 1}</div>
                           <h4 className="font-bold text-slate-800">{t.name}</h4>
                        </div>
                        <p className="text-slate-500 text-sm font-medium pl-10">{t.description}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-10 border-t border-slate-100 bg-white flex gap-4">
                    <button onClick={() => { setReviewMode(false); setPendingTopics([]); }} className="flex-1 py-4 rounded-2xl font-black text-slate-500 hover:bg-slate-50 border border-slate-200">Discard</button>
                    <button onClick={handleSaveAllTopics} disabled={bulkLoading} className="flex-[1.5] py-4 bg-emerald-500 text-white rounded-2xl font-black shadow-lg shadow-emerald-200 flex items-center justify-center gap-2">
                      {bulkLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" /> : <Check size={20} />}
                      Save All Topics
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleBulkGenerate} className="p-10 space-y-8">
                  <div>
                    <label className="input-pro-label">Parent Subject</label>
                    <select required className="input-pro" value={bulkData.subject_id} onChange={(e) => setBulkData({...bulkData, subject_id: e.target.value})}>
                      <option value="">Select a subject...</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="input-pro-label">Suggestions Count</label>
                    <input type="number" min="1" max="10" className="input-pro" value={bulkData.count} onChange={(e) => setBulkData({...bulkData, count: e.target.value})} />
                  </div>
                  <div className="flex gap-4 pt-4">
                    <button type="button" onClick={() => setShowBulkModal(false)} className="flex-1 py-5 rounded-2xl font-black text-slate-500 hover:bg-slate-50">Cancel</button>
                    <button type="submit" disabled={bulkLoading} className="flex-1 py-5 btn-pro btn-pro-primary rounded-2xl">
                      {bulkLoading ? 'Thinking...' : 'Generate Suggestions'}
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
              <ListTree size={20} className="text-primary" />
              <h3 className="font-black text-slate-900">Module Structure</h3>
           </div>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Topic Specification</th>
                <th>Parent Subject</th>
                <th>Sequence</th>
                <th>Status</th>
                <th className="text-right">Manage</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3].map(i => (
                  <tr key={i}>
                    <td colSpan="5" className="px-6 py-10 animate-pulse">
                      <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                    </td>
                  </tr>
                ))
              ) : filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
                  <tr key={topic.id} className="group">
                    <td>
                      <div className="user-cell">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          <ListTree size={20} />
                        </div>
                        <div>
                          <p className="user-name">{topic.name}</p>
                          <p className="user-email truncate max-w-[200px]">{topic.description || 'No description'}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <BookOpen size={14} className="text-primary" />
                        <span className="font-bold text-slate-700">{topic.subject_name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-black text-xs text-slate-500 border border-slate-100">
                         {topic.sequence}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${topic.status === 'Active' ? 'role-user' : 'bg-slate-100 text-slate-500'}`}>
                        {topic.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons justify-end">
                        <button 
                          onClick={() => { setEditingTopic(topic); setFormData(topic); setShowModal(true); }}
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
                  <td colSpan="5" className="py-20 text-center text-slate-400 font-bold">
                    No topics found for the current selection.
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
                    {editingTopic ? 'Configure Module' : 'Initialize Module'}
                  </h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Structure the specific components of your curriculum.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-8">
                <div className="space-y-6">
                  <div>
                    <label className="input-pro-label">Parent Subject Context</label>
                    <select 
                      required
                      className="input-pro appearance-none"
                      value={formData.subject_id}
                      onChange={(e) => setFormData({...formData, subject_id: e.target.value})}
                    >
                      <option value="">Select a subject...</option>
                      {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2">
                      <label className="input-pro-label">Topic Nomenclature</label>
                      <input 
                        required
                        type="text" 
                        className="input-pro"
                        placeholder="e.g. Quantum Mechanics"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="input-pro-label">Order</label>
                      <input 
                        type="number" 
                        className="input-pro"
                        value={formData.sequence}
                        onChange={(e) => setFormData({...formData, sequence: parseInt(e.target.value)})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="input-pro-label">Curriculum Depth (Description)</label>
                    <textarea 
                      className="input-pro h-24 resize-none"
                      placeholder="Detail the specific focus areas of this topic..."
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px] border border-slate-100">
                  <div className="flex items-center gap-4">
                     <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${formData.status === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                        {formData.status === 'Active' ? <Check size={20} /> : <X size={20} />}
                     </div>
                     <div>
                        <p className="text-sm font-black text-slate-900">Module Status</p>
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
                    Discard
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 py-5 px-8 btn-pro btn-pro-primary rounded-2xl"
                  >
                    {editingTopic ? 'Save Changes' : 'Save Topic'}
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

export default TopicManager;
