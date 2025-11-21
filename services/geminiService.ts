import { GoogleGenAI, Schema, Type } from "@google/genai";
import { GenerationSettings, AnalysisResult, LandscapeStyle, InteriorStyle, TimeOfDay, Season } from "../types";

const GENERATION_MODEL = 'gemini-2.5-flash-image';
const ANALYSIS_MODEL = 'gemini-2.5-flash';

export const analyzeArchitecture = async (base64Image: string): Promise<AnalysisResult> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key is missing.");

  const ai = new GoogleGenAI({ apiKey });
  
  // Clean base64
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  const prompt = `
    Analyze the provided architectural image.
    1. Identify the architectural style (e.g., Modernism, Art Deco, Brutalist, Gothic, etc.) and provide a brief confidence assessment.
    2. If the image appears to be a white model (clay render) or line drawing, note this.
    3. Create 3 distinct, creative landscape/atmosphere proposals that would complement this specific building.
    
    For each proposal:
    - Suggest a Landscape Style.
    - Suggest a Time of Day.
    - Suggest a Season.
    - Provide a rationale for why this combination works with the architecture.
    
    Return the response in JSON format matching the requested schema.
  `;

  const responseSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      architecturalStyle: { type: Type.STRING, description: "The identified style of the building (e.g. Modern Minimalist)" },
      confidence: { type: Type.STRING, description: "Why you think it is this style" },
      proposals: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING, description: "A catchy title for this mood (e.g. 'Urban Oasis')" },
            rationale: { type: Type.STRING, description: "Why this fits the building" },
            description: { type: Type.STRING, description: "Visual description of the scene" },
            settings: {
              type: Type.OBJECT,
              properties: {
                style: { type: Type.STRING, enum: Object.values(LandscapeStyle) },
                time: { type: Type.STRING, enum: Object.values(TimeOfDay) },
                season: { type: Type.STRING, enum: Object.values(Season) },
                promptEnhancement: { type: Type.STRING, description: "Additional keywords for the prompt" }
              },
              required: ["style", "time", "season", "promptEnhancement"]
            }
          },
          required: ["id", "title", "rationale", "settings", "description"]
        }
      }
    },
    required: ["architecturalStyle", "confidence", "proposals"]
  };

  try {
    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: responseSchema,
        temperature: 0.4 // Lower temperature for more consistent analysis
      }
    });

    if (response.text) {
      const result = JSON.parse(response.text) as AnalysisResult;
      // Inject default sceneType and interiorStyle since the AI analysis is currently landscape-focused
      result.proposals = result.proposals.map(p => ({
        ...p,
        settings: {
          ...p.settings,
          sceneType: 'exterior',
          interiorStyle: InteriorStyle.CREAM // Default fallback
        }
      }));
      return result;
    }
    throw new Error("Failed to parse analysis results");
  } catch (error: any) {
    console.error("Analysis Error:", error);
    throw new Error("Could not analyze image architecture.");
  }
}

export const generateLandscape = async (
  base64Image: string,
  settings: GenerationSettings
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
  
  let taskInstructions = '';

  if (settings.sceneType === 'interior') {
    taskInstructions = `
      TASK:
      Transform this input into a PHOTOREALISTIC INTERIOR ARCHITECTURAL RENDERING.
      1. MATERIALITY: You MUST apply realistic interior materials to the geometry. (e.g. fabric, leather, wood flooring, marble, plaster).
      2. PRESERVATION: Keep the original room geometry, perspective, and camera angle EXACTLY as is.
      3. INTERIOR STYLE: Apply a "${settings.interiorStyle}" interior design style.
      4. FURNITURE & DECOR: If the image is empty, populate it with furniture and decor matching the "${settings.interiorStyle}" style. If furniture exists, render it realistically.
      5. LIGHTING: Simulate natural lighting entering from windows based on "${settings.time}".
    `;
  } else {
    taskInstructions = `
      TASK:
      Transform this input into a PHOTOREALISTIC EXTERIOR ARCHITECTURAL RENDERING.
      1. MATERIALITY: You MUST apply realistic materials to the building geometry. If it looks like a white block, render it as concrete, plaster, glass, or wood depending on the form.
      2. PRESERVATION: Keep the original building geometry, perspective, and camera angle EXACTLY as is.
      3. LANDSCAPE: Generate a "${settings.style}" landscape around it.
      4. ATMOSPHERE: Lighting must match "${settings.time}" in "${settings.season}".
    `;
  }

  const prompt = `
    Act as a world-class architectural visualizer.
    
    INPUT IMAGE ANALYSIS:
    The input is likely a white model (clay render), line drawing, or untextured massing model.
    
    ${taskInstructions}
    
    ADDITIONAL DETAILS:
    Add ${settings.promptEnhancement}.
    
    Make it look like a high-end photograph taken for an architectural magazine (ArchDaily, Dezeen).
  `;

  try {
    const response = await ai.models.generateContent({
      model: GENERATION_MODEL,
      contents: {
        parts: [
          { text: prompt },
          { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
        ],
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
    throw new Error(error.message || "Failed to generate landscape.");
  }
};