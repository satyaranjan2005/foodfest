import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  return authHeader === 'Bearer admin-authenticated';
}

export async function PATCH(request, { params }) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const db = getDb();
    const { id } = params;
    const { stock } = await request.json();
    
    if (stock < 0) {
      return NextResponse.json(
        { success: false, message: 'Stock cannot be negative' },
        { status: 400 }
      );
    }
    
    const foodRef = db.collection('foods').doc(id);
    const foodDoc = await foodRef.get();
    
    if (!foodDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Food item not found' },
        { status: 404 }
      );
    }
    
    const updateData = { stock };
    
    // Auto set availability based on stock
    if (stock === 0) {
      updateData.isAvailable = false;
    }
    
    await foodRef.update(updateData);
    
    const updatedFoodDoc = await foodRef.get();
    const food = { id: updatedFoodDoc.id, ...updatedFoodDoc.data() };
    
    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully',
      data: food
    });
    
  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update stock' },
      { status: 500 }
    );
  }
}
