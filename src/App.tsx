import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FileText, LayoutDashboard, Search, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';
import ResumeScreener from './components/ResumeScreener';
import RecruiterDashboard from './components/RecruiterDashboard';

function Home() {
  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center space-y-12"
      >
        <div className="flex flex-col items-center space-y-6">
          <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-200">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <div className="space-y-2">
            <h1 className="text-6xl font-black tracking-tight text-slate-900">
              AI Resume Screener
            </h1>
            <p className="text-slate-500 text-xl max-w-2xl mx-auto leading-relaxed">
              Intelligent resume evaluation and improvement system powered by advanced NLP. 
              Get instant feedback and suitability scores for any role.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <Link to="/screen">
            <motion.div 
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 text-left cursor-pointer group hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 transition-colors duration-300">
                <Search className="w-7 h-7 text-slate-600 group-hover:text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-slate-900">Candidate Portal</h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                Upload your resume and get a detailed analysis with personalized improvement suggestions.
              </p>
            </motion.div>
          </Link>

          <Link to="/dashboard">
            <motion.div 
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-200 text-left cursor-pointer group hover:border-indigo-600 hover:shadow-xl hover:shadow-indigo-50 transition-all duration-300"
            >
              <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 transition-colors duration-300">
                <LayoutDashboard className="w-7 h-7 text-slate-600 group-hover:text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-3 text-slate-900">Recruiter Panel</h2>
              <p className="text-slate-500 text-lg leading-relaxed">
                Define job requirements, manage screenings, and perform fast, unbiased candidate evaluations.
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
        <Route path="/screen" element={<ResumeScreener />} />
        <Route path="/dashboard" element={<RecruiterDashboard />} />
      </Routes>
    </Router>
  );
}
