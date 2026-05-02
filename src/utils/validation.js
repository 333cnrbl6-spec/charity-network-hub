/**
 * Input validation utilities for CharityHub
 * Used across all forms to prevent invalid data and provide clear feedback
 */

const VALIDATION_RULES = {
  // Email validation
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  // UK postcode validation (basic)
  postcode: {
    pattern: /^[A-Z]{1,2}\d{1,2} \d[A-Z]{2}$/i,
    message: 'Please enter a valid UK postcode (e.g., M1 1AA)'
  },
  // UK phone number
  phone: {
    pattern: /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/,
    message: 'Please enter a valid UK phone number'
  },
  // Charity number (UK: 1-7 digits)
  charityNumber: {
    pattern: /^\d{1,7}$/,
    message: 'UK charity number should be 1-7 digits'
  },
  // URL
  url: {
    pattern: /^https?:\/\/.+\..+/,
    message: 'Please enter a valid URL (starting with http:// or https://)'
  }
};

/**
 * Validate a single field value against a rule
 * @param {string} value - Value to validate
 * @param {string} rule - Rule key (email, postcode, etc.)
 * @returns {object} { valid: boolean, error: string|null }
 */
export function validateField(value, rule) {
  if (!value) {
    return { valid: false, error: 'This field is required' };
  }

  if (!VALIDATION_RULES[rule]) {
    return { valid: true, error: null };
  }

  const { pattern, message } = VALIDATION_RULES[rule];
  const valid = pattern.test(value.trim());

  return {
    valid,
    error: valid ? null : message
  };
}

/**
 * Validate amount is positive number
 */
export function validateAmount(value) {
  const num = parseFloat(value);
  if (isNaN(num) || num < 0) {
    return { valid: false, error: 'Please enter a valid positive amount' };
  }
  if (num > 1000000) {
    return { valid: false, error: 'Amount cannot exceed £1,000,000' };
  }
  return { valid: true, error: null };
}

/**
 * Validate date is in future (for deadlines, etc.)
 */
export function validateFutureDate(value) {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Please enter a valid date' };
  }
  if (date < new Date()) {
    return { valid: false, error: 'Date must be in the future' };
  }
  return { valid: true, error: null };
}

/**
 * Validate file upload
 * @param {File} file - File object
 * @param {object} options - { maxSizeMB: 50, allowedTypes: ['pdf', 'jpg'] }
 */
export function validateFile(file, options = {}) {
  const maxSizeMB = options.maxSizeMB || 50;
  const allowedTypes = options.allowedTypes || ['pdf', 'doc', 'docx', 'jpg', 'png'];

  if (!file) {
    return { valid: false, error: 'Please select a file' };
  }

  const sizeMB = file.size / (1024 * 1024);
  if (sizeMB > maxSizeMB) {
    return { valid: false, error: `File must be smaller than ${maxSizeMB}MB` };
  }

  const ext = file.name.split('.').pop().toLowerCase();
  if (!allowedTypes.includes(ext)) {
    return { valid: false, error: `Allowed file types: ${allowedTypes.join(', ')}` };
  }

  return { valid: true, error: null };
}

/**
 * Validate charity data object
 */
export function validateCharityData(data) {
  const errors = {};

  if (!data.name?.trim()) errors.name = 'Charity name is required';
  if (!data.charity_number?.trim()) errors.charity_number = 'Charity number is required';
  if (!data.cause_area) errors.cause_area = 'Cause area is required';

  if (data.charity_number && !VALIDATION_RULES.charityNumber.pattern.test(data.charity_number)) {
    errors.charity_number = 'Invalid UK charity number format';
  }

  if (data.website && !VALIDATION_RULES.url.pattern.test(data.website)) {
    errors.website = 'Invalid website URL';
  }

  if (data.annual_income !== undefined && data.annual_income < 0) {
    errors.annual_income = 'Annual income cannot be negative';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Validate donor data
 */
export function validateDonorData(data) {
  const errors = {};

  if (!data.name?.trim()) errors.name = 'Donor name is required';
  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!VALIDATION_RULES.email.pattern.test(data.email)) {
    errors.email = 'Invalid email address';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitize text input (prevent XSS)
 */
export function sanitizeInput(value) {
  if (typeof value !== 'string') return value;
  
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Validate donation data
 */
export function validateDonationData(data) {
  const errors = {};

  if (!data.donor_id?.trim()) errors.donor_id = 'Please select a donor';
  if (!data.amount) {
    errors.amount = 'Amount is required';
  } else {
    const amountCheck = validateAmount(data.amount);
    if (!amountCheck.valid) errors.amount = amountCheck.error;
  }

  if (!data.donation_date) {
    errors.donation_date = 'Date is required';
  } else if (new Date(data.donation_date) > new Date()) {
    errors.donation_date = 'Donation date cannot be in the future';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}