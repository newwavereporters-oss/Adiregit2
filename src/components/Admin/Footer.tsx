import React from 'react';
import { PackageCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1B2A4A] text-white border-t border-[#D1B464]/30 pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <h3 className="text-xl font-serif text-[#D1B464] tracking-wider">DSP ADIRE</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Authentic Yoruba hand-dyed luxury textiles, crafted for contemporary style and cultural elegance.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#D1B464]">Catalog</h4>
            <ul className="space-y-1.5 text-xs text-gray-300">
              <li><a href="/shop" className="hover:text-[#D1B464] transition-colors">All Products</a></li>
              <li><a href="/shop?category=silk" className="hover:text-[#D1B464] transition-colors">Adire Silk</a></li>
              <li><a href="/shop?category=cotton" className="hover:text-[#D1B464] transition-colors">Adire Cotton</a></li>
            </ul>
          </div>

          {/* ORDER SUPPORT & TRACKING */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#D1B464]">Customer Service</h4>
            <ul className="space-y-2 text-xs text-gray-300">
              {/* Clean, highlighted Track Order Link */}
              <li>
                <a 
                  href="/track-order" 
                  className="inline-flex items-center gap-1.5 text-[#D1B464] hover:underline font-semibold transition-colors"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>Track Your Order</span>
                </a>
              </li>
              <li><a href="/shipping-policy" className="hover:text-[#D1B464] transition-colors">Delivery & Rates</a></li>
              <li><a href="/contact" className="hover:text-[#D1B464] transition-colors">Contact Support</a></li>
            </ul>
          </div>

          {/* Guarantees */}
          <div className="space-y-2">
            <h4 className="text-sm font-bold uppercase tracking-widest text-[#D1B464]">Payment Methods</h4>
            <p className="text-xs text-gray-300">
              Direct Bank Transfer (GTBank NGN, USD, GBP, EUR) with Pay-on-Delivery options available.
            </p>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="border-t border-white/10 pt-6 text-center text-[11px] text-gray-400">
          <p>© {new Date().getFullYear()} DSP Adire (DSP Academy LTD). All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}