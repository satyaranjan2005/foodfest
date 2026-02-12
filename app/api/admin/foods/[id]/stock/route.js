import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Food from '@/models/Food';

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
    
    await dbConnect();
    
    const { id } = params;
    const { stock } = await request.json();
    
    if (stock < 0) {
      return NextResponse.json(
        { success: false, message: 'Stock cannot be negative' },
        { status: 400 }
      );
    }
    
    const food = await Food.findById(id);
    
    if (!food) {
      return NextResponse.json(
        { success: false, message: 'Food item not found' },
        { status: 404 }
      );
    }
    
    food.stock = stock;
    
    // Auto set availability based on stock
    if (stock === 0) {
      food.isAvailable = false;
    }
    
    await food.save();
    
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
