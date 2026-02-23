import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Rocket, Lightbulb, Target, TrendingUp, ShieldAlert, CheckCircle2, Loader2, ArrowLeft, ChevronRight, BarChart3, AlertCircle } from 'lucide-react';
import Markdown from 'react-markdown';
import { analyzeStartupIdea } from '../services/geminiService';
import { StartupAnalysis } from '../types';

export default function StartupEvaluator() {
  const [startupName, setStartupName] = useState('');
  const [proposalText, setProposalText] = useState('');
  const [analysis, setAnalysis] = useState<StartupAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState<'scores' | 'swot' | 'risks' | 'recommendations'>('scores');

  const handleEvaluate = async () => {
    if (!startupName || !proposalText) {
      alert('Please provide a startup name and business proposal.');
      return;
    }

    setLoading(true);
    try {
      const result = await analyzeStartupIdea(proposalText);
      setAnalysis(result);
      
      // Save to DB
      await fetch('/api/evaluations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startupName,
          proposalText,
          analysis: result
        })
      });
    } catch (error) {
      console.error(error);
      alert('Evaluation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (analysis) {
    return (
      <div className="min-h-screen bg-[#fafafa] p-6 md:p-12">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => setAnalysis(null)}
              className="flex items-center space-x-2 text-zinc-500 hover:text-zinc-900 font-bold transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>New Evaluation</span>
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-black text-zinc-900">{startupName}</h1>
            </div>
          </div>

          <div className="grid lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 space-y-2">
              <NavButton 
                active={activeSection === 'scores'} 
                onClick={() => setActiveSection('scores')}
                icon={<BarChart3 className="w-5 h-5" />}
                label="Performance Scores"
              />
              <NavButton 
                active={activeSection === 'swot'} 
                onClick={() => setActiveSection('swot')}
                icon={<Target className="w-5 h-5" />}
                label="SWOT Analysis"
              />
              <NavButton 
                active={activeSection === 'risks'} 
                onClick={() => setActiveSection('risks')}
                icon={<ShieldAlert className="w-5 h-5" />}
                label="Risk Assessment"
              />
              <NavButton 
                active={activeSection === 'recommendations'} 
                onClick={() => setActiveSection('recommendations')}
                icon={<TrendingUp className="w-5 h-5" />}
                label="Strategic Roadmap"
              />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-zinc-200"
                >
                  {activeSection === 'scores' && (
                    <div className="space-y-10">
                      <div className="flex items-center justify-between">
                        <h2 className="text-3xl font-black text-zinc-900">Performance Metrics</h2>
                        <div className="text-right">
                          <div className="text-5xl font-black text-zinc-900">{analysis.scores.overall}%</div>
                          <div className="text-xs font-black text-zinc-400 uppercase tracking-widest">Overall Score</div>
                        </div>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-8">
                        <ScoreCard label="Market Need" score={analysis.scores.marketNeed} />
                        <ScoreCard label="Value Proposition" score={analysis.scores.valueProposition} />
                        <ScoreCard label="Target Audience" score={analysis.scores.targetAudience} />
                        <ScoreCard label="Revenue Model" score={analysis.scores.revenueModel} />
                        <ScoreCard label="Scalability" score={analysis.scores.scalability} />
                        <ScoreCard label="Innovation" score={analysis.scores.innovationLevel} />
                      </div>

                      <div className="pt-8 border-t border-zinc-100">
                        <h3 className="text-sm font-black text-zinc-400 uppercase tracking-widest mb-4">Executive Summary</h3>
                        <p className="text-zinc-600 text-lg leading-relaxed">{analysis.summary}</p>
                      </div>
                    </div>
                  )}

                  {activeSection === 'swot' && (
                    <div className="space-y-10">
                      <h2 className="text-3xl font-black text-zinc-900">SWOT Analysis</h2>
                      <div className="grid md:grid-cols-2 gap-8">
                        <SwotBox title="Strengths" items={analysis.swot.strengths} color="emerald" />
                        <SwotBox title="Weaknesses" items={analysis.swot.weaknesses} color="rose" />
                        <SwotBox title="Opportunities" items={analysis.swot.opportunities} color="indigo" />
                        <SwotBox title="Threats" items={analysis.swot.threats} color="amber" />
                      </div>
                    </div>
                  )}

                  {activeSection === 'risks' && (
                    <div className="space-y-10">
                      <h2 className="text-3xl font-black text-zinc-900">Risk Assessment</h2>
                      <div className="space-y-6">
                        <RiskItem title="Financial Risks" content={analysis.riskAssessment.financial} />
                        <RiskItem title="Operational Risks" content={analysis.riskAssessment.operational} />
                        <RiskItem title="Competitive Risks" content={analysis.riskAssessment.competitive} />
                        <RiskItem title="Feasibility Risks" content={analysis.riskAssessment.feasibility} />
                      </div>
                    </div>
                  )}

                  {activeSection === 'recommendations' && (
                    <div className="space-y-10">
                      <h2 className="text-3xl font-black text-zinc-900">Strategic Roadmap</h2>
                      <div className="space-y-8">
                        <RecommendationGroup title="Product Refinement" items={analysis.recommendations.productRefinement} />
                        <RecommendationGroup title="Market Positioning" items={analysis.recommendations.marketPositioning} />
                        <RecommendationGroup title="Cost Optimization" items={analysis.recommendations.costOptimization} />
                        <RecommendationGroup title="Differentiation Strategies" items={analysis.recommendations.differentiation} />
                        <RecommendationGroup title="Growth Pathways" items={analysis.recommendations.growthPathways} />
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center shadow-lg">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-black text-zinc-900">Idea Evaluation</h1>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="text-zinc-500 hover:text-zinc-900 font-bold transition-colors"
          >
            Back to Home
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-12 rounded-[3rem] shadow-sm border border-zinc-200 space-y-10"
        >
          <div className="space-y-4">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Startup Name</label>
            <input 
              type="text"
              value={startupName}
              onChange={(e) => setStartupName(e.target.value)}
              placeholder="e.g. EcoFlow Energy"
              className="w-full px-8 py-5 rounded-2xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-zinc-50 focus:border-black transition-all text-xl font-bold"
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-black text-zinc-400 uppercase tracking-widest ml-1">Business Proposal</label>
            <textarea 
              value={proposalText}
              onChange={(e) => setProposalText(e.target.value)}
              placeholder="Describe your value proposition, target market, revenue model, and scalability plan..."
              className="w-full px-8 py-6 rounded-3xl border border-zinc-200 focus:outline-none focus:ring-4 focus:ring-zinc-50 focus:border-black transition-all text-lg min-h-[400px] leading-relaxed"
            />
          </div>

          <button 
            onClick={handleEvaluate}
            disabled={loading || !startupName || !proposalText}
            className="w-full bg-black text-white py-6 rounded-2xl font-black text-xl flex items-center justify-center space-x-4 hover:bg-zinc-800 transition-all shadow-2xl shadow-zinc-200 disabled:opacity-50 disabled:shadow-none group"
          >
            {loading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin" />
                <span>Analyzing Concept...</span>
              </>
            ) : (
              <>
                <Rocket className="w-7 h-7 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                <span>Evaluate Startup Idea</span>
              </>
            )}
          </button>
        </motion.div>
      </div>
    </div>
  );
}

function NavButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-6 py-4 rounded-2xl font-bold transition-all ${
        active 
          ? 'bg-black text-white shadow-xl shadow-zinc-100' 
          : 'text-zinc-500 hover:bg-white hover:text-zinc-900 border border-transparent hover:border-zinc-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

function ScoreCard({ label, score }: { label: string, score: number }) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end">
        <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">{label}</span>
        <span className="text-xl font-black text-zinc-900">{score}%</span>
      </div>
      <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full bg-black"
        />
      </div>
    </div>
  );
}

function SwotBox({ title, items, color }: { title: string, items: string[], color: 'emerald' | 'rose' | 'indigo' | 'amber' }) {
  const colors = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-100'
  };

  return (
    <div className={`p-8 rounded-3xl border ${colors[color]} space-y-4`}>
      <h3 className="text-lg font-black uppercase tracking-widest">{title}</h3>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-start space-x-2 text-sm font-medium leading-relaxed">
            <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-50" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RiskItem({ title, content }: { title: string, content: string }) {
  return (
    <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-100 space-y-2">
      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-widest flex items-center space-x-2">
        <AlertCircle className="w-4 h-4" />
        <span>{title}</span>
      </h4>
      <p className="text-zinc-700 font-medium leading-relaxed">{content}</p>
    </div>
  );
}

function RecommendationGroup({ title, items }: { title: string, items: string[] }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-black text-zinc-900">{title}</h3>
      <div className="grid md:grid-cols-2 gap-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-center space-x-3 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
            <CheckCircle2 className="w-5 h-5 text-zinc-400" />
            <span className="text-sm font-medium text-zinc-700">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
