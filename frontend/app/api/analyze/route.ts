import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from "@google/genai";
import type { CaseAnalysis } from '@/types';

// Initialize AI client with API key from environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Schema definition for structured AI response
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: { type: Type.STRING, description: "A concise summary of the entire case based on the provided documents." },
    criticalAlerts: {
      type: Type.ARRAY,
      description: "A list of high-priority inconsistencies and evidence gaps.",
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["High", "Medium", "Low"] },
        },
        required: ["title", "description", "severity"],
      },
    },
    timelineEvents: {
      type: Type.ARRAY,
      description: "A chronological timeline of key events from the documents.",
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "Date of the event (e.g., YYYY-MM-DD)" },
          event: { type: Type.STRING, description: "Description of the event." },
          confidence: { type: Type.NUMBER, description: "Confidence score (0-1) of the event's accuracy." },
        },
        required: ["date", "event", "confidence"],
      },
    },
    inconsistencies: {
      type: Type.ARRAY,
      description: "Contradictions found between different documents or statements.",
      items: {
        type: Type.OBJECT,
        properties: {
          statement1: { type: Type.STRING },
          source1: { type: Type.STRING, description: "Source of the first statement (e.g., 'Witness A testimony')." },
          statement2: { type: Type.STRING },
          source2: { type: Type.STRING, description: "Source of the second statement (e.g., 'Police Report')." },
          analysis: { type: Type.STRING, description: "Analysis of the contradiction." },
        },
        required: ["statement1", "source1", "statement2", "source2", "analysis"],
      },
    },
    evidenceMatrix: {
      type: Type.ARRAY,
      description: "A matrix ranking the reliability of key evidence.",
      items: {
        type: Type.OBJECT,
        properties: {
          evidence: { type: Type.STRING },
          type: { type: Type.STRING, description: "Type of evidence (e.g., Forensic, Eyewitness, Documentary)." },
          reliability: { type: Type.STRING, enum: ["High", "Medium", "Low", "Unverified"] },
          notes: { type: Type.STRING, description: "Brief notes on why this reliability was assigned." },
        },
        required: ["evidence", "type", "reliability", "notes"],
      },
    },
    riskScore: {
      type: Type.NUMBER,
      description: "A score from 0 to 100 quantifying the risk of wrongful conviction based on all factors.",
    },
    precedentCases: {
      type: Type.ARRAY,
      description: "A list of similar past cases and their outcomes for comparison.",
      items: {
        type: Type.OBJECT,
        properties: {
          caseName: { type: Type.STRING },
          summary: { type: Type.STRING },
          outcome: { type: Type.STRING },
        },
        required: ["caseName", "summary", "outcome"],
      },
    },
  },
  required: ["summary", "criticalAlerts", "timelineEvents", "inconsistencies", "evidenceMatrix", "riskScore", "precedentCases"],
};

// Analyze case documents using Gemini AI
const analyzeCaseDocuments = async (documents: string): Promise<CaseAnalysis> => {
  try {
    const prompt = `
      You are VeriJudex, an AI-powered judicial assistant. Your task is to analyze the following case documents and provide a structured, comprehensive, and unbiased analysis.
      Based on the documents provided below, generate a JSON object that adheres to the defined schema.
      Focus on identifying inconsistencies, constructing a timeline, evaluating evidence, scoring risk, and finding relevant precedents.

      Case Documents:
      ---
      ${documents}
      ---
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text?.trim() || '';
    if (!jsonText) {
      throw new Error("Empty response from AI");
    }
    return JSON.parse(jsonText) as CaseAnalysis;
  } catch (error) {
    console.error("Error analyzing documents:", error);
    throw new Error("Failed to get analysis from AI. Please check the input and try again.");
  }
};

export async function POST(request: Request) {
  try {
    const { documents } = await request.json();

    if (!documents || typeof documents !== 'string' || documents.trim() === '') {
      return NextResponse.json({ error: 'Invalid input: "documents" must be a non-empty string.' }, { status: 400 });
    }

    const analysisResult = await analyzeCaseDocuments(documents);
    return NextResponse.json(analysisResult);

  } catch (error) {
    console.error("API Error in /api/analyze:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred.";
    return NextResponse.json({ error: `Failed to analyze documents: ${errorMessage}` }, { status: 500 });
  }
}
