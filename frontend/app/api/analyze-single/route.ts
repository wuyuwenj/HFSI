import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import type { CaseAnalysis } from "@/types";
import { supabase } from "@/lib/supabase";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Import the analysis schema and functions from analyze route
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A concise summary of the entire case based on the provided documents.",
    },
    personName: {
      type: Type.STRING,
      description: "The name of the person/defendant in this case.",
    },
    crimeConvicted: {
      type: Type.STRING,
      description: "The crime(s) they were convicted of.",
    },
    innocenceClaim: {
      type: Type.STRING,
      description: "What they said about their innocence, their claims or statements.",
    },
    paroleBoardFocus: {
      type: Type.STRING,
      description: "What the parole board focused on during their review.",
    },
    keyQuotes: {
      type: Type.ARRAY,
      description: "Important quotes from the documents with their line numbers and context.",
      items: {
        type: Type.OBJECT,
        properties: {
          quote: { type: Type.STRING, description: "The exact quote from the document" },
          lineNumber: { type: Type.STRING, description: "Line number or page reference where the quote appears" },
          context: { type: Type.STRING, description: "Brief context about who said this and when" },
        },
        required: ["quote", "lineNumber", "context"],
      },
    },
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
      description: "A score from 0 to 100 quantifying the likelihood of innocence based on all factors. Higher score = higher likelihood of innocence.",
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
  required: [
    "summary", "personName", "crimeConvicted", "innocenceClaim", "paroleBoardFocus", "keyQuotes",
    "criticalAlerts", "timelineEvents", "inconsistencies", "evidenceMatrix", "riskScore", "precedentCases",
  ],
};

const saveAnalysisToDatabase = async (caseName: string, analysis: CaseAnalysis) => {
  // Insert main analysis record
  const { data: savedAnalysis, error: analysisError } = await supabase
    .from('Analysis')
    .insert({
      caseName,
      personName: analysis.personName,
      crimeConvicted: analysis.crimeConvicted,
      innocenceClaim: analysis.innocenceClaim,
      paroleBoardFocus: analysis.paroleBoardFocus,
      summary: analysis.summary,
      riskScore: analysis.riskScore,
    })
    .select()
    .single();

  if (analysisError || !savedAnalysis) {
    throw new Error('Failed to save analysis');
  }

  const analysisId = savedAnalysis.id;

  // Insert all related records in parallel
  await Promise.all([
    supabase.from('KeyQuote').insert(
      analysis.keyQuotes.map(q => ({ analysisId, quote: q.quote, lineNumber: q.lineNumber, context: q.context }))
    ),
    supabase.from('TimelineEvent').insert(
      analysis.timelineEvents.map(e => ({ analysisId, date: e.date, event: e.event, confidence: e.confidence }))
    ),
    supabase.from('Inconsistency').insert(
      analysis.inconsistencies.map(i => ({ analysisId, statement1: i.statement1, source1: i.source1, statement2: i.statement2, source2: i.source2, analysis: i.analysis }))
    ),
    supabase.from('EvidenceItem').insert(
      analysis.evidenceMatrix.map(e => ({ analysisId, evidence: e.evidence, type: e.type, reliability: e.reliability, notes: e.notes }))
    ),
    supabase.from('PrecedentCase').insert(
      analysis.precedentCases.map(p => ({ analysisId, caseName: p.caseName, summary: p.summary, outcome: p.outcome }))
    ),
    supabase.from('CriticalAlert').insert(
      analysis.criticalAlerts.map(a => ({ analysisId, title: a.title, description: a.description, severity: a.severity }))
    ),
  ]);

  return savedAnalysis;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const documents = formData.get("documents") as string || "";
    const pdfFiles = formData.getAll("pdfFiles") as File[];
    const audioFiles = formData.getAll("audioFiles") as File[];

    const promptText = `
      You are **VeriJudex**, an AI-powered judicial assistant specializing in case document analysis...
      [Same prompt as in analyze route]
    `;

    const contents: any[] = [{ text: promptText }];

    // Add text documents
    if (documents && documents.trim()) {
      contents.push({ text: `\n---TEXT DOCUMENTS---\n${documents}\n---` });
    }

    // Add audio transcripts
    if (audioFiles.length > 0) {
      for (const audioFile of audioFiles) {
        // Simplified - in production you'd call transcribeAudioFile
        contents.push({ text: `\n--- AUDIO FILE: ${audioFile.name} (transcription would go here) ---\n` });
      }
    }

    // Add PDF files
    if (pdfFiles.length > 0) {
      for (const file of pdfFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        if (file.type === 'text/plain') {
          const text = await file.text();
          contents.push({ text: `\n--- File: ${file.name} ---\n${text}\n---\n` });
        } else {
          contents.push({ inlineData: { mimeType: file.type, data: base64 } });
        }
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const analysisResult = JSON.parse(response.text?.trim() || "{}") as CaseAnalysis;

    // Save to database
    const savedAnalysis = await saveAnalysisToDatabase(
      analysisResult.personName || 'Unknown Case',
      analysisResult
    );

    return NextResponse.json({
      id: savedAnalysis.id,
      caseName: savedAnalysis.caseName,
      riskScore: savedAnalysis.riskScore,
    });
  } catch (error) {
    console.error("Error analyzing single case:", error);
    return NextResponse.json(
      { error: "Failed to analyze case" },
      { status: 500 }
    );
  }
}
