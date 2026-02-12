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
    
    const food = await Food.findById(id);
    
    if (!food) {
      return NextResponse.json(
        { success: false, message: 'Food item not found' },
        { status: 404 }
      );
    }
    
    food.isAvailable = !food.isAvailable;
    await food.save();
    
    return NextResponse.json({
      success: true,
      message: `Food item ${food.isAvailable ? 'enabled' : 'disabled'} successfully`,
      data: food
    });
    
  } catch (error) {
    console.error('Error toggling food availability:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to toggle availability' },
      { status: 500 }
    );
  }
}
