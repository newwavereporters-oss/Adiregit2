import React from 'react';
import { DollarSign, Clock, CheckCircle2, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

interface OrderSummaryCardsProps {
  orders: any[];
}

export const OrdersSummaryCards: React.FC<OrderSummaryCardsProps> = ({ orders }) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const currentMonthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Filter orders for the current month
  const currentMonthOrders = orders.filter((order) => {
    const dateStr = order.created_at || order.createdAt || order.date;
    if (!dateStr) return true; // Default to include if no timestamp
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return true;
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Calculate revenue grouped by currency for current month (excluding cancelled)
  const revenueByCurrency: Record<string, number> = {};
  currentMonthOrders.forEach((order) => {
    const status = (order.order_status || order.status || '').toLowerCase();
    if (status === 'cancelled') return;

    const curr = (order.currency || 'NGN').toUpperCase();
    const amt = Number(order.total_amount || order.totalAmount || order.subtotal || order.subtotal_amount || 0);
    revenueByCurrency[curr] = (revenueByCurrency[curr] || 0) + amt;
  });

  // Ensure at least NGN is shown if no revenue recorded
  if (Object.keys(revenueByCurrency).length === 0) {
    revenueByCurrency['NGN'] = 0;
  }

  // Count pending orders for current month
  const pendingOrdersCount = currentMonthOrders.filter((order) => {
    const status = (order.order_status || order.status || 'pending').toLowerCase();
    return status === 'pending';
  }).length;

  // Count completed orders for current month
  const completedOrdersCount = currentMonthOrders.filter((order) => {
    const status = (order.order_status || order.status || '').toLowerCase();
    return status === 'completed' || status === 'delivered';
  }).length;

  const getCurrencySymbol = (code: string) => {
    switch (code.toUpperCase()) {
      case 'NGN':
        return '₦';
      case 'USD':
        return '$';
      case 'GBP':
        return '£';
      case 'EUR':
        return '€';
      case 'CAD':
        return 'CA$';
      case 'GHS':
        return 'GH₵';
      case 'KES':
        return 'KSh ';
      default:
        return `${code} `;
    }
  };

  const currencyEntries = Object.entries(revenueByCurrency);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      {/* 1. Revenue Card (All Currencies) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-[#D1B464]">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Monthly Revenue
              </h3>
              <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#D1B464]" />
                {currentMonthName}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-900 border border-amber-200">
            {currencyEntries.length} {currencyEntries.length === 1 ? 'Currency' : 'Currencies'}
          </span>
        </div>

        <div className="space-y-2 mt-1">
          {currencyEntries.map(([currencyCode, totalAmount]) => (
            <div
              key={currencyCode}
              className="flex items-center justify-between bg-gray-50/80 px-3 py-1.5 rounded-xl border border-gray-100"
            >
              <span className="text-xs font-bold text-[#1B2A4A] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#D1B464]"></span>
                {currencyCode}
              </span>
              <span className="text-sm font-extrabold text-[#1B2A4A] font-mono">
                {getCurrencySymbol(currencyCode)}
                {totalAmount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>Current month total sales</span>
          <span className="font-semibold text-[#1B2A4A]">{currentMonthOrders.length} Orders</span>
        </div>
      </div>

      {/* 2. Pending Orders Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Pending Orders
              </h3>
              <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-amber-500" />
                {currentMonthName}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Needs Action
          </span>
        </div>

        <div className="my-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-[#1B2A4A] font-mono">
            {pendingOrdersCount}
          </span>
          <span className="text-xs text-gray-500 font-medium">orders pending fulfillment</span>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>Monthly ratio</span>
          <span className="font-semibold text-amber-700">
            {currentMonthOrders.length > 0
              ? `${Math.round((pendingOrdersCount / currentMonthOrders.length) * 100)}% of total`
              : '0% of total'}
          </span>
        </div>
      </div>

      {/* 3. Completed Orders Card */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs relative overflow-hidden flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Completed Orders
              </h3>
              <p className="text-[11px] font-medium text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-emerald-500" />
                {currentMonthName}
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            Fulfilled
          </span>
        </div>

        <div className="my-2 flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-[#1B2A4A] font-mono">
            {completedOrdersCount}
          </span>
          <span className="text-xs text-gray-500 font-medium">orders delivered/completed</span>
        </div>

        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>Completion rate</span>
          <span className="font-semibold text-emerald-700">
            {currentMonthOrders.length > 0
              ? `${Math.round((completedOrdersCount / currentMonthOrders.length) * 100)}% completed`
              : '0% completed'}
          </span>
        </div>
      </div>
    </div>
  );
};
