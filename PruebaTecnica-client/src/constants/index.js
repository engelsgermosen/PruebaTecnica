export const API_CONFIG = {
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT) || 10000,
  BASE_URL: import.meta.env.VITE_BACKEND_URL,
};

export const STORAGE_KEYS = {
  USER: 'user',
  TOKEN: 'token',
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
};

export const TAXPAYER_STATUS = {
  ACTIVE: true,
  INACTIVE: false,
};

export const FILTER_OPTIONS = {
  ALL: 'todos',
  ACTIVE: 'true',
  INACTIVE: 'false',
};

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  TAXPAYERS: '/auth/taxpayers',
  TAXPAYER_TYPES: '/auth/taxpayertypes',
  TAX_RECEIPTS: '/auth/taxreceipts',
  PRODUCTS: '/auth/products',
};
