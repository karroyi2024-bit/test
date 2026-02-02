
import { GoogleGenAI } from "@google/genai";

// Use process.env.API_KEY directly as it is guaranteed to be available in this environment.
export const getManagementSummary = async (context: string) => {
  try {
    // Initialize GoogleGenAI with the API key from environment variables.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Using gemini-3-flash-preview for summarization task.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `你是一个资深的跨境供应链管理专家。请根据以下业务数据，提供一段简洁有力（不超过150字）的管理小结，包含核心成就、风险预警和建议动作。数据：${context}`,
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });
    
    // Directly access the .text property of GenerateContentResponse.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "暂时无法提取管理总结，请查看具体指标明细。";
  }
};
