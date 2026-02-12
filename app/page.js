'use client';

import { useState, useEffect } from 'react';
import FoodCard from '@/components/FoodCard';
import CheckoutModal from '@/components/CheckoutModal';
import toast from 'react-hot-toast';

export default function Home() {
  const [foods, setFoods] = useState([]);
  const [cart, setCart] = useState({});
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const res = await fetch('/api/foods');
      const data = await res.json();
      
      if (data.success) {
        setFoods(data.data);
      } else {
        toast.error('Failed to load food items');
      }
    } catch (error) {
      console.error('Error fetching foods:', error);
      toast.error('Failed to load food items');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (foodId, change) => {
    setCart(prev => {
      const newCart = { ...prev };
      const currentQty = newCart[foodId] || 0;
      const newQty = currentQty + change;
      
      if (newQty <= 0) {
        delete newCart[foodId];
      } else {
        newCart[foodId] = newQty;
      }
      
      return newCart;
    });
  };

  const getTotalItems = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const getTotalAmount = () => {
    return Object.entries(cart).reduce((sum, [foodId, qty]) => {
      const food = foods.find(f => f._id === foodId);
      return sum + (food ? food.price * qty : 0);
    }, 0);
  };

  const handleCheckout = () => {
    if (getTotalItems() === 0) {
      toast.error('Please add items to cart');
      return;
    }
    setShowCheckout(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-primary">🍔 FoodFest 2026</h1>
              <p className="text-gray-600 text-sm mt-1">Order Your Favorite Food Instantly</p>
            </div>
            <a href="/admin" className="text-sm text-gray-500 hover:text-primary">
              Admin
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Welcome to FoodFest 2026! 🎉
          </h2>
          <p className="text-xl sm:text-2xl text-orange-100">
            Delicious food, quick ordering, instant delivery
          </p>
        </div>
      </section>

      {/* Food Items */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h3 className="text-3xl font-bold text-gray-800 mb-8 text-center">
          Our Menu
        </h3>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading delicious food...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
            {foods.map(food => (
              <FoodCard
                key={food._id}
                food={food}
                quantity={cart[food._id] || 0}
                onUpdateQuantity={updateQuantity}
              />
            ))}
          </div>
        )}

        {/* Cart Summary */}
        {getTotalItems() > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white shadow-2xl border-t-2 border-primary p-4 z-20">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {getTotalItems()} item{getTotalItems() > 1 ? 's' : ''} in cart
                </p>
                <p className="text-2xl font-bold text-gray-800">
                  ₹{getTotalAmount()}
                </p>
              </div>
              <button
                onClick={handleCheckout}
                className="btn-primary"
              >
                Proceed to Checkout →
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Checkout Modal */}
      {showCheckout && (
        <CheckoutModal
          cart={cart}
          foods={foods}
          totalAmount={getTotalAmount()}
          onClose={() => setShowCheckout(false)}
          onSuccess={() => {
            setCart({});
            setShowCheckout(false);
            fetchFoods();
          }}
        />
      )}
    </div>
  );
}
