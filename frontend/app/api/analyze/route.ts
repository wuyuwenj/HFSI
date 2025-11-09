import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import type { CaseAnalysis } from "@/types";
import { supabase } from "@/lib/supabase";

// Initialize AI client with API key from environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Schema definition for structured AI response
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description:
        "A concise summary of the entire case based on the provided documents.",
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
          date: {
            type: Type.STRING,
            description: "Date of the event (e.g., YYYY-MM-DD)",
          },
          event: {
            type: Type.STRING,
            description: "Description of the event.",
          },
          confidence: {
            type: Type.NUMBER,
            description: "Confidence score (0-1) of the event's accuracy.",
          },
        },
        required: ["date", "event", "confidence"],
      },
    },
    inconsistencies: {
      type: Type.ARRAY,
      description:
        "Contradictions found between different documents or statements.",
      items: {
        type: Type.OBJECT,
        properties: {
          statement1: { type: Type.STRING },
          source1: {
            type: Type.STRING,
            description:
              "Source of the first statement (e.g., 'Witness A testimony').",
          },
          statement2: { type: Type.STRING },
          source2: {
            type: Type.STRING,
            description:
              "Source of the second statement (e.g., 'Police Report').",
          },
          analysis: {
            type: Type.STRING,
            description: "Analysis of the contradiction.",
          },
        },
        required: [
          "statement1",
          "source1",
          "statement2",
          "source2",
          "analysis",
        ],
      },
    },
    evidenceMatrix: {
      type: Type.ARRAY,
      description: "A matrix ranking the reliability of key evidence.",
      items: {
        type: Type.OBJECT,
        properties: {
          evidence: { type: Type.STRING },
          type: {
            type: Type.STRING,
            description:
              "Type of evidence (e.g., Forensic, Eyewitness, Documentary).",
          },
          reliability: {
            type: Type.STRING,
            enum: ["High", "Medium", "Low", "Unverified"],
          },
          notes: {
            type: Type.STRING,
            description: "Brief notes on why this reliability was assigned.",
          },
        },
        required: ["evidence", "type", "reliability", "notes"],
      },
    },
    riskScore: {
      type: Type.NUMBER,
      description:
        "A score from 0 to 100 quantifying the likelihood of innocence based on all factors. Higher score = higher likelihood of innocence.",
    },
    precedentCases: {
      type: Type.ARRAY,
      description:
        "A list of similar past cases and their outcomes for comparison.",
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
    "summary",
    "personName",
    "crimeConvicted",
    "innocenceClaim",
    "paroleBoardFocus",
    "keyQuotes",
    "criticalAlerts",
    "timelineEvents",
    "inconsistencies",
    "evidenceMatrix",
    "riskScore",
    "precedentCases",
  ],
};

// Transcribe audio files using Gemini AI
const transcribeAudioFile = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");

    const audioPart = {
      inlineData: {
        data: base64,
        mimeType: file.type,
      },
    };

    const textPart = {
      text: `Please transcribe the following audio recording. This is for a legal context, so accuracy is paramount.
- Identify each distinct speaker and label them sequentially (e.g., 'Speaker 1', 'Speaker 2').
- For each segment of speech, provide a precise timestamp in HH:MM:SS format indicating when the speaker begins talking.
- Transcribe the dialogue verbatim, including any filler words or pauses if possible.
- Format the output as a readable transcript with timestamps and speaker labels.`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [audioPart, textPart],
      config: {
        temperature: 0.1,
      },
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("Error transcribing audio:", error);
    throw new Error(`Failed to transcribe audio file: ${file.name}`);
  }
};

