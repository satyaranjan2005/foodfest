import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Food from '@/models/Food';

export async function POST(request) {
  try {
    await dbConnect();
    
    const { customerName, phone, items } = await request.json();
    
    // Validation
    if (!customerName || !phone || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }
    
    // Validate phone number
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid 10-digit phone number' },
        { status: 400 }
      );
    }
    
    let totalAmount = 0;
    const orderItems = [];
    
    // Validate each item and check availability
    for (const item of items) {
      const food = await Food.findById(item.foodId);
      
      if (!food) {
        return NextResponse.json(
          { success: false, message: `Food item not found: ${item.foodId}` },
          { status: 404 }
        );
      }
      
      if (!food.isAvailable) {
        return NextResponse.json(
          { success: false, message: `${food.name} is currently not available` },
          { status: 400 }
        );
      }
      
      if (item.quantity <= 0) {
        return NextResponse.json(
          { success: false, message: 'Quantity must be greater than 0' },
          { status: 400 }
        );
      }
      
      totalAmount += food.price * item.quantity;
      
      orderItems.push({
        foodId: food._id,
        foodName: food.name,
        quantity: item.quantity,
        price: food.price
      });
    }
    
    // Create order
    const order = new Order({
      customerName,
      phone,
      items: orderItems,
      totalAmount,
      paymentStatus: 'pending',
      orderStatus: 'placed'
    });
    
    await order.save();
    
    return NextResponse.json({
      success: true,
      data: order
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create order' },
      { status: 500 }
    );
  }
}
