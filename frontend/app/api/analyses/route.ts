import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Disable caching for this route
export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const response = NextResponse.json(analyses || []);
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    return response;
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}
