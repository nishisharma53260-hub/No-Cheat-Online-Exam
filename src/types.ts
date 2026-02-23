export interface Question {
  text: string;
  options: string[];
}

export interface Exam {
  id: string;
  title: string;
  questions: Question[];
  examinerEmail: string;
}

export interface ExamResult {
  id: number;
  exam_id: string;
  student_name: string;
  answers: string[];
  score: number;
  total_marks: number;
  status: 'completed' | 'terminated';
  timestamp: string;
}
