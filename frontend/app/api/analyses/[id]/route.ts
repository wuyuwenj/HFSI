import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET single analysis by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Fetch main analysis
    const { data: analysis, error: analysisError } = await supabase
      .from('Analysis')
      .select('*')
      .eq('id', params.id)
      .single();

    if (analysisError || !analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Fetch all related data in parallel
    const [
      { data: keyQuotes },
      { data: timelineEvents },
      { data: inconsistencies },
      { data: evidenceItems },
      { data: precedentCases },
      { data: criticalAlerts }
    ] = await Promise.all([
      supabase.from('KeyQuote').select('*').eq('analysisId', params.id),
      supabase.from('TimelineEvent').select('*').eq('analysisId', params.id),
      supabase.from('Inconsistency').select('*').eq('analysisId', params.id),
      supabase.from('EvidenceItem').select('*').eq('analysisId', params.id),
      supabase.from('PrecedentCase').select('*').eq('analysisId', params.id),
      supabase.from('CriticalAlert').select('*').eq('analysisId', params.id)
    ]);

    // Combine all data
    const fullAnalysis = {
      ...analysis,
      keyQuotes: keyQuotes || [],
      timelineEvents: timelineEvents || [],
      inconsistencies: inconsistencies || [],
      evidenceItems: evidenceItems || [],
      precedentCases: precedentCases || [],
      criticalAlerts: criticalAlerts || []
    };

    return NextResponse.json(fullAnalysis);
  } catch (error) {
    console.error('Error fetching analysis:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

// DELETE analysis by ID
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { error } = await supabase
      .from('Analysis')
      .delete()
      .eq('id', params.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    );
  }
}
