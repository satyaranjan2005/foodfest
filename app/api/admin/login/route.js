import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const { password } = await request.json();
    
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Simple password check - in production, use proper authentication
    if (password === ADMIN_PASSWORD) {
      return NextResponse.json({
        success: true,
        message: 'Login successful',
        token: 'admin-authenticated' // Simple token for demo
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }
    
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, message: 'Login failed' },
      { status: 500 }
    );
  }
}
