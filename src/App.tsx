import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Shield, BookOpen, UserCheck, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';
import ExaminerDashboard from './components/ExaminerDashboard';
import StudentPortal from './components/StudentPortal';
import ExamRoom from './components/ExamRoom';

function Home() {
  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full text-center space-y-8"
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900">
            Secure Exam System
          </h1>
          <p className="text-zinc-500 text-lg max-w-md mx-auto">
            A controlled environment for automated MCQ examinations with advanced anti-cheating measures.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-12">
          <Link to="/examiner">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 text-left cursor-pointer group hover:border-black transition-colors"
            >
              <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-black transition-colors">
                <UserCheck className="w-6 h-6 text-zinc-600 group-hover:text-white" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Examiner Portal</h2>
              <p className="text-zinc-500">Create exams, upload solution keys, and monitor student results in real-time.</p>
            </motion.div>
          </Link>

          <Link to="/student">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-white p-8 rounded-3xl shadow-sm border border-zinc-200 text-left cursor-pointer group hover:border-black transition-colors"
            >
              <div className="w-12 h-12 bg-zinc-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-black transition-colors">
                <BookOpen className="w-6 h-6 text-zinc-600 group-hover:text-white" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Student Portal</h2>
              <p className="text-zinc-500">Join an examination session using a unique code and take your test securely.</p>
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
        <Route path="/examiner" element={<ExaminerDashboard />} />
        <Route path="/student" element={<StudentPortal />} />
        <Route path="/exam/:examId" element={<ExamRoom />} />
      </Routes>
    </Router>
  );
}
