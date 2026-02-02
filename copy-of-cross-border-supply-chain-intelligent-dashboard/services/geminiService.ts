
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY || "";

export const getManagementSummary = async (context: string) => {
  if (!API_KEY) return "API Key not configured. Please check environment variables.";
  
  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一个资深的跨境供应链管理专家。请根据以下业务数据，提供一段简洁有力（不超过150字）的管理小结，包含核心成就、风险预警和建议动作。数据：${context}`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "暂时无法提取管理总结，请查看具体指标明细。";
  }
};
