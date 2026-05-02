/**
 * API Error Handler — converts backend errors to user-friendly messages
 * Use this across all API calls to ensure consistent error messaging
 */

export class APIError extends Error {
  constructor(message, code, statusCode = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = 'APIError';
  }
}

/**
 * Parse API error response and return user-friendly message
 * @param {Error|Response} error - Error or response object
 * @returns {object} { message: string, code: string, retryable: boolean }
 */
export function parseAPIError(error) {
  // Network error (no connection, timeout, etc.)
  if (!error.response) {
    return {
      message: 'Network error. Please check your connection and try again.',
      code: 'NETWORK_ERROR',
      retryable: true
    };
  }

  const status = error.response?.status;
  const data = error.response?.data;

  // 400 Bad Request
  if (status === 400) {
    return {
      message: data?.message || 'Invalid request. Please check your input and try again.',
      code: 'BAD_REQUEST',
      retryable: false
    };
  }

  // 401 Unauthorized
  if (status === 401) {
    return {
      message: 'Your session has expired. Please log in again.',
      code: 'UNAUTHORIZED',
      retryable: false,
      redirect: '/login'
    };
  }

  // 403 Forbidden
  if (status === 403) {
    return {
      message: 'You do not have permission to perform this action.',
      code: 'FORBIDDEN',
      retryable: false
    };
  }

  // 404 Not Found
  if (status === 404) {
    return {
      message: 'The requested resource was not found.',
      code: 'NOT_FOUND',
      retryable: false
    };
  }

  // 409 Conflict (e.g., duplicate)
  if (status === 409) {
    return {
      message: data?.message || 'This record already exists. Please use a different value.',
      code: 'CONFLICT',
      retryable: false
    };
  }

  // 422 Unprocessable Entity (validation)
  if (status === 422) {
    return {
      message: data?.message || 'Validation failed. Please check your input.',
      code: 'VALIDATION_ERROR',
      retryable: false,
      errors: data?.errors || {}
    };
  }

  // 429 Too Many Requests (rate limit)
  if (status === 429) {
    return {
      message: 'Too many requests. Please wait a moment and try again.',
      code: 'RATE_LIMITED',
      retryable: true,
      retryAfter: parseInt(error.response?.headers?.['retry-after']) || 60
    };
  }

  // 500+ Server Error
  if (status >= 500) {
    return {
      message: 'Server error. Our team has been notified. Please try again in a moment.',
      code: 'SERVER_ERROR',
      retryable: true
    };
  }

  // Unknown error
  return {
    message: 'An unexpected error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    retryable: true
  };
}

/**
 * Wrap an async function with error handling and retry logic
 * @param {Function} fn - Async function to wrap
 * @param {object} options - { maxRetries: 3, retryDelay: 1000 }
 */
export async function withRetry(fn, options = {}) {
  const maxRetries = options.maxRetries || 3;
  const retryDelay = options.retryDelay || 1000;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const parsed = parseAPIError(error);

      // Don't retry non-retryable errors
      if (!parsed.retryable) {
        throw new APIError(parsed.message, parsed.code, error.response?.status);
      }

      // Don't retry after last attempt
      if (attempt === maxRetries) break;

      // Wait before retry
      const delay = parsed.retryAfter ? parsed.retryAfter * 1000 : retryDelay * attempt;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  const parsed = parseAPIError(lastError);
  throw new APIError(parsed.message, parsed.code, lastError.response?.status);
}

/**
 * Handle LLM API errors specifically
 */
export function parseLLMError(error) {
  if (error.message?.includes('timeout')) {
    return {
      message: 'The AI service took too long to respond. Please try again.',
      code: 'LLM_TIMEOUT',
      retryable: true
    };
  }

  if (error.message?.includes('rate limit')) {
    return {
      message: 'You\'ve made too many requests. Please wait a few moments and try again.',
      code: 'LLM_RATE_LIMIT',
      retryable: true
    };
  }

  if (error.message?.includes('invalid')) {
    return {
      message: 'The AI service rejected your input. Please check your data and try again.',
      code: 'LLM_INVALID_INPUT',
      retryable: false
    };
  }

  return {
    message: 'The AI service is temporarily unavailable. Please try again in a few moments.',
    code: 'LLM_ERROR',
    retryable: true
  };
}