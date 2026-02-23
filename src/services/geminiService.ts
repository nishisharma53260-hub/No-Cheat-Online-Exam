import { GoogleGenAI, Type } from "@google/genai";
import { StartupAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeStartupIdea(proposalText: string): Promise<StartupAnalysis> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the following startup business proposal.
    
    Proposal:
    ${proposalText}
    
    Provide a structured evaluation including:
    1. Scores (0-100) for: Market Need, Value Proposition, Target Audience, Revenue Model, Scalability, Innovation Level, and an Overall Score.
    2. A SWOT Analysis: Strengths, Weaknesses, Opportunities, Threats.
    3. A Risk Assessment: Financial, Operational, Competitive, Feasibility.
    4. Strategic Recommendations: Product Refinement, Market Positioning, Cost Optimization, Differentiation, Growth Pathways.
    5. A concise summary of the evaluation.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scores: {
            type: Type.OBJECT,
            properties: {
              marketNeed: { type: Type.NUMBER },
              valueProposition: { type: Type.NUMBER },
              targetAudience: { type: Type.NUMBER },
              revenueModel: { type: Type.NUMBER },
              scalability: { type: Type.NUMBER },
              innovationLevel: { type: Type.NUMBER },
              overall: { type: Type.NUMBER },
            },
            required: ["marketNeed", "valueProposition", "targetAudience", "revenueModel", "scalability", "innovationLevel", "overall"],
          },
          swot: {
            type: Type.OBJECT,
            properties: {
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
              opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
              threats: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["strengths", "weaknesses", "opportunities", "threats"],
          },
          riskAssessment: {
            type: Type.OBJECT,
            properties: {
              financial: { type: Type.STRING },
              operational: { type: Type.STRING },
              competitive: { type: Type.STRING },
              feasibility: { type: Type.STRING },
            },
            required: ["financial", "operational", "competitive", "feasibility"],
          },
          recommendations: {
            type: Type.OBJECT,
            properties: {
              productRefinement: { type: Type.ARRAY, items: { type: Type.STRING } },
              marketPositioning: { type: Type.ARRAY, items: { type: Type.STRING } },
              costOptimization: { type: Type.ARRAY, items: { type: Type.STRING } },
              differentiation: { type: Type.ARRAY, items: { type: Type.STRING } },
              growthPathways: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["productRefinement", "marketPositioning", "costOptimization", "differentiation", "growthPathways"],
          },
          summary: { type: Type.STRING },
        },
        required: ["scores", "swot", "riskAssessment", "recommendations", "summary"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}
