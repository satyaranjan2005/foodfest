import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function GET() {
  try {
    const db = getDb();
    const foodsRef = db.collection('foods');
    
    const snapshot = await foodsRef.orderBy('createdAt', 'asc').get();
    const foods = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
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
