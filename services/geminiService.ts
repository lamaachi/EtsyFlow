import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ProductIdea, TrendResult } from "../types";

// Initialize Gemini Client
// IMPORTANT: API Key is from process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates structured product ideas based on a niche using JSON schema.
 */
export const generateProductIdeas = async (niche: string): Promise<ProductIdea[]> => {
  const modelId = "gemini-3-flash-preview";
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      ideas: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            targetAudience: { type: Type.STRING },
            priceRange: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            difficulty: { type: Type.STRING, enum: ['Beginner', 'Intermediate', 'Advanced'] },
            format: { type: Type.STRING },
          },
          required: ['title', 'description', 'targetAudience', 'priceRange', 'tags', 'difficulty', 'format'],
        },
      },
    },
    required: ['ideas'],
  };

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Generate 5 unique, profitable digital product ideas for Etsy in the niche: "${niche}". 
      Focus on high-quality, in-demand items. 
      For 'format', suggest specific file types (e.g., 'Editable Canva Link', 'GoodNotes PDF', 'High-Res SVG').
      For 'difficulty', estimate the creation skill level.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: "You are an expert Etsy shop consultant specializing in digital downloads and passive income streams.",
      },
    });

    const json = JSON.parse(response.text || "{\"ideas\": []}");
    return json.ideas || [];
  } catch (error) {
    console.error("Error generating ideas:", error);
    throw error;
  }
};

/**
 * Finds trends using Google Search Grounding.
 */
export const findTrends = async (category: string): Promise<TrendResult[]> => {
  const modelId = "gemini-3-flash-preview";

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `What are the top trending digital product themes or keywords on Etsy right now related to "${category}"? 
      Identify 3 distinct specific trends. 
      Provide a concise description of why it's trending.
      Classify search volume as High, Medium, or Rising.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trends: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  trendName: { type: Type.STRING },
                  description: { type: Type.STRING },
                  searchVolumeLevel: { type: Type.STRING, enum: ['High', 'Medium', 'Rising'] },
                },
                required: ['trendName', 'description', 'searchVolumeLevel'],
              },
            },
          },
        },
      },
    });

    // Extract grounding chunks for citations if available
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const urls = groundingChunks
      .map((chunk) => chunk.web?.uri)
      .filter((uri): uri is string => !!uri); // Filter out undefined

    // Remove duplicates
    const uniqueUrls = Array.from(new Set(urls));

    const json = JSON.parse(response.text || "{\"trends\": []}");
    
    // Attach general grounding URLs to the first item or distribute them (simplified here to attach all to all for reference context)
    // In a real app, you might map specific chunks to specific text parts, but here we just want the sources.
    const results: TrendResult[] = json.trends.map((t: any) => ({
      ...t,
      groundingUrls: uniqueUrls.slice(0, 3) // Just take top 3 distinct sources
    }));

    return results;
  } catch (error) {
    console.error("Error finding trends:", error);
    throw error;
  }
};

/**
 * Generates a product mockup image.
 */
export const generateProductMockup = async (prompt: string): Promise<string> => {
  const modelId = "gemini-2.5-flash-image"; // Optimized for general image gen

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: `Create a professional, aesthetic product mockup for an Etsy listing image.
      Product description: ${prompt}.
      Style: Minimalist, bright, high-resolution, Pinterest-worthy, soft lighting. 
      If it's a planner, show it on an iPad or open book. If it's wall art, show it in a frame in a living room.`,
    });

    // Extract image
    let imageUrl = "";
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }
    
    if (!imageUrl) {
      throw new Error("No image data returned from API");
    }

    return imageUrl;

  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
};
