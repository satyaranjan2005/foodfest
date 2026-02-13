import { NextResponse } from 'next/server';
import getDb from '@/lib/db';

export async function POST(request, { params }) {
  try {
    const db = getDb();
    const { id } = params;
    const { utrNumber } = await request.json();
    
    if (!utrNumber || !utrNumber.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please provide UTR number' },
        { status: 400 }
      );
    }
    
    // Check if UTR already exists
    const existingOrdersSnapshot = await db.collection('orders')
      .where('utrNumber', '==', utrNumber.trim())
      .get();
    
    if (!existingOrdersSnapshot.empty) {
      return NextResponse.json(
        { success: false, message: 'This UTR number has already been submitted' },
        { status: 400 }
      );
    }
    
    const orderRef = db.collection('orders').doc(id);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }
    
    await orderRef.update({
      utrNumber: utrNumber.trim(),
      paymentStatus: 'pending_verification',
      updatedAt: new Date().toISOString()
    });
    
    const updatedOrderDoc = await orderRef.get();
    const order = { id: updatedOrderDoc.id, ...updatedOrderDoc.data() };
    
    return NextResponse.json({
      success: true,
      message: 'UTR submitted successfully. Admin will verify your payment shortly.',
      data: order
    });
    
  } catch (error) {
    console.error('Error submitting UTR:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit UTR' },
      { status: 500 }
    );
  }
}
