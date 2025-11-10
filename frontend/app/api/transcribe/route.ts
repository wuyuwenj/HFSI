import { NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import type { TranscriptionEntry } from "@/types";

// Initialize AI client with API key from environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

// Schema definition for structured transcription response
const transcriptionSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      timestamp: {
        type: Type.STRING,
        description: "The start time of the speech segment in HH:MM:SS format.",
      },
      speaker: {
        type: Type.STRING,
        description: "The identified speaker label, e.g., 'Speaker 1', 'Speaker 2', 'Judge', 'Attorney', 'Defendant', etc.",
      },
      dialogue: {
        type: Type.STRING,
        description: "The transcribed text spoken by the speaker in this segment.",
      },
    },
    required: ["timestamp", "speaker", "dialogue"],
  },
};

// Transcribe audio file with speaker diarization
const transcribeAudioWithSpeakers = async (file: File): Promise<TranscriptionEntry[]> => {
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
      text: `Please transcribe the following audio recording with speaker diarization. This is for a legal context, so accuracy is paramount.

      IMPORTANT INSTRUCTIONS:
      - Identify each distinct speaker and label them appropriately
      - If you can identify the role (Judge, Attorney, Prosecutor, Defendant, Witness), use that label
      - Otherwise use 'Speaker 1', 'Speaker 2', etc.
      - For each segment of speech, provide a precise timestamp in HH:MM:SS format
      - Transcribe the dialogue verbatim, including filler words ("um", "uh") and pauses
      - Maintain proper punctuation and capitalization
      - If multiple speakers talk simultaneously, note it as [crosstalk]
      - If audio is unclear, mark as [inaudible]
      - Format the output as a JSON array following the provided schema`,
    };

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [audioPart, textPart],
      config: {
        responseMimeType: "application/json",
        responseSchema: transcriptionSchema,
        temperature: 0.1, // Lower temperature for more accurate transcription
      },
    });

    const jsonText = response.text?.trim() || "";
    if (!jsonText) {
      throw new Error("Empty response from AI");
    }

    try {
      const parsedJson = JSON.parse(jsonText);

      // Validate the response is an array
      if (!Array.isArray(parsedJson)) {
        console.error("AI response is not an array:", parsedJson);
        throw new Error("Expected array of transcription entries");
      }

      // Validate each entry has required fields
      const validEntries = parsedJson.filter(entry =>
        entry &&
        typeof entry.timestamp === 'string' &&
        typeof entry.speaker === 'string' &&
        typeof entry.dialogue === 'string'
      );

      if (validEntries.length === 0) {
        throw new Error("No valid transcription entries found");
      }

      return validEntries as TranscriptionEntry[];
    } catch (parseError) {
      console.error("Failed to parse JSON response:", jsonText.substring(0, 500));
      console.error("Parse error:", parseError);
      throw new Error("The AI returned a response in an unexpected format");
    }
  } catch (error) {
    console.error("Error transcribing audio with speakers:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    if (errorMessage.includes("API key not valid")) {
      throw new Error("Invalid API key configuration");
    }
    throw new Error(`Failed to transcribe audio: ${errorMessage}`);
  }
};

// Format transcription for display
const formatTranscription = (entries: TranscriptionEntry[]): string => {
  let formattedText = "=== AUDIO TRANSCRIPT ===\n\n";

  let currentSpeaker = "";
  entries.forEach((entry) => {
    if (entry.speaker !== currentSpeaker) {
      formattedText += `\n[${entry.timestamp}] ${entry.speaker}:\n`;
      currentSpeaker = entry.speaker;
    }
    formattedText += `${entry.dialogue}\n`;
  });

  formattedText += "\n=== END OF TRANSCRIPT ===";
  return formattedText;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audioFile") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const acceptedAudioTypes = [
      'audio/mpeg', // .mp3
      'audio/wav', // .wav
      'audio/mp4', // .m4a
      'audio/x-m4a', // .m4a
      'audio/webm', // .webm
      'audio/ogg', // .ogg
    ];

    if (!acceptedAudioTypes.includes(audioFile.type)) {
      return NextResponse.json(
        { error: `Unsupported audio format. Accepted formats: MP3, WAV, M4A, WEBM, OGG` },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (audioFile.size > maxSize) {
      return NextResponse.json(
        { error: "Audio file too large. Maximum size is 50MB" },
        { status: 400 }
      );
    }

    console.log(`Transcribing audio file: ${audioFile.name} (${(audioFile.size / 1024 / 1024).toFixed(2)}MB)`);

    // Transcribe the audio with speaker diarization
    const transcriptionEntries = await transcribeAudioWithSpeakers(audioFile);

    // Format the transcription for easy reading
    const formattedTranscript = formatTranscription(transcriptionEntries);

    return NextResponse.json({
      success: true,
      fileName: audioFile.name,
      entries: transcriptionEntries,
      formattedTranscript: formattedTranscript,
      speakerCount: new Set(transcriptionEntries.map(e => e.speaker)).size,
      duration: transcriptionEntries.length > 0
        ? transcriptionEntries[transcriptionEntries.length - 1].timestamp
        : "00:00:00"
    });
  } catch (error) {
    console.error("API Error in /api/transcribe:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint to check if the transcription service is available
export async function GET() {
  return NextResponse.json({
    service: "Audio Transcription with Speaker Diarization",
    status: "active",
    acceptedFormats: ["MP3", "WAV", "M4A", "WEBM", "OGG"],
    maxFileSize: "50MB",
    features: [
      "Speaker identification and labeling",
      "Timestamp marking",
      "Verbatim transcription",
      "Legal context optimization"
    ]
  });
}