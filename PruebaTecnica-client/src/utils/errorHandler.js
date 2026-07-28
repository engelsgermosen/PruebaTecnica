import { HTTP_STATUS } from '../constants';
import logger from './logger';

export class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export const handleApiError = (error, navigate) => {
  logger.error('API Error:', error);

  // Network error
  if (!error.response) {
    return {
      message: 'Error de conexión. Verifica tu internet.',
      shouldRedirect: false,
    };
  }

  const { status, data } = error.response;

  switch (status) {
    case HTTP_STATUS.UNAUTHORIZED:
      sessionStorage.clear();
      if (navigate) navigate('/login');
      return {
        message: 'Sesión expirada. Por favor, inicia sesión nuevamente.',
        shouldRedirect: true,
      };

    case HTTP_STATUS.FORBIDDEN:
      return {
        message: 'No tienes permisos para realizar esta acción.',
        shouldRedirect: false,
      };

    case HTTP_STATUS.NOT_FOUND:
      return {
        message: 'Recurso no encontrado.',
        shouldRedirect: false,
      };

    case HTTP_STATUS.CONFLICT:
      return {
        message: data?.detail || 'El recurso ya existe.',
        shouldRedirect: false,
      };

    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return {
        message: data?.detail || 'Datos inválidos.',
        shouldRedirect: false,
      };

    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      return {
        message: 'Error del servidor. Intenta más tarde.',
        shouldRedirect: false,
      };

    default:
      return {
        message: data?.detail || 'Ocurrió un error inesperado.',
        shouldRedirect: false,
      };
  }
};

export const getErrorMessage = (error) => {
  if (error.response?.data?.detail) {
    return error.response.data.detail;
  }
  if (error.message) {
    return error.message;
  }
  return 'Ocurrió un error inesperado.';
};
