import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const documents = formData.get("documents") as string || "";
    const pdfFiles = formData.getAll("pdfFiles") as File[];

    // Detection schema
    const detectionSchema = {
      type: Type.OBJECT,
      properties: {
        multiplePeople: {
          type: Type.BOOLEAN,
          description: "Whether multiple different people/cases were detected",
        },
        people: {
          type: Type.ARRAY,
          description: "List of people and their associated file indices",
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "The person's name" },
              fileIndices: {
                type: Type.ARRAY,
                items: { type: Type.NUMBER },
                description: "Array of file indices (0-based) that belong to this person",
              },
            },
            required: ["name", "fileIndices"],
          },
        },
      },
      required: ["multiplePeople", "people"],
    };

    const promptText = `
      Analyze the provided documents and determine if they contain information about ONE person or MULTIPLE different people/cases.

      If there are MULTIPLE people:
      - List each person's name
      - Indicate which files belong to each person (by index)

      If there is only ONE person:
      - Return multiplePeople: false
    `;

    const contents: any[] = [{ text: promptText }];

    if (documents && documents.trim()) {
      contents.push({
        text: `\n---TEXT DOCUMENTS---\n${documents}\n---`,
      });
    }

    if (pdfFiles.length > 0) {
      for (let i = 0; i < pdfFiles.length; i++) {
        const file = pdfFiles[i];
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        if (file.type === 'text/plain') {
          const text = await file.text();
          contents.push({
            text: `\n--- File ${i}: ${file.name} ---\n${text}\n---\n`,
          });
        } else {
          contents.push({
            text: `\n--- File ${i}: ${file.name} ---\n`,
          });
          contents.push({
            inlineData: {
              mimeType: file.type,
              data: base64,
            },
          });
        }
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: detectionSchema,
      },
    });

    const jsonText = response.text?.trim() || "";
    const result = JSON.parse(jsonText);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error detecting people:", error);
    return NextResponse.json(
      { error: "Failed to detect people in documents" },
      { status: 500 }
    );
  }
}
