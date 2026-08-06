import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';

export default function CheckoutPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    selectedState: '',
    country: 'Nigeria',
    deliveryNotes: '',
  });

  const [currentCurrency, setCurrentCurrency] = useState('NGN');
  const [subtotal, setSubtotal] = useState(0);
  const [shippingFee, setShippingFee] = useState(0);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const totalAmount = Number(subtotal) + Number(shippingFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const orderPayload = {
      order_number: `DSP-${Math.floor(100000 + Math.random() * 900000)}`,

      // Customer details
      customer_name: formData.fullName,
      customer_email: formData.email,
      customer_phone: formData.phone,

      // Shipping details
      shipping_address: formData.address,
      shipping_city: formData.city || formData.selectedState,
      shipping_state: formData.selectedState,
      shipping_country: formData.country || 'Nigeria',
      notes: formData.deliveryNotes || '',

      // Pricing & status
      currency: currentCurrency || 'NGN',
      subtotal: Number(subtotal),
      shipping_cost: Number(shippingFee),
      total_amount: Number(totalAmount),
      payment_method: 'Direct Bank Transfer',
      payment_status: 'unpaid',
      status: 'pending',

      items: cartItems,
    };

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase
          .from('orders')
          .insert([orderPayload])
          .select();

        if (error) {
          console.error('Order Submission Error:', error.message);
          alert(`Order placement failed: ${error.message}`);
          setSubmitting(false);
          return;
        }

        console.log('ORDER SAVED PERMANENTLY IN SUPABASE:', data);
      }
      alert('Order placed successfully!');
    } catch (err: any) {
      console.error('Order Submission Error:', err.message || err);
      alert(`Order placement failed: ${err.message || err}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl border border-gray-200 my-8 shadow-xs">
      <h1 className="text-2xl font-serif text-[#1B2A4A] font-bold mb-6">Checkout</h1>

      <form onSubmit={handleSubmitOrder} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold mb-1 text-gray-700">Full Name</label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-xs"
            placeholder="John Doe"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-700">Email Address</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-xs"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700">Phone Number</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-xs"
              placeholder="+234 800 000 0000"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700">Shipping Address</label>
          <textarea
            required
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-xs"
            rows={2}
            placeholder="Street address, apartment, suite, etc."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block font-semibold mb-1 text-gray-700">City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-xs"
              placeholder="Ikeja"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700">State / Region</label>
            <input
              type="text"
              value={formData.selectedState}
              onChange={(e) => setFormData({ ...formData, selectedState: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-xs"
              placeholder="Lagos"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-gray-700">Country</label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full p-2.5 border border-gray-300 rounded-lg text-xs"
              placeholder="Nigeria"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1 text-gray-700">Delivery Notes</label>
          <textarea
            value={formData.deliveryNotes}
            onChange={(e) => setFormData({ ...formData, deliveryNotes: e.target.value })}
            className="w-full p-2.5 border border-gray-300 rounded-lg text-xs"
            rows={2}
            placeholder="Special delivery instructions..."
          />
        </div>

        <div className="pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-[#1B2A4A] text-[#FAFAFA] font-bold text-xs rounded-xl hover:bg-opacity-90 transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'Placing Order...' : 'Submit Order'}
          </button>
        </div>
      </form>
    </div>
  );
}
