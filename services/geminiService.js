import { GoogleGenAI } from '@google/genai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const MODEL_NAME = 'gemini-flash-latest';

export const chatWithSystemAssistant = async (history, userMessage) => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const contents = [...history, { role: 'user', parts: [{ text: userMessage }] }];
  
  const response = await ai.models.generateContent({
    model: MODEL_NAME,
    contents: contents,
  });
  
  return response.text;
};

