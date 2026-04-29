import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ComplaintAnalysis {
  issueType: string;
  priority: "High" | "Medium" | "Low";
  department: string;
  summary: string;
  confidence: number;
}

export async function analyzeComplaint(title: string, description: string): Promise<ComplaintAnalysis> {
  const prompt = `Analyze this civic complaint.
  Title: ${title}
  Description: ${description}

  Provide a classification including:
  - issueType (e.g., Pothole, Garbage, Street Light, Water Leakage, etc.)
  - priority (High, Medium, Low)
  - department (Road department, Water department, Sanitation, Electricity, General)
  - summary (Short 1-sentence summary)
  - confidence (number 0-1)
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            issueType: { type: Type.STRING },
            priority: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
            department: { type: Type.STRING },
            summary: { type: Type.STRING },
            confidence: { type: Type.NUMBER },
          },
          required: ["issueType", "priority", "department", "summary", "confidence"],
        },
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return {
      issueType: "Unclassified",
      priority: "Medium",
      department: "General",
      summary: title,
      confidence: 0,
    };
  }
}
