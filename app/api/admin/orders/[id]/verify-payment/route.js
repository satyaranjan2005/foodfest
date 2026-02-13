import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
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
    
    const db = getDb();
    const { id } = params;
    
    const orderRef = db.collection('orders').doc(id);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    await orderRef.update({
      paymentStatus: 'paid',
      updatedAt: new Date().toISOString()
    });
    
    const updatedOrderDoc = await orderRef.get();
    const order = { id: updatedOrderDoc.id, ...updatedOrderDoc.data() };
    
    // Emit socket event for real-time update
    emitSocketEvent('order-updated', order);
    
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      data: order
    });
    
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
