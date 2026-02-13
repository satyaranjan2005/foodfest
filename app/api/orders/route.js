import { NextResponse } from 'next/server';
import getDb from '@/lib/db';
import { emitSocketEvent } from '@/lib/socket';

export async function POST(request) {
  try {
    const db = getDb();
    
    const { customerName, phone, items } = await request.json();
    
    // Validation
    if (!customerName || !items || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }
    
    let totalAmount = 0;
    const orderItems = [];
    
    // Validate each item and check availability
    for (const item of items) {
      const foodDoc = await db.collection('foods').doc(item.foodId).get();
      
      if (!foodDoc.exists) {
        return NextResponse.json(
          { success: false, message: `Food item not found: ${item.foodId}` },
          { status: 404 }
        );
      }
      
      const food = { id: foodDoc.id, ...foodDoc.data() };
      
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
        foodId: food.id,
        foodName: food.name,
        quantity: item.quantity,
        price: food.price
      });
    }
    
    // Generate order ID
    const ordersSnapshot = await db.collection('orders').get();
    const orderCount = ordersSnapshot.size;
    const orderId = `FF-${String(orderCount + 1).padStart(3, '0')}`;
    
    // Create order
    const orderData = {
      orderId,
      customerName,
      ...(phone && { phone }),
      items: orderItems,
      totalAmount,
      paymentStatus: 'pending',
      orderStatus: 'placed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const orderRef = await db.collection('orders').add(orderData);
    const order = { id: orderRef.id, ...orderData };
    
    // Emit socket event for real-time update
    emitSocketEvent('new-order', order);
    
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
