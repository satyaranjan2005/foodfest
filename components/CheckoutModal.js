'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

export default function CheckoutModal({ cart, foods, totalAmount, onClose, onSuccess }) {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Details, 2: Payment
  const [customerName, setCustomerName] = useState('');
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
  };

  const handlePaymentComplete = () => {
    toast.success('Order placed successfully!');
    onSuccess();
    router.push(`/order-success?orderId=${orderDetails.orderId}&name=${encodeURIComponent(customerName)}&amount=${totalAmount}`);
  };



  const getCartItems = () => {
    return Object.entries(cart).map(([foodId, quantity]) => {
      const food = foods.find(f => f.id === foodId);
      return { food, quantity };
    }).filter(item => item.food);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {step === 1 && 'Checkout'}
            {step === 2 && 'Payment'}
          </h2>
          <button
            type="button"
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
                    <div key={food.id} className="flex justify-between text-sm">
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
                type="button"
                onClick={handlePaymentRedirect}
                disabled={paymentRedirected}
                className="btn-primary w-full"
              >
                {paymentRedirected ? 'Processing...' : 'Open UPI App to Pay'}
              </button>

              {paymentRedirected && (
                <>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-yellow-800 font-semibold mb-2">
                      Please complete the payment in your UPI app
                    </p>
                    <p className="text-xs text-yellow-700">
                      After completing payment, click the button below
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handlePaymentComplete}
                    className="btn-primary w-full"
                  >
                    I've Completed Payment
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="btn-secondary w-full"
                  >
                    Cancel
                  </button>
                </>
              )}

              {!paymentRedirected && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-sm text-blue-800">
                      After completing the payment, your order will be processed by our team.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onSuccess}
                    className="btn-secondary w-full"
                  >
                    Close
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
