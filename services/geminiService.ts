import { GoogleGenAI, Type, Modality } from "@google/genai";
import { TargetLanguage, EnhancementResponse, PracticeScenario } from "../types";

// Initialize the Gemini API client
// CRITICAL: process.env.API_KEY is automatically injected.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    originalText: { type: Type.STRING },
    literalTranslation: { type: Type.STRING },
    improvedVersion: { type: Type.STRING, description: "A grammatically correct and natural sounding version." },
    professionalVersion: { type: Type.STRING, description: "A formal version suitable for business or academic contexts." },
    alternatives: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 alternative ways to say this."
    },
    grammarNotes: { type: Type.STRING, description: "Explanation of grammar corrections or structure." },
    culturalContext: { type: Type.STRING, description: "Notes on when to use this phrase appropriately." },
    conversationTips: { type: Type.STRING, description: "Tips to improve delivery or tone." }
  },
  required: ["originalText", "literalTranslation", "improvedVersion", "professionalVersion", "alternatives", "grammarNotes", "culturalContext", "conversationTips"]
};

export const enhanceCommunication = async (text: string, targetLang: TargetLanguage): Promise<EnhancementResponse> => {
  try {
    const prompt = `
      You are an expert communication coach specializing in teaching ${targetLang} to Tamil speakers.
      Analyze the following Tamil text (which might be in Tamil script or Tanglish): "${text}".
      
      1. Translate it literally.
      2. Provide a grammatically improved version.
      3. Provide a professional/formal version.
      4. Suggest alternative phrases.
      5. Explain the grammar and structure differences between Tamil and ${targetLang}.
      6. Provide cultural context or politeness tips.
      
      Output strictly in JSON format.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as EnhancementResponse;
    }
    throw new Error("Empty response from AI");

  } catch (error) {
    console.error("Enhancement error:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    
    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error("No audio data generated");
    
    return audioData;
  } catch (error) {
    console.error("TTS error:", error);
    throw error;
  }
};

export const generatePracticeScenario = async (topic: string): Promise<PracticeScenario> => {
  try {
    const schema = {
      type: Type.OBJECT,
      properties: {
        scenarioTitle: { type: Type.STRING },
        description: { type: Type.STRING },
        dialogue: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              speaker: { type: Type.STRING },
              text: { type: Type.STRING },
              note: { type: Type.STRING, description: "Learning note for this line" }
            }
          }
        }
      }
    };

    const prompt = `Create a short practice dialogue scenario for a student learning English. Topic: ${topic}. Include specific notes on vocabulary or grammar for the learner.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as PracticeScenario;
    }
    throw new Error("Failed to generate scenario");
  } catch (error) {
    console.error("Scenario error:", error);
    throw error;
  }
};

export const transcribeAudio = async (base64Audio: string, mimeType: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Audio
            }
          },
          {
            text: "Transcribe this audio exactly as spoken. The speaker is likely speaking Tamil or Tanglish (Tamil mixed with English). Do not translate. Return only the raw transcription text."
          }
        ]
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Transcription error:", error);
    throw error;
  }
};
