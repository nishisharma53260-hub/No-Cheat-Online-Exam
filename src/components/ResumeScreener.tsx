import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, FileText, CheckCircle, AlertCircle, Sparkles, ArrowRight, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import Markdown from 'react-markdown';
import { analyzeResume } from '../services/geminiService';
import { ResumeAnalysis, JobRequirement } from '../types';

export default function ResumeScreener() {
  const [candidateName, setCandidateName] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [jobId, setJobId] = useState<number | null>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    fetch('/api/jobs')
      .then(res => res.json())
      .then(setJobs);
  }, []);

  const handleAnalyze = async () => {
    if (!candidateName || !resumeText || !jobId) {
      alert('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const selectedJob = jobs.find(j => j.id === jobId);
      const result = await analyzeResume(resumeText, selectedJob.description);
      setAnalysis(result);
      
      // Save screening to DB
      await fetch('/api/screenings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName,
          resumeText,
          jobId,
          analysis: result
        })
      });
    } catch (error) {
      console.error(error);
      alert('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">Resume Analysis</h1>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="text-slate-500 hover:text-slate-900 font-medium transition-colors"
          >
            Back to Home
          </button>
        </div>

        {!analysis ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid md:grid-cols-3 gap-8"
          >
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Candidate Name</label>
                  <input 
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all text-lg"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Resume Content</label>
                  <textarea 
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume text here..."
                    className="w-full px-6 py-4 rounded-2xl border border-slate-200 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all text-lg min-h-[400px] font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 space-y-6 sticky top-8">
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest">Target Position</label>
                  <div className="space-y-3">
                    {jobs.map(job => (
                      <button
                        key={job.id}
                        onClick={() => setJobId(job.id)}
                        className={`w-full p-4 rounded-xl text-left border-2 transition-all ${
                          jobId === job.id 
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900' 
                            : 'border-slate-100 hover:border-slate-200 text-slate-600'
                        }`}
                      >
                        <div className="font-bold">{job.title}</div>
                      </button>
                    ))}
                    {jobs.length === 0 && (
                      <p className="text-slate-400 text-sm italic">No job requirements defined yet.</p>
                    )}
                  </div>
                </div>

                <button 
                  onClick={handleAnalyze}
                  disabled={loading || !candidateName || !resumeText || !jobId}
                  className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold text-lg flex items-center justify-center space-x-3 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-6 h-6" />
                      <span>Start Evaluation</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-8"
          >
            <div className="bg-white p-12 rounded-[3rem] shadow-sm border border-slate-200 text-center space-y-8">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Suitability Score</h2>
                <div className={`text-9xl font-black ${getScoreColor(analysis.score)}`}>
                  {analysis.score}<span className="text-4xl text-slate-200">/100</span>
                </div>
              </div>

              <div className="max-w-2xl mx-auto">
                <p className="text-slate-600 text-xl leading-relaxed italic">
                  "{analysis.overallFeedback}"
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <button 
                  onClick={() => setAnalysis(null)}
                  className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
                >
                  Analyze Another
                </button>
                <button 
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all flex items-center space-x-2"
                >
                  <span>{showDetails ? 'Hide Details' : 'View Full Report'}</span>
                  {showDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {showDetails && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden space-y-8"
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-8">
                      <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                        <span>Extracted Profile</span>
                      </h3>
                      
                      <div className="space-y-6">
                        <Section title="Technical Skills" items={analysis.extractedInfo.skills} />
                        <Section title="Experience" items={analysis.extractedInfo.experience} />
                        <Section title="Education" items={analysis.extractedInfo.education} />
                      </div>
                    </div>

                    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-8">
                      <h3 className="text-2xl font-bold text-slate-900 flex items-center space-x-3">
                        <Sparkles className="w-6 h-6 text-indigo-500" />
                        <span>Improvement Roadmap</span>
                      </h3>

                      <div className="space-y-6">
                        <Section title="Missing Competencies" items={analysis.suggestions.missingCompetencies} color="text-rose-500" />
                        <Section title="Weak Sections" items={analysis.suggestions.weakSections} color="text-amber-500" />
                        <Section title="Optimization Tips" items={analysis.suggestions.optimizationTips} color="text-indigo-500" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200">
                    <h3 className="text-2xl font-bold text-slate-900 mb-6">Relevance Analysis</h3>
                    <div className="prose prose-slate max-w-none">
                      <Markdown>{analysis.relevanceAnalysis}</Markdown>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function Section({ title, items, color = "text-slate-900" }: { title: string, items: string[], color?: string }) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className={`px-3 py-1 bg-slate-50 rounded-lg text-sm font-medium ${color}`}>
            {item}
          </span>
        ))}
        {items.length === 0 && <span className="text-slate-400 text-sm italic">None identified</span>}
      </div>
    </div>
  );
}
