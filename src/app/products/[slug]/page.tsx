import React from 'react';
import { ProductSalesPage } from '../../../pages/ProductSalesPage';

export default function ProductSlugPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug || 'royal-olokun-agbada-ensemble';

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <ProductSalesPage
        slug={slug}
        activeCurrency="USD"
        onChangeCurrency={() => {}}
        onNavigateBack={() => {
          if (typeof window !== 'undefined') {
            window.location.href = '/shop';
          }
        }}
      />
    </div>
  );
}

