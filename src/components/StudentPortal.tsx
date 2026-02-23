import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Key, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';

export default function StudentPortal() {
  const [name, setName] = useState('');
  const [examId, setExamId] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !examId) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/exams/${examId.toUpperCase()}`);
      if (response.ok) {
        // Store student name in session storage for the exam room
        sessionStorage.setItem('studentName', name);
        navigate(`/exam/${examId.toUpperCase()}`);
      } else {
        alert('Exam not found. Please check the ID.');
      }
    } catch (error) {
      console.error(error);
      alert('Failed to join exam.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white p-10 rounded-[2.5rem] shadow-xl border border-zinc-200"
      >
        <div className="flex flex-col items-center text-center space-y-4 mb-10">
          <div className="w-16 h-16 bg-zinc-100 rounded-2xl flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Student Access</h1>
          <p className="text-zinc-500">Enter your details to begin the secure examination.</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest ml-1">Exam ID</label>
            <div className="relative">
              <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                required
                value={examId}
                onChange={(e) => setExamId(e.target.value.toUpperCase())}
                placeholder="ABC123"
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all font-mono tracking-widest"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 hover:bg-zinc-800 transition-all disabled:opacity-50 group"
          >
            <span>{loading ? 'Verifying...' : 'Begin Examination'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-zinc-100 text-center">
          <p className="text-xs text-zinc-400 leading-relaxed">
            By clicking "Begin Examination", you agree to the secure testing protocols. 
            Any attempt to switch tabs or exit full-screen will result in immediate termination.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
