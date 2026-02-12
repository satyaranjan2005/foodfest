import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import { emitSocketEvent } from '@/lib/socket';

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
    
    const order = await Order.findById(id);
    
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    order.paymentStatus = 'rejected';
    await order.save();
    
    // Emit socket event for real-time update
    emitSocketEvent('order-updated', order);
    
    return NextResponse.json({
      success: true,
      message: 'Payment rejected',
      data: order
    });
    
  } catch (error) {
    console.error('Error rejecting payment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reject payment' },
      { status: 500 }
    );
  }
}
