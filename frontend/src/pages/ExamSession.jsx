import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, ChevronLeft, ChevronRight, Send, AlertCircle, CheckCircle, Award, Trophy } from 'lucide-react';

const ExamSession = ({ userExamId, examId, setView, setUserExamId }) => {
  const [session, setSession] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const hasLoaded = useRef(false);

  useEffect(() => {
    if (!hasLoaded.current) {
      loadSession();
      hasLoaded.current = true;
    }
    return () => clearInterval(timerRef.current);
  }, []);

  const loadSession = async () => {
    setLoading(true);
    try {
      if (userExamId) {
        // Fetch existing session
        const res = await fetch(`/api/portal/exams/session/${userExamId}`);
        if (res.ok) {
          const data = await res.json();
          initializeSession(data);
        } else {
          setError('Failed to load session');
        }
      } else if (examId) {
        // Start new session
        const csrfToken = document.cookie.split('; ').find(row => row.trim().startsWith('csrf_access_token='))?.split('=')[1];
        const res = await fetch(`/api/portal/exams/${examId}/start`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.id) {
            setUserExamId(data.id);
            initializeSession(data);
          } else {
            setError('No session data received');
          }
        } else {
          const errData = await res.json();
          setError(errData.msg || 'Failed to start session');
        }
      }
    } catch (err) {
      console.error('Session error:', err);
      setError('Connection error');
    } finally {
      setLoading(false);
    }
  };

  const initializeSession = (data) => {
    setSession(data);
    setTimeLeft(data.duration_minutes * 60);
    startTimer();
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResponseChange = (questionId, value) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (isAuto = false) => {
    if (!isAuto && !window.confirm('You are about to finalize your assessment. Continue?')) return;
    
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      const csrfToken = document.cookie.split('; ').find(row => row.startsWith('csrf_access_token='))?.split('=')[1];
      const res = await fetch(`/api/portal/exams/session/${userExamId}/submit`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-TOKEN': csrfToken
        },
        body: JSON.stringify({ responses })
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      }
    } catch (err) {
      alert('Failed to submit assessment');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm w-full"
      >
        <div className="mb-8 relative inline-flex">
          <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
          <div className="relative z-10 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
            <Timer size={48} className="text-primary animate-spin-slow" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-2">Preparing Assessment</h2>
        <p className="text-slate-500 font-medium mb-8">Securely initializing your certification module and gathering resources...</p>
        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-full bg-primary"
          />
        </div>
      </motion.div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
       <div className="p-6 bg-rose-50 text-rose-600 rounded-[32px] mb-6">
         <AlertCircle size={48} />
       </div>
       <h2 className="text-2xl font-black text-slate-900 mb-2">Initialization Failed</h2>
       <p className="text-slate-500 font-medium mb-8">{error}</p>
       <button 
         onClick={() => setView('exam_center')}
         className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black"
       >
         Return to Center
       </button>
    </div>
  );

  if (!session) return null;

  if (result) return (
    <div className="min-h-screen bg-white p-6 flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-md w-full text-center"
      >
        <div className="mb-10 relative">
          <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-full" />
          <div className="relative z-10 inline-flex p-8 bg-primary/10 text-primary rounded-[48px] mb-8">
            <Trophy size={80} />
          </div>
        </div>

        <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Assessment Finalized</h1>
        <p className="text-slate-500 font-medium mb-12">The certification results have been processed successfully.</p>
        
        <div className="grid grid-cols-2 gap-4 mb-12">
          <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Final Score</div>
            <div className={`text-4xl font-black ${result.score >= 50 ? 'text-emerald-500' : 'text-rose-500'}`}>{result.score}%</div>
          </div>
          <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Accuracy</div>
            <div className="text-4xl font-black text-slate-900">{result.correct}/{result.total}</div>
          </div>
        </div>

        <div className="p-6 bg-slate-900 text-white rounded-[32px] mb-8 flex items-center justify-between">
           <div className="text-left">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Status</div>
              <div className="text-lg font-black">{result.score >= 50 ? 'Professional Certified' : 'Review Required'}</div>
           </div>
           <Award size={32} className={result.score >= 50 ? 'text-primary' : 'text-slate-600'} />
        </div>

        <button 
          onClick={() => setView('exam_center')}
          className="w-full py-5 bg-primary text-white rounded-[24px] font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-all"
        >
          Return to Dashboard
        </button>
      </motion.div>
    </div>
  );

  const currentQuestion = session.questions[currentIdx];
  const progress = ((currentIdx + 1) / session.questions.length) * 100;

  return (
    <div className="min-h-screen bg-white">
      {/* Professional Sticky Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-24 flex items-center justify-between">
          <div>
            <h2 className="font-black text-slate-900 tracking-tight leading-tight">{session.title}</h2>
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1">
              Assessment Phase • {currentIdx + 1} / {session.questions.length}
            </div>
          </div>
          
          <div className={`flex items-center gap-3 px-5 py-3 rounded-2xl font-mono font-black ${timeLeft < 300 ? 'bg-rose-50 text-rose-600 animate-pulse border border-rose-100' : 'bg-slate-900 text-white shadow-xl shadow-slate-200'}`}>
            <Timer size={20} />
            <span className="text-lg">{formatTime(timeLeft)}</span>
          </div>
        </div>
        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-50">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary"
          />
        </div>
      </div>

      {/* Assessment Content */}
      <div className="max-w-2xl mx-auto p-6 pt-20">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentQuestion.id}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            className="min-h-[400px] flex flex-col"
          >
            <div className="inline-flex px-3 py-1 bg-primary/10 text-primary rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 w-fit">
              {currentQuestion.type} Assessment
            </div>
            <h3 className="text-3xl font-black text-slate-900 mb-12 leading-tight tracking-tight">
              {currentQuestion.question_text}
            </h3>

            <div className="flex-1 space-y-4">
              {currentQuestion.type === 'MCQ' && currentQuestion.options.map((opt, i) => (
                <button 
                  key={opt.id}
                  onClick={() => handleResponseChange(currentQuestion.id, opt.id)}
                  className={`w-full p-6 text-left rounded-[28px] border-2 transition-all flex items-center justify-between group ${responses[currentQuestion.id] === opt.id ? 'border-primary bg-primary/5 text-slate-900' : 'border-slate-50 hover:border-slate-100 bg-slate-50/30 text-slate-600'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-black text-sm transition-colors ${responses[currentQuestion.id] === opt.id ? 'bg-primary border-primary text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                      {String.fromCharCode(65 + i)}
                    </div>
                    <span className="font-bold text-lg">{opt.option_text}</span>
                  </div>
                  {responses[currentQuestion.id] === opt.id && <CheckCircle size={24} className="text-primary" />}
                </button>
              ))}

              {currentQuestion.type === 'True/False' && (
                <div className="grid grid-cols-2 gap-6">
                  {['True', 'False'].map(val => (
                    <button 
                      key={val}
                      onClick={() => handleResponseChange(currentQuestion.id, val)}
                      className={`p-10 rounded-[40px] border-2 font-black text-2xl text-center transition-all ${responses[currentQuestion.id] === val ? 'border-primary bg-primary/5 text-primary' : 'border-slate-50 hover:border-slate-100 bg-slate-50/30 text-slate-400'}`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              )}

              {currentQuestion.type === 'Fill in the Blank' && (
                <div className="relative">
                  <input 
                    type="text"
                    className="w-full p-8 bg-slate-50/50 border-2 border-slate-100 rounded-[32px] focus:border-primary focus:bg-white outline-none transition-all font-black text-2xl text-slate-900 placeholder:text-slate-200"
                    placeholder="Enter assessment response..."
                    value={responses[currentQuestion.id] || ''}
                    onChange={(e) => handleResponseChange(currentQuestion.id, e.target.value)}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-200">
                     <Send size={24} />
                  </div>
                </div>
              )}
            </div>

            <div className="mt-20 flex items-center justify-between pb-20">
              <button 
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                disabled={currentIdx === 0}
                className="flex items-center gap-3 text-slate-400 font-black uppercase text-xs tracking-widest disabled:opacity-0 transition-opacity"
              >
                <ChevronLeft size={20} /> Previous Phase
              </button>
              
              {currentIdx === session.questions.length - 1 ? (
                <button 
                  onClick={() => handleSubmit()}
                  disabled={submitting}
                  className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black flex items-center gap-3 hover:bg-primary hover:shadow-2xl hover:shadow-primary/30 transition-all shadow-xl shadow-slate-200 active:scale-[0.98]"
                >
                  {submitting ? 'Finalizing...' : <><Send size={20} /> Finalize Assessment</>}
                </button>
              ) : (
                <button 
                  onClick={() => setCurrentIdx(prev => Math.min(session.questions.length - 1, prev + 1))}
                  className="bg-slate-900 text-white px-10 py-5 rounded-[24px] font-black flex items-center gap-3 hover:bg-primary transition-all group shadow-xl shadow-slate-200"
                >
                  Next Phase <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Question Grid Indicator */}
        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          {session.questions.map((q, i) => (
            <button 
              key={q.id}
              onClick={() => setCurrentIdx(i)}
              className={`w-12 h-12 rounded-2xl text-xs font-black transition-all border-2 ${currentIdx === i ? 'bg-primary border-primary text-white scale-110 shadow-xl shadow-primary/20' : responses[q.id] ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-white text-slate-200 border-slate-50'}`}
            >
              {(i + 1).toString().padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExamSession;
