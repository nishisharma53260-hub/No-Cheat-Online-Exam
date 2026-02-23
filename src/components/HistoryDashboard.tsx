import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { History, Search, Rocket, ChevronRight, Calendar, BarChart3, ArrowLeft } from 'lucide-react';
import { EvaluationRecord } from '../types';

export default function HistoryDashboard() {
  const [records, setRecords] = useState<EvaluationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetch('/api/evaluations')
      .then(res => res.json())
      .then(data => {
        setRecords(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const filteredRecords = records.filter(r => 
    r.startup_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => window.location.href = '/'}
              className="p-2 hover:bg-white rounded-xl transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-zinc-400" />
            </button>
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
              <History className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-zinc-900">Evaluation History</h1>
          </div>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search startups..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-zinc-200 focus:outline-none focus:border-black transition-all bg-white"
            />
          </div>
        </div>

        <div className="grid gap-6">
          {loading ? (
            <div className="text-center py-20">
              <div className="w-12 h-12 border-4 border-zinc-200 border-t-black rounded-full animate-spin mx-auto mb-4" />
              <p className="text-zinc-500 font-bold">Loading records...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[3rem] border border-dashed border-zinc-200">
              <p className="text-zinc-400 italic text-lg">No evaluations found.</p>
            </div>
          ) : (
            filteredRecords.map((record) => {
              const analysis = JSON.parse(record.analysis_json);
              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-200 hover:shadow-xl hover:border-black transition-all group cursor-pointer"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center space-x-6">
                      <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center border border-zinc-100 group-hover:bg-black transition-colors duration-300">
                        <Rocket className="w-8 h-8 text-zinc-400 group-hover:text-white" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black text-zinc-900">{record.startup_name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-zinc-400 font-bold uppercase tracking-widest">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(record.timestamp).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <BarChart3 className="w-4 h-4" />
                            <span>Score: {analysis.scores.overall}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-8">
                      <div className="text-right hidden md:block">
                        <div className="text-3xl font-black text-zinc-900">{analysis.scores.overall}%</div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Overall Rating</p>
                      </div>
                      <div className="w-12 h-12 rounded-full border border-zinc-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                        <ChevronRight className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
