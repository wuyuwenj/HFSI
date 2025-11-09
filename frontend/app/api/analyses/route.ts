import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET all analyses
export async function GET() {
  try {
    const analyses = await prisma.analysis.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        caseName: true,
        personName: true,
        riskScore: true,
        createdAt: true,
      },
    });

    return NextResponse.json(analyses);
  } catch (error) {
    console.error('Error fetching analyses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    );
  }
}
