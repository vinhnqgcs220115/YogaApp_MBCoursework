/**
 * Date formatting utilities
 */
export const dateHelpers = {
  // Format date to readable string
  formatDate: (date) => {
    if (!date) return '';
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },

  // Format time to readable string
  formatTime: (time) => {
    if (!time) return '';
    const timeObj = time instanceof Date ? time : new Date(time);
    return timeObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  },

  // Check if date is today
  isToday: (date) => {
    if (!date) return false;
    const today = new Date();
    const checkDate = date instanceof Date ? date : new Date(date);
    return (
      checkDate.getDate() === today.getDate() &&
      checkDate.getMonth() === today.getMonth() &&
      checkDate.getFullYear() === today.getFullYear()
    );
  },

  // Check if date is in the future
  isFuture: (date) => {
    if (!date) return false;
    const now = new Date();
    const checkDate = date instanceof Date ? date : new Date(date);
    return checkDate > now;
  },
};

/**
 * String utilities
 */
export const stringHelpers = {
  // Capitalize first letter
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Convert to title case
  toTitleCase: (str) => {
    if (!str) return '';
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  },

  // Truncate text with ellipsis
  truncate: (str, length = 100) => {
    if (!str) return '';
    return str.length > length ? str.substring(0, length) + '...' : str;
  },

  // Generate initials from name
  getInitials: (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  },
};

/**
 * Number utilities
 */
export const numberHelpers = {
  // Format currency
  formatCurrency: (amount, currency = 'USD') => {
    if (amount === null || amount === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  },

  // Format large numbers
  formatNumber: (num) => {
    if (!num) return '0';
    return new Intl.NumberFormat().format(num);
  },
};

/**
 * Validation utilities
 */
export const validationHelpers = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone validation (basic)
  isValidPhone: (phone) => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  },

  // Password strength
  getPasswordStrength: (password) => {
    if (!password) return { score: 0, message: 'Password required' };

    let score = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    Object.values(checks).forEach((check) => check && score++);

    if (score < 2) return { score, message: 'Weak' };
    if (score < 4) return { score, message: 'Medium' };
    return { score, message: 'Strong' };
  },
};

/**
 * Array utilities
 */
export const arrayHelpers = {
  // Remove duplicates
  removeDuplicates: (array, key) => {
    if (!key) return [...new Set(array)];
    return array.filter(
      (item, index, self) =>
        index === self.findIndex((t) => t[key] === item[key])
    );
  },

  // Sort by property
  sortBy: (array, key, direction = 'asc') => {
    return [...array].sort((a, b) => {
      if (direction === 'asc') {
        return a[key] > b[key] ? 1 : -1;
      }
      return a[key] < b[key] ? 1 : -1;
    });
  },

  // Group by property
  groupBy: (array, key) => {
    return array.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {});
  },
};

/**
 * Error handling utilities
 */
export const errorHelpers = {
  // Get user-friendly error message
  getErrorMessage: (error) => {
    if (typeof error === 'string') return error;

    // Firebase Auth errors
    if (error?.code) {
      switch (error.code) {
        case 'auth/user-not-found':
          return 'No account found with this email address.';
        case 'auth/wrong-password':
          return 'Incorrect password. Please try again.';
        case 'auth/email-already-in-use':
          return 'An account with this email already exists.';
        case 'auth/weak-password':
          return 'Password should be at least 6 characters long.';
        case 'auth/invalid-email':
          return 'Please enter a valid email address.';
        case 'auth/network-request-failed':
          return 'Network error. Please check your connection.';
        default:
          return error.message || 'An unexpected error occurred.';
      }
    }

    return error?.message || 'An unexpected error occurred.';
  },
};

/**
 * Storage utilities
 */
export const storageHelpers = {
  // Safe JSON parsing
  parseJSON: (str, fallback = null) => {
    try {
      return JSON.parse(str);
    } catch {
      return fallback;
    }
  },

  // Safe JSON stringifying
  stringifyJSON: (obj, fallback = '{}') => {
    try {
      return JSON.stringify(obj);
    } catch {
      return fallback;
    }
  },
};

/**
 * Performance utilities
 */
export const performanceHelpers = {
  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle: (func, limit) => {
    let inThrottle;
    return function executedFunction(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
};

// Export all helpers as default object
export default {
  date: dateHelpers,
  string: stringHelpers,
  number: numberHelpers,
  validation: validationHelpers,
  array: arrayHelpers,
  error: errorHelpers,
  storage: storageHelpers,
  performance: performanceHelpers,
};
