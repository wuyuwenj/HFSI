import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all analyses
export async function GET() {
  try {
    const { data: analyses, error } = await supabase
      .from('Analysis')
      .select('id, caseName, personName, riskScore, createdAt')
      .order('createdAt', { ascending: false });

    if (error) throw error;

    return NextResponse.json(analyses || []);
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}
