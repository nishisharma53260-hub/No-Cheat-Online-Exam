export interface StartupAnalysis {
  scores: {
    marketNeed: number;
    valueProposition: number;
    targetAudience: number;
    revenueModel: number;
    scalability: number;
    innovationLevel: number;
    overall: number;
  };
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  riskAssessment: {
    financial: string;
    operational: string;
    competitive: string;
    feasibility: string;
  };
  recommendations: {
    productRefinement: string[];
    marketPositioning: string[];
    costOptimization: string[];
    differentiation: string[];
    growthPathways: string[];
  };
  summary: string;
}

export interface EvaluationRecord {
  id: number;
  startup_name: string;
  proposal_text: string;
  analysis_json: string;
  timestamp: string;
}
