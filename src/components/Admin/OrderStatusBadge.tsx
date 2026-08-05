import React, { useState } from 'react';
import {
  Clock,
  RefreshCw,
  Truck,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  ChevronDown,
  ArrowRight,
  CreditCard,
} from 'lucide-react';

export type FulfillmentStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | string;

export type PaymentStatusType =
  | 'paid'
  | 'partially_paid'
  | 'unpaid'
  | 'pending'
  | 'failed'
  | 'refunded'
  | string;

interface OrderStatusBadgeProps {
  status: FulfillmentStatus;
  onStatusChange?: (newStatus: string) => void;
  interactive?: boolean;
}

interface PaymentStatusBadgeProps {
  status: PaymentStatusType;
}

const FULFILLMENT_CONFIG: Record<
  string,
  {
    label: string;
    step: number;
    bg: string;
    text: string;
    border: string;
    icon: React.ElementType;
    pulse?: boolean;
    title: string;
    description: string;
    nextRecommended?: string;
  }
> = {
  pending: {
    label: 'Pending',
    step: 1,
    bg: 'bg-amber-50 hover:bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    icon: Clock,
    pulse: true,
    title: 'Awaiting Fulfillment',
    description: 'New order logged. Awaiting admin review and payment confirmation.',
    nextRecommended: 'processing',
  },
  processing: {
    label: 'Processing',
    step: 2,
    bg: 'bg-sky-50 hover:bg-sky-100',
    text: 'text-sky-800',
    border: 'border-sky-300',
    icon: RefreshCw,
    pulse: true,
    title: 'Packing & Preparation',
    description: 'Items are being picked, quality-checked, and packed for shipment.',
    nextRecommended: 'shipped',
  },
  shipped: {
    label: 'Shipped',
    step: 3,
    bg: 'bg-indigo-50 hover:bg-indigo-100',
    text: 'text-indigo-800',
    border: 'border-indigo-300',
    icon: Truck,
    title: 'Dispatched in Transit',
    description: 'Handed over to logistics courier. Tracking dispatched to customer.',
    nextRecommended: 'delivered',
  },
  delivered: {
    label: 'Delivered',
    step: 4,
    bg: 'bg-teal-50 hover:bg-teal-100',
    text: 'text-teal-800',
    border: 'border-teal-300',
    icon: MapPin,
    title: 'Arrived at Destination',
    description: 'Courier confirmed physical dropoff at destination shipping address.',
    nextRecommended: 'completed',
  },
  completed: {
    label: 'Completed',
    step: 5,
    bg: 'bg-emerald-50 hover:bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    icon: CheckCircle,
    title: 'Order Finalized',
    description: 'Order fully delivered, verified, and closed successfully.',
  },
  cancelled: {
    label: 'Cancelled',
    step: 0,
    bg: 'bg-rose-50 hover:bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
    icon: XCircle,
    title: 'Order Cancelled',
    description: 'Order voided prior to fulfillment. Inventory returned to stock.',
  },
};

const PAYMENT_CONFIG: Record<
  string,
  {
    label: string;
    bg: string;
    text: string;
    border: string;
    icon: React.ElementType;
    description: string;
  }
> = {
  paid: {
    label: 'Paid',
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    icon: CheckCircle,
    description: 'Full transaction amount captured and verified by payment gateway.',
  },
  partially_paid: {
    label: 'Partially Paid',
    bg: 'bg-sky-100',
    text: 'text-sky-800',
    border: 'border-sky-300',
    icon: Clock,
    description: 'Deposit received. Outstanding balance due upon final delivery.',
  },
  unpaid: {
    label: 'Unpaid',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    icon: AlertCircle,
    description: 'Payment transaction pending or Pay on Delivery option chosen.',
  },
  pending: {
    label: 'Pending',
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    icon: Clock,
    description: 'Awaiting customer payment authorization or bank transfer clearance.',
  },
  failed: {
    label: 'Failed',
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-300',
    icon: XCircle,
    description: 'Payment attempt failed or declined by issuing card bank.',
  },
  refunded: {
    label: 'Refunded',
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    icon: RefreshCw,
    description: 'Payment returned to customer balance or original payment account.',
  },
};

