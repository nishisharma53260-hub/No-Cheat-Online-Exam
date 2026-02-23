import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Send, ClipboardList, CheckCircle, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Question, ExamResult } from '../types';

export default function ExaminerDashboard() {
  const [title, setTitle] = useState('');
  const [examinerEmail, setExaminerEmail] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [solutionKey, setSolutionKey] = useState<string[]>([]);
  const [examId, setExamId] = useState('');
  const [results, setResults] = useState<ExamResult[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'results'>('create');
  const [loading, setLoading] = useState(false);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''] }]);
    setSolutionKey([...solutionKey, '']);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
    setSolutionKey(solutionKey.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[index].text = text;
    setQuestions(newQuestions);
  };

  const updateOption = (qIndex: number, oIndex: number, text: string) => {
    const newQuestions = [...questions];
    newQuestions[qIndex].options[oIndex] = text;
    setQuestions(newQuestions);
  };

  const handleSave = async () => {
    if (!title || !examinerEmail || questions.length === 0) {
      alert('Please fill in all fields and add at least one question.');
      return;
    }

    setLoading(true);
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    try {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, title, questions, solutionKey, examinerEmail }),
      });
      if (response.ok) {
        setExamId(id);
        alert(`Exam created successfully! Exam ID: ${id}`);
        setActiveTab('results');
        fetchResults(id);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to create exam.');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (id: string) => {
    try {
      const response = await fetch(`/api/exams/${id}/results`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-zinc-900">Examiner Dashboard</h1>
          <div className="flex bg-white rounded-xl p-1 shadow-sm border border-zinc-200">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'create' ? 'bg-black text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Create Exam
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'results' ? 'bg-black text-white' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              View Results
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'create' ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 uppercase tracking-wider">Exam Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Computer Science Midterm"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-zinc-700 uppercase tracking-wider">Examiner Email</label>
                    <input
                      type="email"
                      value={examinerEmail}
                      onChange={(e) => setExaminerEmail(e.target.value)}
                      placeholder="results@university.edu"
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {questions.map((q, qIndex) => (
                  <motion.div
                    key={qIndex}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <span className="text-zinc-400 font-mono text-sm">QUESTION {qIndex + 1}</span>
                      <button
                        onClick={() => removeQuestion(qIndex)}
                        className="text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-6">
                      <textarea
                        value={q.text}
                        onChange={(e) => updateQuestion(qIndex, e.target.value)}
                        placeholder="Enter question text..."
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black transition-all min-h-[100px]"
                      />
                      <div className="grid md:grid-cols-2 gap-4">
                        {q.options.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center space-x-3">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={solutionKey[qIndex] === option && option !== ''}
                              onChange={() => {
                                const newKey = [...solutionKey];
                                newKey[qIndex] = option;
                                setSolutionKey(newKey);
                              }}
                              className="w-4 h-4 accent-black"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              placeholder={`Option ${oIndex + 1}`}
                              className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 focus:outline-none focus:border-black transition-all"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4">
                <button
                  onClick={addQuestion}
                  className="flex items-center space-x-2 px-6 py-3 bg-zinc-100 text-zinc-900 rounded-xl font-medium hover:bg-zinc-200 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add Question</span>
                </button>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center space-x-2 px-8 py-3 bg-black text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  <span>{loading ? 'Saving...' : 'Create Exam'}</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-200 flex items-center space-x-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">Active Exam ID</label>
                  <input
                    type="text"
                    value={examId}
                    onChange={(e) => setExamId(e.target.value.toUpperCase())}
                    placeholder="ENTER EXAM ID TO VIEW RESULTS"
                    className="w-full text-xl font-mono font-bold tracking-widest border-none focus:ring-0 p-0"
                  />
                </div>
                <button
                  onClick={() => fetchResults(examId)}
                  className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-zinc-800 transition-colors"
                >
                  Refresh
                </button>
              </div>

              <div className="bg-white rounded-3xl shadow-sm border border-zinc-200 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-zinc-50 border-bottom border-zinc-200">
                      <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Student Name</th>
                      <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {results.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-12 text-center text-zinc-400">
                          No results found for this exam ID.
                        </td>
                      </tr>
                    ) : (
                      results.map((result) => (
                        <tr key={result.id} className="hover:bg-zinc-50 transition-colors">
                          <td className="px-6 py-4 font-medium text-zinc-900">{result.student_name}</td>
                          <td className="px-6 py-4">
                            <span className="text-zinc-900 font-bold">{result.score}</span>
                            <span className="text-zinc-400"> / {result.total_marks}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                              result.status === 'completed' 
                                ? 'bg-emerald-50 text-emerald-700' 
                                : 'bg-red-50 text-red-700'
                            }`}>
                              {result.status === 'completed' ? (
                                <CheckCircle className="w-3 h-3" />
                              ) : (
                                <XCircle className="w-3 h-3" />
                              )}
                              <span className="capitalize">{result.status}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-zinc-500">
                            {new Date(result.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
