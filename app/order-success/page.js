'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function OrderSuccess() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const customerName = searchParams.get('name');
  const totalAmount = searchParams.get('amount');
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 md:p-12 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center animate-bounce">
            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
          Order Placed Successfully!
        </h1>
        
        <p className="text-lg text-gray-600 mb-8">
          Thank you for your order, <span className="font-semibold text-primary">{customerName || 'Customer'}</span>!
        </p>

        {/* Order Details Card */}
        <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-2xl p-6 mb-8">
          <p className="text-sm text-gray-600 mb-2">Order ID</p>
          <h2 className="text-3xl md:text-4xl font-bold text-orange-600 mb-4">{orderId || 'N/A'}</h2>
          
          {totalAmount && (
            <>
              <p className="text-sm text-gray-600 mb-1">Total Amount</p>
              <p className="text-2xl font-bold text-gray-800">₹{totalAmount}</p>
            </>
          )}
        </div>

        {/* Information Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
            </svg>
            What's Next?
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">✓</span>
              <span>Your payment will be verified by our team</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">✓</span>
              <span>Once verified, your order will be prepared</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-600 mr-2 mt-0.5">✓</span>
              <span>You'll be notified when your order is ready</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="btn-primary w-full text-lg py-3"
          >
            Back to Home
          </button>
          
          <p className="text-sm text-gray-500">
            Redirecting to home in <span className="font-bold text-primary">{countdown}</span> seconds...
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact us at <span className="text-primary font-semibold">support@foodfest2026.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