// Detect if documents contain multiple people/cases
const detectMultiplePeople = async (
  documents: string,
  pdfFiles: File[],
  audioFiles: File[]
): Promise<{ multiplePeople: boolean; people: Array<{ name: string; fileIndices: number[] }> }> => {
  try {
    const promptText = `
      Analyze the provided documents and determine if they contain information about ONE person or MULTIPLE different people/cases.

      If there are MULTIPLE people:
      - List each person's name
      - Indicate which files belong to each person (by index)

      If there is only ONE person:
      - Return multiplePeople: false
    `;

    const contents: any[] = [{ text: promptText }];

    // Add text documents
    if (documents && documents.trim()) {
      contents.push({
        text: `\n---TEXT DOCUMENTS---\n${documents}\n---`,
      });
    }

    // Add all files for analysis
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

    const detectionSchema = {
      type: Type.OBJECT,
      properties: {
        multiplePeople: {
          type: Type.BOOLEAN,
          description: "Whether multiple different people/cases were detected",
        },
        people: {
          type: Type.ARRAY,
          description: "List of people and their associated file indices (empty if only one person)",
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: detectionSchema,
      },
    });

    const jsonText = response.text?.trim() || "";
    if (!jsonText) {
      throw new Error("Empty response from AI");
    }

    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error detecting multiple people:", error);
    // If detection fails, assume single person
    return { multiplePeople: false, people: [] };
  }
};

