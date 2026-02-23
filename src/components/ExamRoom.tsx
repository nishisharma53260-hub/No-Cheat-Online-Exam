import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertTriangle, Clock, CheckCircle, ChevronRight, ChevronLeft, Send, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Exam, Question } from '../types';

export default function ExamRoom() {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isExamStarted, setIsExamStarted] = useState(false);
  const [isTerminated, setIsTerminated] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [totalMarks, setTotalMarks] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour default
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isExamStarted && !isSubmitted && !isTerminated) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            submitExam('completed');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isExamStarted, isSubmitted, isTerminated]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  const studentName = sessionStorage.getItem('studentName') || 'Unknown Student';
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!examId) return;
    fetch(`/api/exams/${examId}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          navigate('/student');
        } else {
          setExam(data);
        }
      });
  }, [examId, navigate]);

  // Anti-Cheating Measures
  useEffect(() => {
    if (!isExamStarted || isSubmitted || isTerminated) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        terminateExam('Tab switching detected');
      }
    };

    const handleBlur = () => {
      terminateExam('Window focus lost');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        terminateExam('Exited full-screen mode');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isExamStarted, isSubmitted, isTerminated]);

  const startExam = async () => {
    try {
      if (containerRef.current) {
        await containerRef.current.requestFullscreen();
        setIsExamStarted(true);
      }
    } catch (err) {
      alert('Please enable full-screen to start the exam.');
    }
  };

  const terminateExam = async (reason: string) => {
    if (isTerminated || isSubmitted) return;
    setIsTerminated(true);
    console.warn(`Exam Terminated: ${reason}`);
    await submitExam('terminated');
  };

  const submitExam = async (status: 'completed' | 'terminated' = 'completed') => {
    if (isSubmitted) return;
    
    try {
      const response = await fetch(`/api/exams/${examId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName,
          answers,
          status
        }),
      });
      
      const data = await response.json();
      setScore(data.score);
      setTotalMarks(data.totalMarks);
      setIsSubmitted(true);
      
      if (document.fullscreenElement) {
        document.exitFullscreen();
      }
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to submit exam. Please contact the examiner.');
    }
  };

  if (!exam) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl text-center space-y-6"
        >
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center ${isTerminated ? 'bg-red-50' : 'bg-emerald-50'}`}>
            {isTerminated ? (
              <AlertTriangle className="w-10 h-10 text-red-500" />
            ) : (
              <CheckCircle className="w-10 h-10 text-emerald-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold text-zinc-900">
            {isTerminated ? 'Exam Terminated' : 'Exam Completed'}
          </h1>
          <p className="text-zinc-500">
            {isTerminated 
              ? 'Your exam was terminated due to a security violation. Your attempted answers have been submitted.' 
              : 'Well done! Your responses have been securely submitted and evaluated.'}
          </p>
          <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
            <div className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-1">Final Score</div>
            <div className="text-5xl font-black text-zinc-900">
              {score} <span className="text-2xl text-zinc-300">/ {totalMarks}</span>
            </div>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:bg-zinc-800 transition-all"
          >
            Return Home
          </button>
        </motion.div>
      </div>
    );
  }

  if (!isExamStarted) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full bg-white p-10 rounded-[2.5rem] shadow-xl space-y-8"
        >
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight">{exam.title}</h1>
            <div className="flex items-center space-x-4 text-zinc-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>60 Minutes</span>
              </div>
              <div className="flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>{exam.questions.length} Questions</span>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl space-y-3">
            <h3 className="font-bold text-amber-900 flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>Security Protocol</span>
            </h3>
            <ul className="text-sm text-amber-800 space-y-2 list-disc list-inside">
              <li>The exam will run in full-screen mode.</li>
              <li>Do not switch tabs or minimize the window.</li>
              <li>Do not refresh the page.</li>
              <li>Any violation will result in immediate termination.</li>
            </ul>
          </div>

          <button 
            onClick={startExam}
            className="w-full bg-black text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:bg-zinc-800 transition-all shadow-lg"
          >
            <Maximize className="w-6 h-6" />
            <span>Enter Secure Mode & Start</span>
          </button>
        </motion.div>
      </div>
    );
  }

  const currentQuestion = exam.questions[currentQuestionIndex];

  return (
    <div ref={containerRef} className="min-h-screen bg-white flex flex-col select-none">
      {/* Header */}
      <header className="px-8 py-6 border-b border-zinc-100 flex items-center justify-between bg-white sticky top-0 z-10">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-zinc-900">{exam.title}</h2>
            <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{studentName}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-3 bg-zinc-50 px-4 py-2 rounded-xl border border-zinc-100">
            <Clock className="w-5 h-5 text-zinc-400" />
            <span className={`font-mono font-bold ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-zinc-900'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <button 
            onClick={() => {
              if (confirm('Are you sure you want to submit the exam?')) {
                submitExam('completed');
              }
            }}
            className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold hover:bg-emerald-600 transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Submit Exam</span>
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-zinc-100">
        <motion.div 
          className="h-full bg-black"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%` }}
        />
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <span className="text-xs font-black text-zinc-300 uppercase tracking-[0.2em]">Question {currentQuestionIndex + 1} of {exam.questions.length}</span>
              <h3 className="text-3xl font-bold text-zinc-900 leading-tight">
                {currentQuestion.text}
              </h3>
            </div>

            <div className="grid gap-4">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => setAnswers({ ...answers, [currentQuestionIndex]: option })}
                  className={`w-full p-6 rounded-2xl text-left border-2 transition-all flex items-center justify-between group ${
                    answers[currentQuestionIndex] === option
                      ? 'border-black bg-zinc-50'
                      : 'border-zinc-100 hover:border-zinc-200 bg-white'
                  }`}
                >
                  <span className={`text-lg font-medium ${answers[currentQuestionIndex] === option ? 'text-zinc-900' : 'text-zinc-500'}`}>
                    {option}
                  </span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    answers[currentQuestionIndex] === option ? 'border-black bg-black' : 'border-zinc-200 group-hover:border-zinc-300'
                  }`}>
                    {answers[currentQuestionIndex] === option && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Navigation */}
      <footer className="px-8 py-8 border-t border-zinc-100 bg-white">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
            className="flex items-center space-x-2 text-zinc-400 hover:text-zinc-900 disabled:opacity-0 transition-all font-bold"
          >
            <ChevronLeft className="w-6 h-6" />
            <span>Previous</span>
          </button>
          
          <div className="flex space-x-2">
            {exam.questions.map((_, idx) => (
              <div 
                key={idx}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentQuestionIndex ? 'w-8 bg-black' : (answers[idx] ? 'bg-zinc-400' : 'bg-zinc-200')
                }`}
              />
            ))}
          </div>

          <button
            disabled={currentQuestionIndex === exam.questions.length - 1}
            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
            className="flex items-center space-x-2 text-zinc-900 hover:translate-x-1 disabled:opacity-0 transition-all font-bold"
          >
            <span>Next Question</span>
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </footer>
    </div>
  );
}

function ShieldCheck(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
