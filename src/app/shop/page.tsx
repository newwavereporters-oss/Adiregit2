import React from 'react';
import { ShopPage } from '../../pages/ShopPage';

export default function ShopCatalogPage() {
  return (
    <ShopPage
      onNavigateToProduct={(slug) => {
        window.location.href = `/products/${slug}`;
      }}
      activeCurrency="USD"
      onChangeCurrency={() => {}}
    />
  );
}
