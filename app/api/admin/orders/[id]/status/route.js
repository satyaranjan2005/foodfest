import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

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
    const { status } = await request.json();
    
    if (!['placed', 'accepted', 'completed'].includes(status)) {
      return NextResponse.json(
        { success: false, message: 'Invalid status' },
        { status: 400 }
      );
    }
    
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    order.orderStatus = status;
    await order.save();
    
    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully',
      data: order
    });
    
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
