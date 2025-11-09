import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET all analyses
export async function GET() {
  try {
    const { data: analyses, error, count } = await supabase
      .from('Analysis')
      .select('id, caseName, personName, riskScore, createdAt', { count: 'exact' })
      .order('createdAt', { ascending: false });

    if (error) {
      console.error('Supabase error fetching analyses:', error);
      throw error;
    }

    console.log(`Fetched ${analyses?.length || 0} analyses from database (total count: ${count})`);
    console.log('Analysis IDs:', analyses?.map(a => a.id));
    return NextResponse.json(analyses || []);
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}