export function OrderStatusBadge({
  status,
  onStatusChange,
  interactive = true,
}: OrderStatusBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const normalizedStatus = (status || 'pending').toLowerCase();
  const config = FULFILLMENT_CONFIG[normalizedStatus] || FULFILLMENT_CONFIG.pending;
  const IconComponent = config.icon;

  const allStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled'];

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center gap-1.5">
        {/* Color-Coded Badge Selector / Display */}
        {onStatusChange && interactive ? (
          <div className="relative group/badge">
            <select
              value={normalizedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className={`appearance-none inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold outline-none cursor-pointer transition-all shadow-2xs pr-7 ${config.bg} ${config.text} ${config.border}`}
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className={`w-3.5 h-3.5 absolute right-2 top-2.5 pointer-events-none ${config.text}`} />
          </div>
        ) : (
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold shadow-2xs ${config.bg} ${config.text} ${config.border}`}
          >
            <IconComponent className="w-3.5 h-3.5" />
            <span>{config.label}</span>
          </span>
        )}

        {/* Quick Info Dot */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowTooltip(!showTooltip);
          }}
          className="text-gray-400 hover:text-[#1B2A4A] p-0.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          title="Status details"
        >
          <Info className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Interactive Tooltip Popover */}
      {showTooltip && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 bottom-full mb-2 z-50 w-72 bg-[#1B2A4A] text-white rounded-2xl p-4 shadow-2xl border border-[#2A3C62] animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
        >
          {/* Arrow */}
          <div className="absolute -bottom-1.5 left-6 w-3 h-3 bg-[#1B2A4A] border-r border-b border-[#2A3C62] rotate-45" />

          {/* Header */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-700/60">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${config.bg} ${config.text}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">{config.title}</p>
                <p className="text-[10px] text-[#D1B464] font-medium uppercase tracking-wider">
                  State: {config.label}
                </p>
              </div>
            </div>
            {config.step > 0 && (
              <span className="text-[10px] font-mono bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                Step {config.step}/5
              </span>
            )}
          </div>

          {/* Description */}
          <p className="text-[11px] text-gray-300 leading-relaxed mb-3">
            {config.description}
          </p>

          {/* Progress Bar (5 steps) */}
          {config.step > 0 && (
            <div className="mb-3 space-y-1">
              <div className="flex justify-between text-[10px] text-gray-400">
                <span>Fulfillment Progress</span>
                <span>{Math.round((config.step / 5) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-700/80 rounded-full h-1.5 overflow-hidden flex gap-0.5 p-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    className={`h-full flex-1 rounded-xs transition-all ${
                      s <= config.step ? 'bg-[#D1B464]' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quick Action Transitions */}
          {onStatusChange && (
            <div className="pt-2 border-t border-gray-700/60">
              <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold mb-1.5">
                Quick Status Change
              </p>
              <div className="grid grid-cols-2 gap-1.5">
                {allStatuses.map((st) => {
                  const isCurrent = st === normalizedStatus;
                  return (
                    <button
                      key={st}
                      onClick={() => {
                        onStatusChange(st);
                        setShowTooltip(false);
                      }}
                      className={`text-[11px] font-medium px-2 py-1 rounded-lg text-left capitalize transition-all cursor-pointer flex items-center justify-between ${
                        isCurrent
                          ? 'bg-[#D1B464] text-[#1B2A4A] font-bold'
                          : 'bg-white/5 hover:bg-white/15 text-gray-200'
                      }`}
                    >
                      <span>{st}</span>
                      {isCurrent && <CheckCircle className="w-3 h-3 text-[#1B2A4A]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const normalizedStatus = (status || 'unpaid').toLowerCase();
  const config = PAYMENT_CONFIG[normalizedStatus] || PAYMENT_CONFIG.unpaid;
  const IconComponent = config.icon;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border uppercase tracking-wider shadow-2xs ${config.bg} ${config.text} ${config.border} cursor-help`}
      >
        <IconComponent className="w-3 h-3" />
        <span>{config.label}</span>
      </span>

      {showTooltip && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute left-0 bottom-full mb-2 z-50 w-64 bg-[#1B2A4A] text-white rounded-2xl p-3 shadow-2xl border border-[#2A3C62] animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="absolute -bottom-1.5 left-5 w-3 h-3 bg-[#1B2A4A] border-r border-b border-[#2A3C62] rotate-45" />
          <div className="flex items-center gap-2 mb-1.5">
            <CreditCard className="w-4 h-4 text-[#D1B464]" />
            <p className="text-xs font-bold text-white">Payment Status: {config.label}</p>
          </div>
          <p className="text-[11px] text-gray-300 leading-normal">{config.description}</p>
        </div>
      )}
    </div>
  );
}

export default OrderStatusBadge;
