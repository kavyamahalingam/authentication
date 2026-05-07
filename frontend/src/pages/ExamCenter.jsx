import React, { useState, useEffect } from 'react';
import { Book, ChevronRight, Clock, Award, Play, Filter, Search, ListTree, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ExamCenter = ({ user, setView, setUserExamId, setExamId, initialFilter = 'all' }) => {
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(initialFilter);
  const [topicFilter, setTopicFilter] = useState('all');
  const [sampleQuestion, setSampleQuestion] = useState(null);
  const [startingExam, setStartingExam] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (topicFilter !== 'all') {
      fetchSample();
    } else {
      setSampleQuestion(null);
    }
  }, [topicFilter]);

  const fetchSample = async () => {
    try {
      const res = await fetch(`/api/portal/topics/${topicFilter}/sample`);
      if (res.ok) setSampleQuestion(await res.json());
    } catch (err) {
      setSampleQuestion(null);
    }
  };

  const fetchData = async () => {
    try {
      const [subRes, examRes, topicRes] = await Promise.all([
        fetch('/api/portal/subjects?active_only=true'),
        fetch('/api/portal/exams'),
        fetch('/api/portal/topics?active_only=true')
      ]);
      if (subRes.ok) setSubjects(await subRes.json());
      if (examRes.ok) setExams(await examRes.json());
      if (topicRes.ok) setTopics(await topicRes.json());
    } catch (err) {
      console.error('Failed to fetch exam data');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (examId) => {
    if (!examId) return;
    setExamId(examId);
    setView('exam_session');
  };

  const filteredExams = exams.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'all' || e.subject_name === filter) &&
    (topicFilter === 'all' || e.topic_id === topicFilter)
  );

  const selectedSubjectId = subjects.find(s => s.name === filter)?.id;
  const filteredTopics = topics.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'all' || Number(t.subject_id) === Number(selectedSubjectId))
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b border-slate-100 pt-16 pb-12 px-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Assessment Center</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Select a specialized examination module or explore topics to advance your career.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-8">
        {/* Search & Filter Bar */}
        <div className="bg-white p-3 rounded-[28px] shadow-xl shadow-slate-200/50 border border-slate-100 mb-10 flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text"
              placeholder="Search assessment modules..."
              className="w-full pl-14 pr-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all font-bold text-slate-800"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative md:w-48">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <select 
              className="w-full pl-14 pr-10 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:bg-white appearance-none cursor-pointer font-bold text-slate-800"
              value={filter}
              onChange={(e) => {
                setFilter(e.target.value);
                setTopicFilter('all'); // Reset topic filter when subject changes
              }}
            >
              <option value="all">All Fields</option>
              {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Topics Section */}
            {filteredTopics.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <ListTree className="text-primary" size={24} /> 
                    Exploration Topics
                  </h3>
                  {topicFilter !== 'all' && (
                    <button 
                      onClick={() => setTopicFilter('all')}
                      className="text-xs font-black text-primary uppercase tracking-widest hover:underline"
                    >
                      Clear Topic Filter
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTopics.map((topic) => {
                    const matchingExam = exams.find(e => Number(e.topic_id) === Number(topic.id));
                    return (
                      <div 
                        key={topic.id} 
                        className={`bg-white p-6 rounded-[24px] border shadow-sm transition-all group ${topicFilter === topic.id ? 'border-primary border-2 shadow-primary/10' : 'border-slate-100 hover:border-indigo-500 hover:shadow-lg'}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className={`p-2 rounded-xl transition-colors ${topicFilter === topic.id ? 'bg-primary text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                            <ListTree size={18} />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{subjects.find(s => s.id === topic.subject_id)?.name || 'General'}</span>
                        </div>
                        <h4 className={`text-lg font-bold mb-4 transition-colors ${topicFilter === topic.id ? 'text-primary' : 'text-slate-800 group-hover:text-indigo-600'}`}>{topic.name}</h4>
                        
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => setTopicFilter(topic.id)}
                            className="flex-1 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary transition-colors border border-slate-100 rounded-xl hover:bg-slate-50"
                          >
                            Explore
                          </button>
                          {matchingExam && (
                            <button 
                              onClick={() => handleStartExam(matchingExam.id)}
                              className="flex-[2] py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary transition-all flex items-center justify-center gap-2"
                            >
                              Start Test <Play size={10} fill="currentColor" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Sample Question Preview */}
                <AnimatePresence>
                  {sampleQuestion && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 p-6 opacity-10">
                        <HelpCircle size={80} />
                      </div>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-2 py-1 bg-primary text-white text-[10px] font-black uppercase tracking-widest rounded-md">Sample Preview</span>
                          <span className="text-slate-400 text-xs font-bold">{sampleQuestion.topic_name}</span>
                        </div>
                        <h4 className="text-xl font-bold mb-6 leading-relaxed">
                          {sampleQuestion.question_text}
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {sampleQuestion.options?.map((opt, i) => (
                            <div key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-medium">
                              {opt.option_text}
                            </div>
                          ))}
                        </div>
                        <div className="mt-8 pt-8 border-t border-white/10 flex items-center justify-between">
                           <p className="text-slate-400 text-xs font-medium italic">* This is a preview of the question structure.</p>
                           {exams.find(e => Number(e.topic_id) === Number(topicFilter)) && (
                             <button 
                               onClick={() => {
                                 const exam = exams.find(e => Number(e.topic_id) === Number(topicFilter));
                                 if (exam) {
                                   handleStartExam(exam.id);
                                 }
                               }}
                               className="px-6 py-3 bg-primary text-white text-xs font-black uppercase tracking-widest rounded-xl hover:scale-105 transition-transform"
                             >
                               Start Full Test Now
                             </button>
                           )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Exams Section */}
            <div>
              <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <Book className="text-primary" size={24} /> 
                Available Assessments
              </h3>
              <div className="space-y-6">
                <AnimatePresence>
                  {filteredExams.map((exam) => (
                    <motion.div 
                      key={exam.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl hover:border-primary transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                      
                      <div className="flex items-start justify-between mb-6 relative z-10">
                        <div className="p-4 bg-slate-50 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                          <Book size={28} />
                        </div>
                        <div className="flex items-center gap-2">
                           <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-black uppercase tracking-widest">
                             Active
                           </span>
                           <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest">
                             {exam.subject_name}
                           </span>
                        </div>
                      </div>
                      
                      <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-primary transition-colors">{exam.title}</h3>
                      <p className="text-slate-500 font-medium mb-8 leading-relaxed line-clamp-2">{exam.description}</p>
                      
                      <div className="flex items-center gap-8 mb-8 pt-6 border-t border-slate-50">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-primary" />
                          <span className="text-xs font-bold text-slate-700">{exam.duration_minutes} Minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award size={16} className="text-primary" />
                          <span className="text-xs font-bold text-slate-700">{exam.passing_score}% Pass Score</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => handleStartExam(exam.id)}
                        className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black flex items-center justify-center gap-3 hover:bg-primary hover:shadow-2xl hover:shadow-primary/30 transition-all active:scale-[0.98]"
                      >
                        Start Professional Assessment <ChevronRight size={20} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {filteredExams.length === 0 && filteredTopics.length === 0 && (
                  <div className="py-32 text-center bg-white rounded-[32px] border border-slate-100">
                    <div className="text-6xl mb-6 grayscale">📝</div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">No content found</h3>
                    <p className="text-slate-500 font-medium">Try adjusting your filters to see more topics or exams.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamCenter;
