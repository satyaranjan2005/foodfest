import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Food from '@/models/Food';

export async function GET() {
  try {
    await dbConnect();
    
    const foods = await Food.find({}).sort({ createdAt: 1 });
    
    return NextResponse.json({
      success: true,
      data: foods
    });
  } catch (error) {
    console.error('Error fetching foods:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch foods' },
      { status: 500 }
    );
  }
}
