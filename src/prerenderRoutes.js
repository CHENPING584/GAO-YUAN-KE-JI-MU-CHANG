import { products } from './data/showcaseProducts.js';

export const prerenderRoutes = [
  '/',
  '/traceability',
  '/showcase',
  ...products.map((product) => `/showcase/${product.id}`),
  '/apply-farmer',
  '/audit-status',
  '/dashboard/farmer',
  '/admin-review',
  '/partners',
  '/connect',
];
