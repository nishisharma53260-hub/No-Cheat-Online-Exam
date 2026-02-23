import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Rocket, History, Lightbulb, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';
import StartupEvaluator from './components/StartupEvaluator';
import HistoryDashboard from './components/HistoryDashboard';

function Home() {
  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center space-y-12"
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="w-24 h-24 bg-black rounded-[2rem] flex items-center justify-center shadow-2xl">
            <Rocket className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-4">
            <h1 className="text-6xl font-black tracking-tighter text-zinc-900">
              Startup Evaluator
            </h1>
            <p className="text-zinc-500 text-xl max-w-2xl mx-auto leading-relaxed">
              Your AI-powered virtual mentor. Validate your business ideas with data-driven SWOT analysis, risk assessment, and strategic growth pathways.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <Link to="/evaluate">
            <motion.div 
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-zinc-200 text-left cursor-pointer group hover:border-black hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-black transition-colors duration-300">
                <Lightbulb className="w-7 h-7 text-zinc-600 group-hover:text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-zinc-900">New Evaluation</h2>
              <p className="text-zinc-500 text-lg leading-relaxed">
                Submit your business proposal for a comprehensive AI-driven analysis and strategic audit.
              </p>
            </motion.div>
          </Link>

          <Link to="/history">
            <motion.div 
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-zinc-200 text-left cursor-pointer group hover:border-black hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 bg-zinc-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-black transition-colors duration-300">
                <History className="w-7 h-7 text-zinc-600 group-hover:text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-zinc-900">History</h2>
              <p className="text-zinc-500 text-lg leading-relaxed">
                Access your previous evaluations, track improvements, and revisit strategic recommendations.
              </p>
            </motion.div>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/evaluate" element={<StartupEvaluator />} />
        <Route path="/history" element={<HistoryDashboard />} />
      </Routes>
    </Router>
  );
}
