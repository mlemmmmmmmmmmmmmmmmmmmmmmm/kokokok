import { GoogleGenAI } from "@google/genai";
import { WellnessLog } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

export const getStudyHelp = async (query: string, context?: string) => {
  try {
    const ai = getClient();
    const model = ai.models;
    
    const systemInstruction = `You are a friendly, encouraging Capybara named "Capy" who helps students study. 
    You provide clear, concise explanations and helpful study tips. 
    Always maintain a supportive and calm tone. 
    If the user asks about a specific subject, provide a summary or answer.`;

    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Context: ${context || 'General Study Help'}\n\nUser Question: ${query}`,
      config: {
        systemInstruction: systemInstruction,
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Squeak! I'm having trouble connecting to the brain waves right now. Try again later!";
  }
};

export const getWellnessInsights = async (logs: WellnessLog[]) => {
  try {
    const ai = getClient();
    const model = ai.models;

    const dataSummary = JSON.stringify(logs.slice(-7)); // Last 7 days

    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Here is my wellness data for the last week: ${dataSummary}. 
      Please analyze this and give me 3 specific, actionable, and friendly tips to improve my routine, sleep, or hydration. 
      Keep it short and formatted as a bulleted list. Add a Capybara pun.`,
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Wellness Error:", error);
    return "I need more data to give you proper insights! Keep tracking your stats.";
  }
};