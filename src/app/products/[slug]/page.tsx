import React from 'react';
import { ProductSalesPage } from '../../../pages/ProductSalesPage';

export default function ProductSlugPage({ params }: { params: { slug: string } }) {
  const slug = params?.slug || 'royal-olokun-agbada-ensemble';

  return (
    <ProductSalesPage
      slug={slug}
      activeCurrency="USD"
      onChangeCurrency={() => {}}
      onNavigateBack={() => {
        window.location.href = '/shop';
      }}
    />
  );
}
