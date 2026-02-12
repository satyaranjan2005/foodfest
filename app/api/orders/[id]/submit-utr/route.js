import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';

export async function POST(request, { params }) {
  try {
    await dbConnect();
    
    const { id } = params;
    const { utrNumber } = await request.json();
    
    if (!utrNumber || !utrNumber.trim()) {
      return NextResponse.json(
        { success: false, message: 'Please provide UTR number' },
        { status: 400 }
      );
    }
    
    // Check if UTR already exists
    const existingOrder = await Order.findOne({ utrNumber: utrNumber.trim() });
    if (existingOrder) {
      return NextResponse.json(
        { success: false, message: 'This UTR number has already been submitted' },
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
    
    order.utrNumber = utrNumber.trim();
    order.paymentStatus = 'pending_verification';
    
    await order.save();
    
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
