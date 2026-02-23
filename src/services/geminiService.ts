import { GoogleGenAI, Type } from "@google/genai";
import { ResumeAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function analyzeResume(resumeText: string, jobDescription: string): Promise<ResumeAnalysis> {
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Analyze the following resume against the job description.
    
    Resume:
    ${resumeText}
    
    Job Description:
    ${jobDescription}
    
    Provide a detailed analysis including:
    1. A suitability score (0-100).
    2. Extracted info: skills, education, certifications, experience.
    3. Relevance analysis (how well the candidate fits).
    4. Personalized improvement suggestions: missing competencies, weak sections, optimization tips.
    5. Overall feedback.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          extractedInfo: {
            type: Type.OBJECT,
            properties: {
              skills: { type: Type.ARRAY, items: { type: Type.STRING } },
              education: { type: Type.ARRAY, items: { type: Type.STRING } },
              certifications: { type: Type.ARRAY, items: { type: Type.STRING } },
              experience: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["skills", "education", "certifications", "experience"],
          },
          relevanceAnalysis: { type: Type.STRING },
          suggestions: {
            type: Type.OBJECT,
            properties: {
              missingCompetencies: { type: Type.ARRAY, items: { type: Type.STRING } },
              weakSections: { type: Type.ARRAY, items: { type: Type.STRING } },
              optimizationTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["missingCompetencies", "weakSections", "optimizationTips"],
          },
          overallFeedback: { type: Type.STRING },
        },
        required: ["score", "extractedInfo", "relevanceAnalysis", "suggestions", "overallFeedback"],
      },
    },
  });

  return JSON.parse(response.text || "{}");
}
