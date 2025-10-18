
import { GoogleGenAI, Type } from "@google/genai";
import type { ScannedBillData } from '../types';

const fileToGenerativePart = (base64Data: string, mimeType: string) => {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
};

export const scanBill = async (
  imageBase64: string,
  mimeType: string
): Promise<ScannedBillData | null> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = fileToGenerativePart(imageBase64, mimeType);
  const prompt = `Analyze this bill/receipt. Extract the total amount, the date (in YYYY-MM-DD format), a list of items with their names and prices, and suggest a category from this list: Groceries, Utilities, Transport, Entertainment, Dining, Shopping, Health, Other. If the date is not present, use today's date.`;

  const billSchema = {
    type: Type.OBJECT,
    properties: {
      totalAmount: {
        type: Type.NUMBER,
        description: "The final total amount on the bill.",
      },
      date: {
        type: Type.STRING,
        description: "The date of the transaction in YYYY-MM-DD format.",
      },
      items: {
        type: Type.ARRAY,
        description: "A list of items purchased.",
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Name of the item." },
            price: { type: Type.NUMBER, description: "Price of the item." },
          },
        },
      },
      category: {
        type: Type.STRING,
        description: "A suggested category for the expense."
      }
    },
    required: ["totalAmount", "date", "items", "category"],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: billSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedData = JSON.parse(jsonText);

    // Basic validation
    if (parsedData && typeof parsedData.totalAmount === 'number' && typeof parsedData.date === 'string') {
        return parsedData as ScannedBillData;
    }
    return null;

  } catch (error) {
    console.error("Error scanning bill with Gemini:", error);
    return null;
  }
};
