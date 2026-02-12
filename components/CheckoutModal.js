'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

export default function CheckoutModal({ cart, foods, totalAmount, onClose, onSuccess }) {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Success
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [paymentRedirected, setPaymentRedirected] = useState(false);

  const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || 'yourname@paytm';

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    
    if (!customerName.trim()) {
      toast.error('Please enter your name');
      return;
    }
    
    if (!/^[6-9]\d{9}$/.test(phone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);

    try {
      const items = Object.entries(cart).map(([foodId, quantity]) => ({
        foodId,
        quantity
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          items
        })
      });

      const data = await res.json();

      if (data.success) {
        setOrderDetails(data.data);
        toast.success('Order created successfully!');
        setStep(2);
      } else {
        toast.error(data.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentRedirect = () => {
    const upiLink = `upi://pay?pa=${UPI_ID}&pn=FoodFest2026&am=${totalAmount}&cu=INR&tn=${orderDetails?.orderId || 'Order'}`;
    
    // Open UPI app
    window.location.href = upiLink;
    setPaymentRedirected(true);
    
    // Show success screen after 10 seconds
    setTimeout(() => {
      setStep(3);
      toast.success('Order placed successfully!');
    }, 10000);
  };



  const getCartItems = () => {
    return Object.entries(cart).map(([foodId, quantity]) => {
      const food = foods.find(f => f._id === foodId);
      return { food, quantity };
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 1 && 'Checkout'}
            {step === 2 && 'Payment'}
            {step === 3 && 'Success'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Step 1: Customer Details */}
          {step === 1 && (
            <form onSubmit={handleSubmitOrder} className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3">Order Summary</h3>
                <div className="space-y-2 mb-4">
                  {getCartItems().map(({ food, quantity }) => (
                    <div key={food._id} className="flex justify-between text-sm">
                      <span>{food.name} × {quantity}</span>
                      <span className="font-semibold">₹{food.price * quantity}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Full Name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="input-field"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field"
                  placeholder="10-digit phone number"
                  pattern="[6-9]\d{9}"
                  maxLength="10"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full"
              >
                {loading ? 'Processing...' : 'Proceed to Pay'}
              </button>
            </form>
          )}

          {/* Step 2: Payment */}
          {step === 2 && orderDetails && (
            <div className="space-y-6 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">Order Created Successfully!</p>
                <p className="text-2xl font-bold text-green-900 mt-2">{orderDetails.orderId}</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">Pay ₹{totalAmount} via UPI</h3>
                
                <div className="flex justify-center mb-4">
                  <QRCodeSVG
                    value={`upi://pay?pa=${UPI_ID}&pn=FoodFest2026&am=${totalAmount}&cu=INR&tn=${orderDetails.orderId}`}
                    size={200}
                  />
                </div>

                <p className="text-sm text-gray-600 mb-2">Scan QR code or</p>
                <p className="font-mono font-semibold text-primary">{UPI_ID}</p>
              </div>

              <button
                onClick={handlePaymentRedirect}
                disabled={paymentRedirected}
                className="btn-primary w-full"
              >
                {paymentRedirected ? 'Processing...' : 'Open UPI App to Pay'}
              </button>

              {paymentRedirected && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-800 font-semibold">
                    Please complete the payment in your UPI app...
                  </p>
                </div>
              )}

              {!paymentRedirected && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-800">
                      After completing the payment, your order will be processed by our team.
                    </p>
                  </div>

                  <button
                    onClick={onSuccess}
                    className="btn-secondary w-full"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && orderDetails && (
            <div className="space-y-6 text-center">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 font-semibold">Order Created Successfully!</p>
                <p className="text-2xl font-bold text-green-900 mt-2">{orderDetails.orderId}</p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
                <h3 className="font-bold text-lg mb-4">Pay ₹{totalAmount} via UPI</h3>
                
                <div className="flex justify-center mb-4">
                  <QRCodeSVG
                    value={`upi://pay?pa=${UPI_ID}&pn=FoodFest2026&am=${totalAmount}&cu=INR&tn=${orderDetails.orderId}`}
                    size={200}
                  />
                </div>

                <p className="text-sm text-gray-600 mb-2">Scan QR code or</p>
                <p className="font-mono font-semibold text-primary">{UPI_ID}</p>
              </div>

              <button
                onClick={handlePaymentRedirect}
                disabled={paymentRedirected}
                className="btn-primary w-full"
              >
                {paymentRedirected ? 'Processing...' : 'Open UPI App to Pay'}
              </button>

              {paymentRedirected && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-sm text-yellow-800 font-semibold">
                    Please complete the payment in your UPI app...
                  </p>
                </div>
              )}

              {!paymentRedirected && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-800">
                      After completing the payment, your order will be processed by our team.
                    </p>
                  </div>

                  <button
                    onClick={onSuccess}
                    className="btn-secondary w-full"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          )}

          {/* Step 3: Success Screen */}
          {step === 3 && orderDetails && (
            <div className="space-y-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">Order Placed Successfully!</h3>
                <p className="text-gray-600">Your order has been received</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Order ID</p>
                <p className="text-2xl font-bold text-green-900">{orderDetails.orderId}</p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  Your order will be prepared once the payment is verified by our team.
                  Thank you for choosing FoodFest 2026!
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-600">Order Details:</p>
                <div className="bg-gray-50 rounded-lg p-4 text-left">
                  {getCartItems().map(({ food, quantity }) => (
                    <div key={food._id} className="flex justify-between text-sm mb-2">
                      <span>{food.name} × {quantity}</span>
                      <span className="font-semibold">₹{food.price * quantity}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total Paid</span>
                    <span className="text-primary">₹{totalAmount}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={onSuccess}
                className="btn-primary w-full"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
