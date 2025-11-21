import { GoogleGenAI } from "@google/genai";
import { GenerationSettings } from "../types";

const GENERATION_MODEL = 'gemini-2.5-flash-image';

// Helper to safely initialize the AI client
const getGenAIClient = () => {
  const apiKey = process.env.API_KEY;
  const baseUrl = process.env.API_BASE_URL;
  
  // Check if key is missing or empty
  if (!apiKey || apiKey.trim() === '') {
    throw new Error("API Key 未配置。请在部署设置的环境变量中添加 API_KEY。");
  }
  
  const options: any = { apiKey };
  if (baseUrl && baseUrl.trim() !== '') {
    options.baseUrl = baseUrl;
  }
  
  return new GoogleGenAI(options);
};

export const generateLandscape = async (
  base64Image: string,
  settings: GenerationSettings,
  referenceImage?: string | null
): Promise<string> => {
  try {
    const ai = getGenAIClient();
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
    
    let taskInstructions = '';
    let referenceInstructions = '';

    // Handle Reference Image Logic
    if (referenceImage) {
      referenceInstructions = `
        REFERENCE IMAGE INSTRUCTION:
        The second image provided is a STYLE REFERENCE.
        You MUST extract the following from the Reference Image and apply it to the Input Architecture:
        1. Vegetation Types & Density (Trees, plants, flowers).
        2. Color Palette & Tones.
        3. Lighting Condition & Atmosphere.
        4. Human elements/activity style if present.
        
        Do NOT copy the geometry of the reference image. Apply its VIBE and STYLE to the Input Architecture.
      `;
    }

    if (settings.sceneType === 'interior') {
      taskInstructions = `
        TASK:
        Transform the first input image into a PHOTOREALISTIC INTERIOR ARCHITECTURAL RENDERING.
        1. MATERIALITY: You MUST apply realistic interior materials to the geometry.
        2. PRESERVATION: Keep the original room geometry, perspective, and camera angle EXACTLY as is.
        3. INTERIOR STYLE: Apply a "${settings.interiorStyle}" interior design style.
        ${referenceImage ? '4. Apply the color palette and mood from the Reference Image.' : `4. FURNITURE & DECOR: Populate consistent with "${settings.interiorStyle}".`}
        5. LIGHTING: Simulate natural lighting based on "${settings.time}".
      `;
    } else {
      taskInstructions = `
        TASK:
        Transform the first input image into a PHOTOREALISTIC EXTERIOR ARCHITECTURAL RENDERING.
        1. MATERIALITY: You MUST apply realistic materials to the building geometry.
        2. PRESERVATION: Keep the original building geometry, perspective, and camera angle EXACTLY as is.
        3. LANDSCAPE: Generate a "${settings.style}" landscape.
        ${referenceImage ? '4. Apply the vegetation density, plant species, and color grading from the Reference Image.' : ''}
        5. ATMOSPHERE: Lighting must match "${settings.time}" in "${settings.season}".
      `;
    }

    const prompt = `
      Act as a world-class architectural visualizer.
      
      INPUTS:
      Image 1: Target Architecture (White model/Line drawing).
      ${referenceImage ? 'Image 2: Style Reference.' : ''}
      
      ${taskInstructions}
      ${referenceInstructions}
      
      ADDITIONAL DETAILS:
      Add ${settings.promptEnhancement}.
      
      Make it look like a high-end photograph.
    `;

    const parts: any[] = [
        { text: prompt },
        { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
    ];

    // Add reference image to parts if it exists
    if (referenceImage) {
      const cleanRefBase64 = referenceImage.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
      parts.push({ inlineData: { mimeType: 'image/jpeg', data: cleanRefBase64 } });
    }

    const response = await ai.models.generateContent({
      model: GENERATION_MODEL,
      contents: {
        parts: parts,
      },
    });

    if (response.candidates && response.candidates.length > 0) {
      const content = response.candidates[0].content;
      if (content && content.parts) {
        for (const part of content.parts) {
          if (part.inlineData && part.inlineData.data) {
            return `data:image/png;base64,${part.inlineData.data}`;
          }
        }
      }
    }

    throw new Error("No image data found in the response.");
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.message && error.message.includes("API Key")) {
      throw error;
    }
    throw new Error(error.message || "Failed to generate landscape.");
  }
};