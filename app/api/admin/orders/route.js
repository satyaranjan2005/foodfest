import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

function checkAuth(request) {
  const authHeader = request.headers.get('authorization');
  return authHeader === 'Bearer admin-authenticated';
}

export async function GET(request) {
  try {
    if (!checkAuth(request)) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    await dbConnect();
    
    const orders = await Order.find({})
      .populate('items.foodId')
      .sort({ createdAt: -1 });
    
    return NextResponse.json({
      success: true,
      data: orders
    });
    
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}
