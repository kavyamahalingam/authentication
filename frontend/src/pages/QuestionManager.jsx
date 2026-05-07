import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Edit2, Trash2, HelpCircle, 
  BookOpen, Filter, X, Check, ChevronRight, ChevronDown,
  List, MessageSquare, Tag, Award, ListTree
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const QuestionManager = () => {
  const [questions, setQuestions] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Accordion state
  const [expandedSubject, setExpandedSubject] = useState(null);
  const [expandedTopic, setExpandedTopic] = useState(null);

  const [formData, setFormData] = useState({
    subject_id: '',
    topic_id: '',
    type: 'MCQ',
    question_text: '',
    difficulty: 'Medium',
    correct_answer: '',
    explanation: '',
    tags: '',
    options: [
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false },
      { text: '', is_correct: false }
    ]
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [qRes, sRes, tRes] = await Promise.all([
        fetch('/api/portal/questions'),
        fetch('/api/portal/subjects'),
        fetch('/api/portal/topics')
      ]);
      if (qRes.ok) setQuestions(await qRes.json());
      if (sRes.ok) setSubjects(await sRes.json());
      if (tRes.ok) setTopics(await tRes.json());
    } catch (err) {
      console.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index].text = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleCorrectOption = (index) => {
    const newOptions = formData.options.map((opt, i) => ({
      ...opt,
      is_correct: i === index
    }));
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingQuestion ? `/api/portal/questions/${editingQuestion.id}` : '/api/portal/questions';
    const method = editingQuestion ? 'PUT' : 'POST';

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
        resetForm();
      }
    } catch (err) {
      console.error('Save failed');
    }
  };

  const resetForm = () => {
    setFormData({
      subject_id: '',
      topic_id: '',
      type: 'MCQ',
      question_text: '',
      difficulty: 'Medium',
      correct_answer: '',
      explanation: '',
      tags: '',
      options: [{ text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }, { text: '', is_correct: false }]
    });
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    topics.some(t => t.subject_id === s.id && t.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    questions.some(q => q.subject_id === s.id && q.question_text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade pb-20">
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Question Bank Explorer</h2>
          <p className="text-slate-500 font-medium">Browse subjects, drill down into topics, and manage questions.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search subject, topic or query..." 
              className="w-full sm:w-80 pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-800"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => { setEditingQuestion(null); resetForm(); setShowModal(true); }}
            className="btn-pro btn-pro-primary h-[54px] px-8"
          >
            <Plus size={20} />
            <span>Create Question</span>
          </button>
        </div>
      </div>

      {/* Explorer Section */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSubjects.length > 0 ? (
            filteredSubjects.map(subject => {
              const isSubjectExpanded = expandedSubject === subject.id;
              const subjectTopics = topics.filter(t => t.subject_id === subject.id);
              const subjectQuestions = questions.filter(q => q.subject_id === subject.id);

              return (
                <div key={subject.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden transition-all">
                  {/* Subject Header */}
                  <div 
                    onClick={() => setExpandedSubject(isSubjectExpanded ? null : subject.id)}
                    className="p-6 cursor-pointer hover:bg-slate-50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isSubjectExpanded ? 'bg-primary text-white' : 'bg-primary/5 text-primary'}`}>
                        <BookOpen size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900">{subject.name}</h3>
                        <p className="text-sm font-medium text-slate-500">
                          {subjectTopics.length} Topics • {subjectQuestions.length} Questions
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-slate-400 font-mono text-sm bg-slate-100 px-3 py-1 rounded-lg">
                        {subject.code}
                      </div>
                      <ChevronDown 
                        size={24} 
                        className={`text-slate-400 transition-transform duration-300 ${isSubjectExpanded ? 'rotate-180' : ''}`} 
                      />
                    </div>
                  </div>

                  {/* Topics Section */}
                  <AnimatePresence>
                    {isSubjectExpanded && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100 bg-slate-50/50"
                      >
                        <div className="p-6 pl-12 space-y-4">
                          {subjectTopics.length > 0 ? (
                            subjectTopics.map(topic => {
                              const isTopicExpanded = expandedTopic === topic.id;
                              const topicQuestions = subjectQuestions.filter(q => q.topic_id === topic.id);

                              return (
                                <div key={topic.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                  {/* Topic Header */}
                                  <div 
                                    onClick={() => setExpandedTopic(isTopicExpanded ? null : topic.id)}
                                    className="p-4 cursor-pointer hover:bg-slate-50 flex items-center justify-between transition-colors"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isTopicExpanded ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-500'}`}>
                                        <ListTree size={20} />
                                      </div>
                                      <div>
                                        <h4 className="text-lg font-bold text-slate-800">{topic.name}</h4>
                                        <p className="text-xs font-medium text-slate-500">{topicQuestions.length} Questions</p>
                                      </div>
                                    </div>
                                    <ChevronDown 
                                      size={20} 
                                      className={`text-slate-400 transition-transform duration-300 ${isTopicExpanded ? 'rotate-180' : ''}`} 
                                    />
                                  </div>

                                  {/* Questions Section */}
                                  <AnimatePresence>
                                    {isTopicExpanded && (
                                      <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="border-t border-slate-100 bg-slate-50 p-4 pl-8"
                                      >
                                        {topicQuestions.length > 0 ? (
                                          <div className="space-y-3">
                                            {topicQuestions.map(q => (
                                              <div key={q.id} className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col group hover:border-primary/30 hover:shadow-md transition-all">
                                                <div className="flex items-start justify-between w-full">
                                                  <div className="flex items-start gap-4 flex-1">
                                                    <div className="mt-1 w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                                                      <MessageSquare size={16} />
                                                    </div>
                                                    <div className="flex-1">
                                                      <p className="font-bold text-slate-800 text-sm leading-relaxed">{q.question_text}</p>
                                                      
                                                      {q.type === 'MCQ' && q.options && q.options.length > 0 && (
                                                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                          {q.options.map((opt, idx) => (
                                                            <div key={opt.id || idx} className={`px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 border ${opt.is_correct ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                                                              <span className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${opt.is_correct ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-300'}`}>
                                                                {opt.is_correct ? <Check size={12} /> : String.fromCharCode(65 + idx)}
                                                              </span>
                                                              {opt.option_text || opt.text}
                                                            </div>
                                                          ))}
                                                        </div>
                                                      )}
                                                      
                                                      <div className="flex items-center gap-3 mt-4">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                                                          q.difficulty === 'Easy' ? 'bg-emerald-50 text-emerald-600' : 
                                                          q.difficulty === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                                                        }`}>
                                                          {q.difficulty}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                                                          {q.type === 'MCQ' ? <List size={10} /> : (q.type === 'True/False' ? <Check size={10} /> : <Edit2 size={10} />)}
                                                          {q.type}
                                                        </span>
                                                      </div>
                                                    </div>
                                                  </div>
                                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                                                    <button 
                                                      onClick={(e) => { e.stopPropagation(); setEditingQuestion(q); setFormData(q); setShowModal(true); }}
                                                      className="p-2 bg-slate-50 hover:bg-primary hover:text-white rounded-lg text-slate-400 transition-colors"
                                                    >
                                                      <Edit2 size={14} />
                                                    </button>
                                                    <button 
                                                      onClick={(e) => e.stopPropagation()}
                                                      className="p-2 bg-slate-50 hover:bg-rose-500 hover:text-white rounded-lg text-slate-400 transition-colors"
                                                    >
                                                      <Trash2 size={14} />
                                                    </button>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-center py-6 text-sm font-medium text-slate-400">No questions found in this topic.</p>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-center py-8 text-sm font-medium text-slate-400">No topics found for this subject.</p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div className="py-32 text-center bg-white rounded-3xl border border-slate-100">
              <div className="text-6xl mb-6 grayscale opacity-50">📂</div>
              <h3 className="text-2xl font-black text-slate-900 mb-2">No subjects found</h3>
              <p className="text-slate-500 font-medium">Try adjusting your search criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Professional Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden"
            >
              <div className="p-10 border-b border-slate-50 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Question Architecture</h3>
                  <p className="text-slate-500 font-medium text-sm mt-1">Configure assessment items with precision.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl text-slate-400"><X size={20} /></button>
              </div>

              <div className="max-h-[70vh] overflow-y-auto p-10 space-y-8">
                <form id="q-form" onSubmit={handleSubmit} className="space-y-8">
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
                      <select required className="input-pro" value={formData.topic_id} onChange={(e) => setFormData({...formData, topic_id: e.target.value})}>
                        <option value="">Select Topic...</option>
                        {topics.filter(t => t.subject_id.toString() === formData.subject_id.toString()).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="input-pro-label">Assessment Type</label>
                      <select className="input-pro" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                        <option value="MCQ">Multiple Choice (MCQ)</option>
                        <option value="True/False">True / False</option>
                        <option value="Fill in the Blank">Fill in the Blank</option>
                        <option value="Short Answer">Short Answer</option>
                      </select>
                    </div>
                    <div>
                      <label className="input-pro-label">Difficulty Rating</label>
                      <select className="input-pro" value={formData.difficulty} onChange={(e) => setFormData({...formData, difficulty: e.target.value})}>
                        <option value="Easy">Entry Level (Easy)</option>
                        <option value="Medium">Professional (Medium)</option>
                        <option value="Hard">Expert (Hard)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="input-pro-label">Inquiry Text (The Question)</label>
                    <textarea required className="input-pro h-24 resize-none" placeholder="Enter the query statement..." value={formData.question_text} onChange={(e) => setFormData({...formData, question_text: e.target.value})} />
                  </div>

                  {/* Dynamic Type Specific Fields */}
                  {formData.type === 'MCQ' && (
                    <div className="space-y-4 bg-slate-50 p-6 rounded-[24px]">
                      <label className="input-pro-label mb-4">Response Options (Click to select correct)</label>
                      {formData.options.map((opt, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                          <button type="button" onClick={() => handleCorrectOption(idx)} className={`w-10 h-10 rounded-xl flex items-center justify-center border-2 transition-all ${opt.is_correct ? 'bg-primary border-primary text-white' : 'bg-white border-slate-200 text-slate-300'}`}>
                             {opt.is_correct ? <Check size={18} /> : <span>{String.fromCharCode(65 + idx)}</span>}
                          </button>
                          <input type="text" required className="input-pro py-2.5" placeholder={`Option ${String.fromCharCode(65 + idx)}`} value={opt.text} onChange={(e) => handleOptionChange(idx, e.target.value)} />
                        </div>
                      ))}
                    </div>
                  )}

                  {formData.type === 'True/False' && (
                    <div className="flex gap-4 p-6 bg-slate-50 rounded-[24px]">
                      {['True', 'False'].map(val => (
                        <button key={val} type="button" onClick={() => setFormData({...formData, correct_answer: val})} className={`flex-1 py-4 rounded-2xl font-black transition-all ${formData.correct_answer === val ? 'bg-primary text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-200'}`}>
                          {val}
                        </button>
                      ))}
                    </div>
                  )}

                  {(formData.type === 'Fill in the Blank' || formData.type === 'Short Answer') && (
                    <div className="bg-slate-50 p-6 rounded-[24px]">
                      <label className="input-pro-label">Validated Answer String</label>
                      <input type="text" required className="input-pro" placeholder="Enter expected response..." value={formData.correct_answer} onChange={(e) => setFormData({...formData, correct_answer: e.target.value})} />
                    </div>
                  )}

                  <div>
                    <label className="input-pro-label">Analytical Explanation (Feedback)</label>
                    <textarea className="input-pro h-24 resize-none" placeholder="Provide rationale for the correct response..." value={formData.explanation} onChange={(e) => setFormData({...formData, explanation: e.target.value})} />
                  </div>

                  <div>
                    <label className="input-pro-label">Tags (CSV)</label>
                    <div className="relative">
                       <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                       <input type="text" className="input-pro pl-12" placeholder="e.g. physics, quantum, optics" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} />
                    </div>
                  </div>
                </form>
              </div>

              <div className="p-10 border-t border-slate-50 flex gap-4">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 px-8 rounded-2xl font-black text-slate-500 hover:bg-slate-50 transition-colors">Cancel</button>
                <button type="submit" form="q-form" className="flex-1 py-5 px-8 btn-pro btn-pro-primary rounded-2xl">
                  {editingQuestion ? 'Save Changes' : 'Save Question'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuestionManager;
