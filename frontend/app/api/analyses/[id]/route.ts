import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET single analysis by ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const analysis = await prisma.analysis.findUnique({
      where: { id: params.id },
      include: {
        keyQuotes: true,
        timelineEvents: true,
        inconsistencies: true,
        evidenceItems: true,
        precedentCases: true,
        criticalAlerts: true,
      },
    });

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(analysis);
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
    await prisma.analysis.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting analysis:', error);
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    );
  }
}
