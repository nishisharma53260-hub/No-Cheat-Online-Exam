import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, LayoutDashboard, ClipboardList, User, Briefcase, ChevronRight, Search, Filter } from 'lucide-react';

export default function RecruiterDashboard() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'screenings'>('jobs');
  const [jobs, setJobs] = useState<any[]>([]);
  const [screenings, setScreenings] = useState<any[]>([]);
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchJobs();
    fetchScreenings();
  }, []);

  const fetchJobs = async () => {
    const res = await fetch('/api/jobs');
    const data = await res.json();
    setJobs(data);
  };

  const fetchScreenings = async () => {
    const res = await fetch('/api/screenings');
    const data = await res.json();
    setScreenings(data);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle || !newJobDesc) return;

    setLoading(true);
    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newJobTitle, description: newJobDesc })
      });
      setNewJobTitle('');
      setNewJobDesc('');
      fetchJobs();
      alert('Job requirement created!');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
              <LayoutDashboard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">Recruiter Dashboard</h1>
          </div>

          <div className="flex bg-white rounded-2xl p-1.5 shadow-sm border border-slate-200">
            <button
              onClick={() => setActiveTab('jobs')}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'jobs' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Job Requirements
            </button>
            <button
              onClick={() => setActiveTab('screenings')}
              className={`px-8 py-3 rounded-xl text-sm font-bold transition-all ${
                activeTab === 'screenings' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Recent Screenings
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'jobs' ? (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              <div className="lg:col-span-1">
                <form onSubmit={handleCreateJob} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-6 sticky top-8">
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center space-x-2">
                    <Plus className="w-6 h-6" />
                    <span>New Requirement</span>
                  </h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Job Title</label>
                      <input
                        type="text"
                        value={newJobTitle}
                        onChange={(e) => setNewJobTitle(e.target.value)}
                        placeholder="e.g. Senior Frontend Engineer"
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-50 focus:border-slate-900 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black text-slate-400 uppercase tracking-widest">Job Description</label>
                      <textarea
                        value={newJobDesc}
                        onChange={(e) => setNewJobDesc(e.target.value)}
                        placeholder="Paste requirements, skills, and expectations..."
                        className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-50 focus:border-slate-900 transition-all min-h-[200px]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Creating...' : 'Create Requirement'}
                  </button>
                </form>
              </div>

              <div className="lg:col-span-2 space-y-6">
                {jobs.map(job => (
                  <motion.div
                    key={job.id}
                    layout
                    className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-200 hover:shadow-md transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-bold text-slate-900">{job.title}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Created {new Date(job.created_at).toLocaleDateString()}</p>
                      </div>
                      <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-colors">
                        <Briefcase className="w-5 h-5" />
                      </div>
                    </div>
                    <p className="text-slate-500 line-clamp-3 leading-relaxed">
                      {job.description}
                    </p>
                  </motion.div>
                ))}
                {jobs.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200">
                    <p className="text-slate-400 italic">No job requirements created yet.</p>
                  </div>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="screenings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <h2 className="text-2xl font-bold text-slate-900">Screening History</h2>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search candidates..." 
                        className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    <button className="p-2 rounded-xl border border-slate-200 hover:bg-white transition-colors">
                      <Filter className="w-5 h-5 text-slate-500" />
                    </button>
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {screenings.map(screening => (
                    <div key={screening.id} className="p-8 hover:bg-slate-50/50 transition-all flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center space-x-6">
                        <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm">
                          <User className="w-6 h-6 text-slate-400" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xl font-bold text-slate-900">{screening.candidate_name}</h4>
                          <div className="flex items-center space-x-3 text-sm text-slate-500">
                            <span className="font-medium text-indigo-600">{screening.job_title}</span>
                            <span>•</span>
                            <span>{new Date(screening.timestamp).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-12">
                        <div className="text-right">
                          <div className={`text-3xl font-black ${
                            screening.analysis.score >= 80 ? 'text-emerald-500' : 
                            screening.analysis.score >= 50 ? 'text-amber-500' : 'text-rose-500'
                          }`}>
                            {screening.analysis.score}<span className="text-sm text-slate-300">/100</span>
                          </div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Match Score</p>
                        </div>
                        <ChevronRight className="w-6 h-6 text-slate-300 group-hover:text-slate-900 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                  {screenings.length === 0 && (
                    <div className="p-20 text-center text-slate-400 italic">
                      No screenings have been performed yet.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
