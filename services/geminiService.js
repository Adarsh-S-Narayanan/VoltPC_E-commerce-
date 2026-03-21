import { GoogleGenAI } from '@google/genai';

const API_KEY = 'AIzaSyBdKEio4WhDl2KA_0kFjrqnyinFy0PK0yM';
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

