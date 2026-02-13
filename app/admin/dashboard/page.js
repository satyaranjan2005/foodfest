'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { getClientDb } from '@/lib/firebaseClient';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Real-time listener for orders
  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    try {
      const db = getClientDb();
      const ordersQuery = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));

      // Listen for real-time updates
      const unsubscribe = onSnapshot(
        ordersQuery,
        (snapshot) => {
          const ordersData = [];
          snapshot.forEach((doc) => {
            ordersData.push({ id: doc.id, ...doc.data() });
          });
          
          // Check if this is a new order (compare with existing orders)
          if (orders.length > 0 && ordersData.length > orders.length) {
            const newOrder = ordersData[0];
            toast.success(`🔔 New order received: ${newOrder.orderId}`, {
              duration: 5000,
              icon: '🎉'
            });
          }
          
          setOrders(ordersData);
          setRealtimeConnected(true);
          console.log('✅ Real-time orders updated:', ordersData.length);
        },
        (error) => {
          console.error('❌ Real-time listener error:', error);
          setRealtimeConnected(false);
          toast.error('Real-time connection lost. Using polling...');
        }
      );

      return () => unsubscribe();
    } catch (error) {
      console.error('Failed to setup real-time listener:', error);
      setRealtimeConnected(false);
    }
  }, [router]);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    fetchData();

    // Auto refresh for stats and foods every 10 seconds (orders are real-time)
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchData(true);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [autoRefresh, router]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return { 'Authorization': `Bearer ${token}` };
  };

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const [statsRes, foodsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: getAuthHeader() }),
        fetch('/api/foods')
      ]);

      const statsData = await statsRes.json();
      const foodsData = await foodsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (foodsData.success) setFoods(foodsData.data);
      // Orders are handled by real-time listener

    } catch (error) {
      console.error('Error fetching data:', error);
      if (!silent) toast.error('Failed to fetch data');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    toast.success('Logged out successfully');
    router.push('/admin');
  };

  const handleVerifyPayment = async (orderId) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/verify-payment`, {
        method: 'PATCH',
        headers: getAuthHeader()
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Payment verified!');
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error verifying payment:', error);
      toast.error('Failed to verify payment');
    }
  };

  const handleRejectPayment = async (orderId) => {
    if (!confirm('Are you sure you want to reject this payment?')) return;

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/reject-payment`, {
        method: 'PATCH',
        headers: getAuthHeader()
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Payment rejected');
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Failed to reject payment');
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Order status updated!');
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const handleToggleAvailability = async (foodId) => {
    try {
      const res = await fetch(`/api/admin/foods/${foodId}/toggle`, {
        method: 'PATCH',
        headers: getAuthHeader()
      });

      const data = await res.json();

      if (data.success) {
        toast.success(data.message);
        fetchData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error('Error toggling availability:', error);
      toast.error('Failed to toggle availability');
    }
  };

  const getPaymentStatusBadge = (status) => {
    const badges = {
      pending: 'badge-yellow',
      paid: 'badge-green',
      rejected: 'badge-red'
    };
    return badges[status] || 'badge-yellow';
  };

  const getOrderStatusBadge = (status) => {
    const badges = {
      placed: 'badge-yellow',
      accepted: 'badge-green',
      completed: 'badge-green'
    };
    return badges[status] || 'badge-yellow';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg sticky top-0 z-20 border-b-2 border-primary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
                <span className="text-2xl">📊</span> Admin Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-gray-600">FoodFest 2026 Management</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto">
              {/* Real-time Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${realtimeConnected ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className={`w-2 h-2 rounded-full ${realtimeConnected ? 'bg-green-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`}></div>
                <span className="text-xs font-medium text-gray-700">
                  {realtimeConnected ? '⚡ Live Orders' : '🔄 Polling'}
                </span>
              </div>
              <label className="flex items-center gap-2 text-xs sm:text-sm px-3 py-1 bg-gray-50 rounded-full cursor-pointer hover:bg-gray-100 transition">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded text-primary"
                />
                <span className="hidden sm:inline">Auto-refresh stats</span>
                <span className="sm:hidden">Auto</span>
              </label>
              <button type="button" onClick={handleLogout} className="btn-secondary text-sm">
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="card hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Orders</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
                </div>
                <div className="text-3xl sm:text-4xl opacity-50">📦</div>
              </div>
            </div>
            <div className="card hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Accepted</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.acceptedOrders}</p>
                </div>
                <div className="text-3xl sm:text-4xl opacity-50">✅</div>
              </div>
            </div>
            <div className="card hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.completedOrders}</p>
                </div>
                <div className="text-3xl sm:text-4xl opacity-50">🎉</div>
              </div>
            </div>
            <div className="card hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-orange-50 to-orange-100 border-l-4 border-orange-500 col-span-2 md:col-span-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 mb-1">Revenue</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">₹{stats.totalRevenue}</p>
                </div>
                <div className="text-3xl sm:text-4xl opacity-50">💰</div>
              </div>
            </div>
          </div>
        )}

        {/* Food Management */}
        <section className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🍔</span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Food Management</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {foods.map(food => (
              <div key={food._id} className="card hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base sm:text-lg truncate">{food.name}</h3>
                    <p className="text-gray-600 text-sm sm:text-base font-semibold">₹{food.price}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleToggleAvailability(food._id)}
                    className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-xs sm:text-sm transition-all whitespace-nowrap ${
                      food.isAvailable
                        ? 'bg-green-100 text-green-800 hover:bg-green-200 hover:scale-105'
                        : 'bg-red-100 text-red-800 hover:bg-red-200 hover:scale-105'
                    }`}
                  >
                    {food.isAvailable ? '✓ Available' : '✗ Off'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Orders Table */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📋</span>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Orders</h2>
            <span className="ml-auto bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
              {orders.length} Total
            </span>
          </div>

          {/* Mobile View - Cards */}
          <div className="block lg:hidden space-y-4">
            {orders.length === 0 ? (
              <div className="card text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <p className="text-gray-500 text-lg">No orders yet</p>
                <p className="text-gray-400 text-sm mt-2">Orders will appear here when customers place them</p>
              </div>
            ) : (
              orders.map(order => (
              <div key={order._id} className="card hover:shadow-xl transition-all duration-300">
                <div className="space-y-3">
                  {/* Order Header */}
                  <div className="flex items-start justify-between pb-3 border-b">
                    <div>
                      <p className="font-bold text-lg text-primary">{order.orderId}</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      {order.phone && <p className="text-xs text-gray-500">{order.phone}</p>}
                    </div>
                    <p className="text-xl font-bold text-gray-800">₹{order.totalAmount}</p>
                  </div>

                  {/* Items */}
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">ITEMS</p>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-700">
                        • {item.foodName} × {item.quantity}
                      </div>
                    ))}
                  </div>

                  {/* Status Badges */}
                  <div className="flex gap-2">
                    <span className={`${getPaymentStatusBadge(order.paymentStatus)} text-xs`}>
                      {order.paymentStatus}
                    </span>
                    <span className={`${getOrderStatusBadge(order.orderStatus)} text-xs`}>
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 space-y-2">
                    {order.paymentStatus === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleVerifyPayment(order._id)}
                          className="flex-1 text-sm bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                        >
                          ✓ Mark Paid
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRejectPayment(order._id)}
                          className="flex-1 text-sm bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                        >
                          ✗ Reject
                        </button>
                      </div>
                    )}
                    {order.paymentStatus === 'paid' && order.orderStatus === 'placed' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus(order._id, 'accepted')}
                        className="w-full text-sm bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        ✓ Accept Order
                      </button>
                    )}
                    {order.orderStatus === 'accepted' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateOrderStatus(order._id, 'completed')}
                        className="w-full text-sm bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold transition"
                      >
                        ✓ Mark Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
            )}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden">
            {orders.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="text-8xl mb-6">📭</div>
                <h3 className="text-2xl font-bold text-gray-700 mb-2">No orders yet</h3>
                <p className="text-gray-500">Orders will appear here when customers place them</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Items</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Payment</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {orders.map(order => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-primary">{order.orderId}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{order.customerName}</div>
                        {order.phone && <div className="text-sm text-gray-500">{order.phone}</div>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="text-sm text-gray-700">
                              {item.foodName} × {item.quantity}
                            </div>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-lg font-bold text-gray-900">₹{order.totalAmount}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getPaymentStatusBadge(order.paymentStatus)}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={getOrderStatusBadge(order.orderStatus)}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          {order.paymentStatus === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleVerifyPayment(order._id)}
                                className="text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap"
                              >
                                ✓ Mark Paid
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectPayment(order._id)}
                                className="text-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap"
                              >
                                ✗ Reject
                              </button>
                            </>
                          )}
                          {order.paymentStatus === 'paid' && order.orderStatus === 'placed' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order._id, 'accepted')}
                              className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap"
                            >
                              ✓ Accept Order
                            </button>
                          )}
                          {order.orderStatus === 'accepted' && (
                            <button
                              type="button"
                              onClick={() => handleUpdateOrderStatus(order._id, 'completed')}
                              className="text-sm bg-purple-500 hover:bg-purple-600 text-white px-3 py-1.5 rounded-lg font-semibold transition whitespace-nowrap"
                            >
                              ✓ Mark Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
