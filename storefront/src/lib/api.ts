// Central API helper for storefront
const API_BASE = 'http://localhost:4000/api';

export async function fetchCategories() {
  const res = await fetch(`${API_BASE}/categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function fetchProducts(category?: string) {
  const res = await fetch(`${API_BASE}/products`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch products');
  const products = await res.json();
  if (category) {
    return products.filter((p: any) =>
      p.category?.name?.toLowerCase() === category.toLowerCase()
    );
  }
  return products;
}

export async function fetchProductById(id: number) {
  const res = await fetch(`${API_BASE}/products/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function placeOrder(data: {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
  items: { variationId: number; quantity: number }[];
}) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to place order');
  }
  return res.json();
}

export async function submitCheckout(data: {
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  paymentMethod: string;
  items: {
    productId: number;
    productVariationId: number | null;
    productName: string;
    productSize: string;
    productColor: string;
    quantity: number;
    priceAtPurchase: number;
  }[];
}) {
  // Map to the order endpoint format
  const orderData = {
    customerName: data.customerName,
    email: data.email,
    phone: data.phone,
    address: data.address,
    city: data.city,
    paymentMethod: data.paymentMethod,
    items: data.items.map(item => ({
      productVariationId: item.productVariationId,
      quantity: item.quantity,
    })),
  };

  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || 'Failed to place order');
  }
  return res.json();
}
