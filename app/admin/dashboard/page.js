'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('adminToken');
    if (!token) {
      router.push('/admin');
      return;
    }

    fetchData();

    // Auto refresh every 5 seconds
    const interval = setInterval(() => {
      if (autoRefresh) {
        fetchData(true);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, router]);

  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return { 'Authorization': `Bearer ${token}` };
  };

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const [statsRes, ordersRes, foodsRes] = await Promise.all([
        fetch('/api/admin/stats', { headers: getAuthHeader() }),
        fetch('/api/admin/orders', { headers: getAuthHeader() }),
        fetch('/api/foods')
      ]);

      const statsData = await statsRes.json();
      const ordersData = await ordersRes.json();
      const foodsData = await foodsRes.json();

      if (statsData.success) setStats(statsData.data);
      if (ordersData.success) setOrders(ordersData.data);
      if (foodsData.success) setFoods(foodsData.data);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">FoodFest 2026 Management</p>
            </div>
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={autoRefresh}
                  onChange={(e) => setAutoRefresh(e.target.checked)}
                  className="rounded"
                />
                <span>Auto-refresh (5s)</span>
              </label>
              <button onClick={handleLogout} className="btn-secondary">
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card bg-blue-50 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600">Total Orders</p>
              <p className="text-3xl font-bold text-blue-600">{stats.totalOrders}</p>
            </div>
            <div className="card bg-green-50 border-l-4 border-green-500">
              <p className="text-sm text-gray-600">Accepted Orders</p>
              <p className="text-3xl font-bold text-green-600">{stats.acceptedOrders}</p>
            </div>
            <div className="card bg-purple-50 border-l-4 border-purple-500">
              <p className="text-sm text-gray-600">Completed Orders</p>
              <p className="text-3xl font-bold text-purple-600">{stats.completedOrders}</p>
            </div>
            <div className="card bg-orange-50 border-l-4 border-orange-500">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-orange-600">₹{stats.totalRevenue}</p>
            </div>
          </div>
        )}

        {/* Food Management */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Food Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {foods.map(food => (
              <div key={food._id} className="card">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{food.name}</h3>
                    <p className="text-gray-600">₹{food.price}</p>
                  </div>
                  <button
                    onClick={() => handleToggleAvailability(food._id)}
                    className={`px-4 py-2 rounded-lg font-semibold ${
                      food.isAvailable
                        ? 'bg-green-100 text-green-800 hover:bg-green-200'
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {food.isAvailable ? 'Available' : 'Unavailable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Orders Table */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Orders</h2>
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map(order => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{order.orderId}</td>
                    <td className="px-6 py-4">
                      <div>{order.customerName}</div>
                      <div className="text-sm text-gray-600">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="text-sm">
                          {item.foodName} x {item.quantity}
                        </div>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">₹{order.totalAmount}</td>
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
                    <td className="px-6 py-4 space-y-2">
                      {order.paymentStatus === 'pending' && (
                        <div className="flex flex-col space-y-1">
                          <button
                            onClick={() => handleVerifyPayment(order._id)}
                            className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => handleRejectPayment(order._id)}
                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {order.paymentStatus === 'paid' && order.orderStatus === 'placed' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'accepted')}
                          className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          Accept Order
                        </button>
                      )}
                      {order.orderStatus === 'accepted' && (
                        <button
                          onClick={() => handleUpdateOrderStatus(order._id, 'completed')}
                          className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded"
                        >
                          Mark Complete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
