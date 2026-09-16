import { PUBLIC_API_URL } from '$env/static/public';

const API_URL = PUBLIC_API_URL.replace(/\/$/, '');

export async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.detail || 'No fue posible completar la operación.');
  }
  return response.status === 204 ? null : response.json();
}

export const api = {
  list: (resource) => request(`/${resource}/`),
  create: (resource, data) => request(`/${resource}/`, { method: 'POST', body: JSON.stringify(data) }),
  update: (resource, id, data) => request(`/${resource}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  remove: (resource, id) => request(`/${resource}/${id}`, { method: 'DELETE' }),
};
