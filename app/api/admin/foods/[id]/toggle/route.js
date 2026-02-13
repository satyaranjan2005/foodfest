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
    
    const foodRef = db.collection('foods').doc(id);
    const foodDoc = await foodRef.get();
    
    if (!foodDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Food item not found' },
        { status: 404 }
      );
    }
    
    const food = foodDoc.data();
    const newAvailability = !food.isAvailable;
    
    await foodRef.update({
      isAvailable: newAvailability
    });
    
    const updatedFood = { id: foodDoc.id, ...food, isAvailable: newAvailability };
    
    return NextResponse.json({
      success: true,
      message: `Food item ${newAvailability ? 'enabled' : 'disabled'} successfully`,
      data: updatedFood
    });
    
  } catch (error) {
    console.error('Error toggling food availability:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to toggle availability' },
      { status: 500 }
    );
  }
}
