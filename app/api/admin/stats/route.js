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
    
    const totalOrders = await Order.countDocuments();
    const acceptedOrders = await Order.countDocuments({ orderStatus: 'accepted' });
    const completedOrders = await Order.countDocuments({ orderStatus: 'completed' });
    
    // Calculate total revenue from paid orders
    const paidOrders = await Order.find({ paymentStatus: 'paid' });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    
    return NextResponse.json({
      success: true,
      data: {
        totalOrders,
        acceptedOrders,
        completedOrders,
        totalRevenue
      }
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}
