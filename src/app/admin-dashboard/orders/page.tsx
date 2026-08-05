import React, { useEffect, useState } from 'react';
import {
  Search,
  RefreshCw,
  Filter,
  X,
  Package,
  MapPin,
  User,
  Mail,
  Phone,
  CreditCard,
  ShoppingBag,
  Calendar,
  Clock,
  ChevronRight,
} from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../../../lib/supabase';
import { OrderStatusBadge, PaymentStatusBadge } from '../../../components/Admin/OrderStatusBadge';

interface OrderItem {
  id?: string;
  productTitle?: string;
  title?: string;
  name?: string;
  quantity?: number;
  qty?: number;
  unitPrice?: number;
  price?: number;
  totalPrice?: number;
  productImage?: string;
  image?: string;
  selectedVariant?: string;
  variant?: string;
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  // 1. Fetch live orders
  const fetchOrders = async () => {
    setLoading(true);
    let sbOrders: any[] = [];
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error.message);
      } else if (data) {
        sbOrders = data;
      }
    }

    let localOrders: any[] = [];
    try {
      const stored = localStorage.getItem('dsp_admin_orders');
      if (stored) localOrders = JSON.parse(stored);
    } catch (_) {}

    const orderMap = new Map<string, any>();
    localOrders.forEach((o) => {
      const key = o.order_number || o.orderNumber || o.id;
      if (key) orderMap.set(key.toString(), o);
    });
    sbOrders.forEach((o) => {
      const key = o.order_number || o.orderNumber || o.id;
      if (key) orderMap.set(key.toString(), o);
    });

    const combined = Array.from(orderMap.values()).sort((a, b) => {
      const timeA = new Date(a.created_at || a.createdAt || 0).getTime();
      const timeB = new Date(b.created_at || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    setOrders(combined);
    if (selectedOrder) {
      const updated = combined.find((o) => (o.id || o.orderNumber) === (selectedOrder.id || selectedOrder.orderNumber));
      if (updated) setSelectedOrder(updated);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchOrders();

    const handleCreated = () => {
      fetchOrders();
    };
    window.addEventListener('dsp_order_created', handleCreated);
    return () => {
      window.removeEventListener('dsp_order_created', handleCreated);
    };
  }, []);

  // 2. Dynamic Status Update Handler
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    // Optimistic UI update
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId
          ? { ...order, order_status: newStatus, status: newStatus }
          : order
      )
    );

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev: any) => ({
        ...prev,
        order_status: newStatus,
        status: newStatus,
      }));
    }

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('orders')
        .update({ order_status: newStatus, status: newStatus })
        .eq('id', orderId);

      if (error) {
        alert(`Failed to update status: ${error.message}`);
        fetchOrders(); // Revert on failure
      }
    }
  };

  // Helper to parse order items safely
  const parseOrderItems = (rawItems: any): OrderItem[] => {
    if (!rawItems) return [];
    if (Array.isArray(rawItems)) return rawItems;
    if (typeof rawItems === 'string') {
      try {
        const parsed = JSON.parse(rawItems);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        console.error('Error parsing order items JSON:', e);
        return [];
      }
    }
    return [];
  };

  // 3. Real-time Search & Status Filter Logic
  const filteredOrders = orders.filter((order) => {
    const searchLower = searchTerm.trim().toLowerCase();
    const orderNum = (order.order_number || order.orderNumber || '').toString().toLowerCase();
    const customerName = (order.customer_name || order.customerName || '').toString().toLowerCase();
    const customerEmail = (order.customer_email || order.customerEmail || '').toString().toLowerCase();

    const matchesSearch =
      !searchLower ||
      orderNum.includes(searchLower) ||
      customerName.includes(searchLower) ||
      customerEmail.includes(searchLower);

    const currentStatus = order.order_status || order.status || 'pending';
    const matchesStatus = statusFilter === 'all' || currentStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 bg-[#FAFAFA] min-h-screen font-sans text-gray-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-serif text-[#1B2A4A] font-bold">Customer Orders</h1>
          <p className="text-xs text-gray-500">
            View, filter, and click any order to inspect complete item breakdown and shipping details.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 bg-[#1B2A4A] text-[#FAFAFA] text-sm rounded-lg hover:bg-opacity-90 transition-all font-medium cursor-pointer shadow-xs"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Real-time Search Input & Status Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-xs mb-6">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order # or Customer Name..."
            className="w-full pl-9 pr-4 py-2 rounded-lg text-xs bg-gray-50 border border-gray-200 focus:border-[#D1B464] focus:bg-white outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-xs font-semibold text-[#1B2A4A] outline-none cursor-pointer w-full sm:w-auto"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
          Loading orders...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-8 text-center text-gray-500 bg-white rounded-lg border border-gray-200">
          {searchTerm ? 'No orders match your search filter.' : 'No orders recorded yet.'}
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-xs border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b text-xs uppercase text-gray-600 font-semibold tracking-wider">
                <th className="p-4">Order Ref</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Order Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {filteredOrders.map((order) => {
                const currentStatus = order.order_status || order.status || 'pending';
                const paymentStatus = order.payment_status || order.paymentStatus || 'pending';
                const orderRef = order.order_number || order.orderNumber || order.id;
                const customerName = order.customer_name || order.customerName || 'N/A';
                const customerEmail = order.customer_email || order.customerEmail || '';
                const currency = order.currency || 'NGN';
                const totalAmount = Number(order.total_amount || order.totalAmount || 0);

                return (
                  <tr
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="hover:bg-amber-50/50 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 font-mono font-bold text-[#1B2A4A]">
                      {orderRef}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-[#1B2A4A] group-hover:text-[#D1B464] transition-colors">
                        {customerName}
                      </div>
                      {customerEmail && <div className="text-xs text-gray-500">{customerEmail}</div>}
                    </td>
                    <td className="p-4 font-semibold text-[#1B2A4A]">
                      {currency} {totalAmount.toLocaleString()}
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <PaymentStatusBadge status={paymentStatus} />
                    </td>
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <OrderStatusBadge
                        status={currentStatus}
                        onStatusChange={(newStatus) => handleStatusChange(order.id, newStatus)}
                      />
                    </td>
                    <td className="p-4 text-xs text-gray-500">
                      {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder(order);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#1B2A4A] hover:text-[#D1B464] px-2 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* DETAILED ORDER MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1B2A4A]/70 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-2xl w-full border border-gray-200 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs uppercase font-bold tracking-widest text-[#D1B464]">
                  Order Detailed View
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#1B2A4A]">
                  {selectedOrder.order_number || selectedOrder.orderNumber || selectedOrder.id}
                </h2>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {selectedOrder.created_at
                      ? new Date(selectedOrder.created_at).toLocaleString()
                      : 'Date Unavailable'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Status Controls inside Modal */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Payment Status:</span>
                <PaymentStatusBadge status={selectedOrder.payment_status || selectedOrder.paymentStatus || 'pending'} />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-500">Fulfillment Status:</span>
                <OrderStatusBadge
                  status={selectedOrder.order_status || selectedOrder.status || 'pending'}
                  onStatusChange={(newStatus) => handleStatusChange(selectedOrder.id, newStatus)}
                />
              </div>
            </div>

            {/* Customer & Shipping Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Customer Info Card */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#1B2A4A] uppercase tracking-wider text-[11px]">
                  <User className="w-3.5 h-3.5 text-[#D1B464]" />
                  <span>Customer Details</span>
                </div>
                <div className="space-y-1 text-gray-700">
                  <p className="font-bold text-[#1B2A4A] text-sm">
                    {selectedOrder.customer_name || selectedOrder.customerName || 'N/A'}
                  </p>
                  {(selectedOrder.customer_email || selectedOrder.customerEmail) && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Mail className="w-3.5 h-3.5 text-gray-400" />
                      <span>{selectedOrder.customer_email || selectedOrder.customerEmail}</span>
                    </div>
                  )}
                  {(selectedOrder.customer_phone || selectedOrder.customerPhone) && (
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Phone className="w-3.5 h-3.5 text-gray-400" />
                      <span>{selectedOrder.customer_phone || selectedOrder.customerPhone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address Card */}
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#1B2A4A] uppercase tracking-wider text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-[#D1B464]" />
                  <span>Shipping Address</span>
                </div>
                <div className="space-y-1 text-gray-700">
                  <p className="font-semibold text-[#1B2A4A]">
                    {selectedOrder.shipping_address || selectedOrder.shippingAddress || 'No address specified'}
                  </p>
                  <p className="text-gray-600">
                    {[
                      selectedOrder.shipping_city || selectedOrder.shippingCity,
                      selectedOrder.shipping_state || selectedOrder.shippingState,
                      selectedOrder.shipping_country || selectedOrder.shippingCountry || 'Nigeria',
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {(selectedOrder.delivery_timeframe || selectedOrder.shipping_location_name) && (
                    <p className="text-xs font-medium text-[#1B2A4A] pt-1">
                      Timeframe: {selectedOrder.delivery_timeframe || selectedOrder.shipping_location_name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* List of Ordered Items */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                <ShoppingBag className="w-4 h-4 text-[#D1B464]" />
                <h3 className="font-serif font-bold text-base text-[#1B2A4A]">Items Ordered</h3>
              </div>

              {(() => {
                const itemsList = parseOrderItems(selectedOrder.items || selectedOrder.orderItems);
                if (itemsList.length === 0) {
                  return (
                    <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-lg text-center">
                      No item breakdown recorded for this order.
                    </p>
                  );
                }

                const currencySymbol = selectedOrder.currency || 'NGN';

                return (
                  <div className="space-y-2">
                    {itemsList.map((item, idx) => {
                      const title = item.productTitle || item.title || item.name || 'Adire Product Item';
                      const qty = item.quantity || item.qty || 1;
                      const price = item.unitPrice || item.price || 0;
                      const totalPrice = item.totalPrice || price * qty;
                      const image = item.productImage || item.image;
                      const variant = item.selectedVariant || item.variant;

                      return (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 text-xs p-3 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            {image ? (
                              <img
                                src={image}
                                alt={title}
                                referrerPolicy="no-referrer"
                                className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                                <Package className="w-5 h-5" />
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-[#1B2A4A]">{title}</p>
                              {variant && <p className="text-[11px] text-gray-500">Variant: {variant}</p>}
                              <p className="text-[11px] text-gray-500">
                                Qty: {qty} × {currencySymbol} {Number(price).toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="text-right font-bold text-[#1B2A4A] text-sm">
                            {currencySymbol} {Number(totalPrice).toLocaleString()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

            {/* Financial Totals Breakdown */}
            <div className="pt-4 border-t border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span className="font-semibold">
                  {selectedOrder.currency || 'NGN'}{' '}
                  {Number(selectedOrder.subtotal || selectedOrder.subtotalAmount || 0).toLocaleString()}
                </span>
              </div>

              {Number(selectedOrder.shipping_fee || selectedOrder.shippingFee || 0) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Fee</span>
                  <span className="font-semibold">
                    {selectedOrder.currency || 'NGN'}{' '}
                    {Number(selectedOrder.shipping_fee || selectedOrder.shippingFee || 0).toLocaleString()}
                  </span>
                </div>
              )}

              {Number(selectedOrder.discount_amount || selectedOrder.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-[#D1B464] font-bold">
                  <span>Discount {selectedOrder.coupon_code ? `(${selectedOrder.coupon_code})` : ''}</span>
                  <span>
                    -{selectedOrder.currency || 'NGN'}{' '}
                    {Number(selectedOrder.discount_amount || selectedOrder.discountAmount || 0).toLocaleString()}
                  </span>
                </div>
              )}

              <div className="flex justify-between font-bold text-base text-[#1B2A4A] pt-2 border-t border-gray-200">
                <span>Total Amount</span>
                <span>
                  {selectedOrder.currency || 'NGN'}{' '}
                  {Number(selectedOrder.total_amount || selectedOrder.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Close Button */}
            <div className="pt-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-[#1B2A4A] font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Close Order Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
