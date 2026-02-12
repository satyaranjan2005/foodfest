'use client';

import Image from 'next/image';

export default function FoodCard({ food, quantity, onUpdateQuantity }) {
  const isOutOfStock = !food.isAvailable;

  return (
    <div className={`card ${isOutOfStock ? 'opacity-60' : ''}`}>
      <div className="relative h-48 mb-4 rounded-lg overflow-hidden">
        <Image
          src={food.image}
          alt={food.name}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="badge-red text-lg">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-gray-800">{food.name}</h3>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">₹{food.price}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          {food.isAvailable ? (
            <span className="badge-green">Available</span>
          ) : (
            <span className="badge-red">Not Available</span>
          )}
        </div>

        {!isOutOfStock && (
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => onUpdateQuantity(food._id, -1)}
                disabled={quantity === 0}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-bold transition"
              >
                -
              </button>
              <span className="text-xl font-semibold w-8 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(food._id, 1)}
                className="w-10 h-10 rounded-full bg-primary hover:bg-orange-600 text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-xl font-bold transition"
              >
                +
              </button>
            </div>
            
            {quantity > 0 && (
              <div className="text-right">
                <p className="text-sm text-gray-600">Subtotal</p>
                <p className="text-lg font-bold text-gray-800">₹{food.price * quantity}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
