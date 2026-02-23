export interface ResumeAnalysis {
  score: number;
  extractedInfo: {
    skills: string[];
    education: string[];
    certifications: string[];
    experience: string[];
  };
  relevanceAnalysis: string;
  suggestions: {
    missingCompetencies: string[];
    weakSections: string[];
    optimizationTips: string[];
  };
  overallFeedback: string;
}

export interface JobRequirement {
  title: string;
  description: string;
}
