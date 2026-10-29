// All calls to the backend go through this one helper.
export const BASE_URL = 'https://dev-project-ecommerce.upgrad.dev/api';

export async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['x-auth-token'] = token;
  }

  const response = await fetch(BASE_URL + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  // some endpoints (like delete) may return an empty body
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!response.ok) {
    const message = (data && data.message) || (typeof data === 'string' && data) || 'Something went wrong. Please try again.';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return { data, headers: response.headers };
}

// the products api can return a plain array or an object with a list inside it
export function toList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.content)) return data.content;
  return [];
}

export function getId(item) {
  return item ? item.id || item._id : undefined;
}