// Analyze case documents using Gemini AI
const analyzeCaseDocuments = async (
  documents: string,
  pdfFiles: File[],
  audioFiles: File[]
): Promise<CaseAnalysis> => {
  try {
    const promptText = `
      You are **VeriJudex**, an AI-powered judicial assistant specializing in case document analysis. Your primary function is to evaluate transcripts and evidence to determine the strength of the case against the defendant, operating under the strictest legal standards.

      Your analysis must adhere to the following **Core Legal Principles**:
      1.  **Burden of Proof Standard (100% Certainty for Conviction):** The defendant can only be convicted if there is **100% certainty of guilt** (beyond a reasonable doubt). Any doubt, uncertainty, or gap in evidence **must benefit the defendant**. Testimony that "might be true" or "could be true" but cannot be proven with certainty **cannot be used for conviction**.
      2.  **Presumption of Innocence:** Every finding must be filtered through the lens that the defendant is presumed innocent.
      3.  **Testimony Credibility Framework:**
          * **Prosecution Witnesses:** If the testimony becomes **unclear, compromised, or inconsistent** during cross-examination by the Defense Attorney, the witness's **credibility is compromised**, and their evidence must be weighted as **Low Reliability**.
          * **Defense Witnesses:** Testimony must be taken at **face value UNLESS proven false or non-credible** by the District Attorney during cross-examination.

      Your task is to analyze the provided case documents and generate a structured, comprehensive, and unbiased analysis formatted **strictly as a single JSON object. The final **riskScore** (Innocence Score) must directly reflect the cumulative weight of the flaws and the number of instances where evidence falls short of the **100% certainty** standard. Higher score = higher likelihood of innocence (0 = clearly guilty, 100 = clearly innocent).

      ${documents ? `\n---TEXT DOCUMENTS---\n${documents}\n---` : ''}

      **DETAILED DETECTION CRITERIA FOCUS:**
      * **Testimonial Inconsistencies:** Search for contradictions *within* a single witness statement and *between* different witness statements.
      * **Coercion Markers:** Identify language indicating forced confession or duress, specifically: **"i didn't do this"** or **"I am covering for someone else."** Log these in both criticalAlerts and inconsistencies.
      * **Procedural Irregularities:** Note instances of improper evidence handling (chain of custody) or rights violations (e.g., Miranda).
      * **Alibi Evidence:** Document any mention of unexamined alibis or witnesses in the evidenceMatrix as 'Unverified'.
      * **Expert Testimony Issues:** Flag reliance on outdated or contested forensic methods.
      * **Witness Credibility Problems:** Note signs of unreliable eyewitness identification (e.g., poor viewing conditions, suggestive procedures).
      * **Logical Conflicts:** Pay attention to discrepancies in **time logs** and movements across different testimonials and log these in timelineEvents and inconsistencies.
    `;

    // Build contents array with text and PDFs
    const contents: any[] = [{ text: promptText }];

    // Transcribe audio files first if provided
    if (audioFiles.length > 0) {
      for (const audioFile of audioFiles) {
        console.log(`Transcribing audio file: ${audioFile.name}`);
        const transcript = await transcribeAudioFile(audioFile);
        contents.push({
          text: `\n--- AUDIO TRANSCRIPT: ${audioFile.name} ---\n${transcript}\n---\n`,
        });
      }
    }

    // Add uploaded files if provided
    if (pdfFiles.length > 0) {
      for (const file of pdfFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString("base64");

        // Handle different file types
        let mimeType = file.type;

        // For text files, convert to text and add directly
        if (file.type === 'text/plain') {
          const text = await file.text();
          contents.push({
            text: `\n--- File: ${file.name} ---\n${text}\n---\n`,
          });
        } else {
          // For PDFs and DOCX, send as inline data
          contents.push({
            inlineData: {
              mimeType: mimeType,
              data: base64,
            },
          });
        }
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash", // Using flash for PDF support
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const jsonText = response.text?.trim() || "";
    if (!jsonText) {
      throw new Error("Empty response from AI");
    }
    return JSON.parse(jsonText) as CaseAnalysis;
  } catch (error) {
    console.error("Error analyzing documents:", error);
    throw new Error(
      "Failed to get analysis from AI. Please check the input and try again."
    );
  }
};

// Save analysis to database
const saveAnalysisToDatabase = async (caseName: string, analysis: CaseAnalysis) => {
  try {
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
  } catch (error) {
    console.error("Error saving analysis to database:", error);
    throw new Error("Failed to save analysis to database");
  }
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const documents = formData.get("documents") as string || "";
    const pdfFiles = formData.getAll("pdfFiles") as File[];
    const audioFiles = formData.getAll("audioFiles") as File[];

    // Validate that we have either text, files, or audio
    if ((!documents || documents.trim() === "") && pdfFiles.length === 0 && audioFiles.length === 0) {
      return NextResponse.json(
        { error: 'Please provide either text documents, files, or audio to analyze.' },
        { status: 400 }
      );
    }

    // Detect if we have multiple people in the uploaded files
    const detection = await detectMultiplePeople(documents, pdfFiles, audioFiles);

    if (detection.multiplePeople && detection.people.length > 1) {
      // Multiple people detected - analyze each separately
      console.log(`Detected ${detection.people.length} different people, analyzing separately...`);

      const savedAnalyses = [];

      for (const person of detection.people) {
        console.log(`Analyzing case for: ${person.name}`);

        // Filter files for this person
        const personFiles = person.fileIndices.map(idx => pdfFiles[idx]).filter(f => f !== undefined);

        // Analyze this person's documents
        const analysis = await analyzeCaseDocuments("", personFiles, []);

        // Save to database
        const savedAnalysis = await saveAnalysisToDatabase(person.name, analysis);
        savedAnalyses.push(savedAnalysis);
      }

      // Return bulk results with database IDs
      return NextResponse.json({
        bulk: true,
        count: savedAnalyses.length,
        analyses: savedAnalyses.map(a => ({
          id: a.id,
          caseName: a.caseName,
          riskScore: a.riskScore,
        })),
      });
    } else {
      // Single person - analyze normally
      const analysisResult = await analyzeCaseDocuments(documents, pdfFiles, audioFiles);

      // Save to database
      const savedAnalysis = await saveAnalysisToDatabase(
        analysisResult.personName || 'Unknown Case',
        analysisResult
      );

      return NextResponse.json({
        bulk: false,
        id: savedAnalysis.id,
        caseName: savedAnalysis.caseName,
        riskScore: savedAnalysis.riskScore,
      });
    }
  } catch (error) {
    console.error("API Error in /api/analyze:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "An unknown server error occurred.";
    return NextResponse.json(
      { error: `Failed to analyze documents: ${errorMessage}` },
      { status: 500 }
    );
  }
}
