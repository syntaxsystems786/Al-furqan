// Central API helper for admin dashboard
const API_BASE = '/api';

function getToken() {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
  return null;
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function apiLogin(username: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error('Invalid credentials');
  return res.json();
}

export async function apiGetProducts() {
  const res = await fetch(`${API_BASE}/products`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function apiCreateProduct(data: FormData | object) {
  const isFormData = data instanceof FormData;
  
  const headers = authHeaders();
  if (isFormData) {
    delete (headers as any)['Content-Type'];
  }

  const res = await fetch(`${API_BASE}/products`, {
    method: 'POST',
    headers,
    body: isFormData ? data as FormData : JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create product');
  return res.json();
}

export async function apiUpdateProduct(id: number, data: FormData | object) {
  const isFormData = data instanceof FormData;
  
  // We need to carefully merge authHeaders but remove Content-Type if it's FormData
  const headers = authHeaders();
  if (isFormData) {
    delete (headers as any)['Content-Type'];
  }

  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'PUT',
    headers,
    body: isFormData ? data as FormData : JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update product');
  return res.json();
}

export async function apiDeleteProduct(id: number) {
  const res = await fetch(`${API_BASE}/products/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete product');
  return res.json();
}

export async function apiGetOrders() {
  const res = await fetch(`${API_BASE}/orders`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch orders');
  return res.json();
}

export async function apiUpdateOrderStatus(id: number, status: string) {
  const res = await fetch(`${API_BASE}/orders/${id}/status`, {
    method: 'PATCH',
    headers: authHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update order status');
  return res.json();
}

export async function apiGetCategories() {
  const res = await fetch(`${API_BASE}/categories`, { headers: authHeaders() });
  if (!res.ok) throw new Error('Failed to fetch categories');
  return res.json();
}

export async function apiCreateCategory(name: string) {
  const res = await fetch(`${API_BASE}/categories`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to create category');
  return res.json();
}

export async function apiUpdateCategory(id: number, name: string) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error('Failed to update category');
  return res.json();
}

export async function apiDeleteCategory(id: number) {
  const res = await fetch(`${API_BASE}/categories/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to delete category');
  }
  return true;
}
