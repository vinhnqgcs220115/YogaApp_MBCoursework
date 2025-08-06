/**
 * DATA MODELS - Based on your Java entities
 * These models provide structure, validation, and type checking
 */

/**
 * YogaCourse Model - Based on YogaCourse.java
 */
export class YogaCourseModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.dayOfWeek = data.dayOfWeek || '';
    this.time = data.time || '';
    this.capacity = data.capacity || 0;
    this.duration = data.duration || 0;
    this.price = data.price || 0.0;
    this.type = data.type || '';
    this.description = data.description || '';
    this.lastUpdated = data.lastUpdated || null;
  }

  // Validate required fields
  validate() {
    const errors = [];
    const requiredFields = [
      'dayOfWeek',
      'time',
      'capacity',
      'duration',
      'price',
      'type',
    ];

    requiredFields.forEach((field) => {
      if (
        !this[field] ||
        (typeof this[field] === 'string' && this[field].trim() === '')
      ) {
        errors.push(`${field} is required`);
      }
    });

    // Type-specific validations
    if (
      this.capacity &&
      (typeof this.capacity !== 'number' || this.capacity <= 0)
    ) {
      errors.push('Capacity must be a positive number');
    }

    if (
      this.duration &&
      (typeof this.duration !== 'number' || this.duration <= 0)
    ) {
      errors.push('Duration must be a positive number');
    }

    if (this.price && (typeof this.price !== 'number' || this.price < 0)) {
      errors.push('Price must be a non-negative number');
    }

    // Valid days of week
    const validDays = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    if (this.dayOfWeek && !validDays.includes(this.dayOfWeek)) {
      errors.push('Day of week must be a valid day name');
    }

    // Valid class types
    const validTypes = ['Flow Yoga', 'Aerial Yoga', 'Family Yoga'];
    if (this.type && !validTypes.includes(this.type)) {
      errors.push('Class type must be one of: ' + validTypes.join(', '));
    }

    // Time format validation (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (this.time && !timeRegex.test(this.time)) {
      errors.push('Time must be in HH:MM format');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Convert to Firestore format
  toFirestore() {
    return {
      dayOfWeek: this.dayOfWeek,
      time: this.time,
      capacity: parseInt(this.capacity),
      duration: parseInt(this.duration),
      price: parseFloat(this.price),
      type: this.type,
      description: this.description,
      lastUpdated: Date.now(),
    };
  }

  // Create from Firestore data
  static fromFirestore(id, data) {
    return new YogaCourseModel({
      id,
      ...data,
    });
  }

  // Format for display
  getDisplayFormat() {
    return {
      id: this.id,
      title: this.type,
      subtitle: `${this.dayOfWeek}s at ${this.time}`,
      description: this.description,
      duration: `${this.duration} minutes`,
      price: `£${this.price.toFixed(2)}`,
      capacity: `${this.capacity} people`,
      dayOfWeek: this.dayOfWeek,
      time: this.time,
      type: this.type,
    };
  }
}

/**
 * Schedule Model - Based on Schedule.java
 */
export class ScheduleModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.courseId = data.courseId || 0;
    this.date = data.date || '';
    this.teacher = data.teacher || '';
    this.comments = data.comments || '';
    this.lastUpdated = data.lastUpdated || null;
    this.bookings = data.bookings || [];
  }

  // Validate required fields
  validate() {
    const errors = [];
    const requiredFields = ['courseId', 'date', 'teacher'];

    requiredFields.forEach((field) => {
      if (
        !this[field] ||
        (typeof this[field] === 'string' && this[field].trim() === '')
      ) {
        errors.push(`${field} is required`);
      }
    });

    // Date format validation (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (this.date && !dateRegex.test(this.date)) {
      errors.push('Date must be in YYYY-MM-DD format');
    }

    // Date must be in future
    if (this.date) {
      const scheduleDate = new Date(this.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (scheduleDate < today) {
        errors.push('Schedule date must be in the future');
      }
    }

    // CourseId must be a number
    if (
      this.courseId &&
      (typeof this.courseId !== 'number' || this.courseId <= 0)
    ) {
      errors.push('Course ID must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Convert to Firestore format
  toFirestore() {
    return {
      courseId: parseInt(this.courseId),
      date: this.date,
      teacher: this.teacher,
      comments: this.comments,
      bookings: this.bookings,
      lastUpdated: Date.now(),
    };
  }

  // Create from Firestore data
  static fromFirestore(id, data) {
    return new ScheduleModel({
      id,
      ...data,
    });
  }

  // Format for display
  getDisplayFormat() {
    const date = new Date(this.date + 'T00:00:00');
    return {
      id: this.id,
      courseId: this.courseId,
      date: this.date,
      dateFormatted: date.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      teacher: this.teacher,
      comments: this.comments || 'No additional comments',
      bookingCount: this.bookings ? this.bookings.length : 0,
    };
  }

  // Check if this schedule is bookable
  isBookable(classCapacity) {
    const today = new Date().toISOString().split('T')[0];
    const isInFuture = this.date > today;
    const currentBookings = this.bookings ? this.bookings.length : 0;
    const hasCapacity = currentBookings < classCapacity;

    return isInFuture && hasCapacity;
  }

  // Get available spots
  getAvailableSpots(classCapacity) {
    const currentBookings = this.bookings ? this.bookings.length : 0;
    return Math.max(0, classCapacity - currentBookings);
  }
}

/**
 * User Model
 */
export class UserModel {
  constructor(data = {}) {
    this.uid = data.uid || '';
    this.email = data.email || '';
    this.displayName = data.displayName || '';
    this.phoneNumber = data.phoneNumber || '';
    this.photoURL = data.photoURL || '';
    this.preferences = data.preferences || {
      notifications: true,
      newsletter: false,
    };
    this.bookings = data.bookings || [];
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  validate() {
    const errors = [];

    if (!this.uid || this.uid.trim() === '') {
      errors.push('User ID is required');
    }

    if (!this.email || this.email.trim() === '') {
      errors.push('Email is required');
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(this.email)) {
        errors.push('Email format is invalid');
      }
    }

    if (!this.displayName || this.displayName.trim() === '') {
      errors.push('Display name is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  toFirestore() {
    return {
      email: this.email,
      displayName: this.displayName,
      phoneNumber: this.phoneNumber,
      photoURL: this.photoURL,
      preferences: this.preferences,
      bookings: this.bookings,
      updatedAt: new Date().toISOString(),
    };
  }

  static fromFirestore(uid, data) {
    return new UserModel({
      uid,
      ...data,
    });
  }

  getDisplayFormat() {
    return {
      uid: this.uid,
      name: this.displayName,
      email: this.email,
      phone: this.phoneNumber || 'Not provided',
      joinDate: this.createdAt
        ? new Date(this.createdAt).toLocaleDateString('en-GB')
        : 'N/A',
      totalBookings: this.bookings ? this.bookings.length : 0,
    };
  }
}

/**
 * Booking Model
 */
export class BookingModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || '';
    this.userEmail = data.userEmail || '';
    this.items = data.items || [];
    this.summary = data.summary || {
      totalAmount: 0,
      totalItems: 0,
      totalQuantity: 0,
    };
    this.status = data.status || 'pending';
    this.bookingDate = data.bookingDate || null;
    this.cancelledAt = data.cancelledAt || null;
    this.paymentDetails = data.paymentDetails || null;
    this.createdAt = data.createdAt || null;
    this.updatedAt = data.updatedAt || null;
  }

  validate() {
    const errors = [];

    if (!this.userId || this.userId.trim() === '') {
      errors.push('User ID is required');
    }

    if (!this.userEmail || this.userEmail.trim() === '') {
      errors.push('User email is required');
    }

    if (!this.items || !Array.isArray(this.items) || this.items.length === 0) {
      errors.push('Booking must contain at least one item');
    }

    // Validate each item
    this.items.forEach((item, index) => {
      const itemErrors = this.validateBookingItem(item);
      if (itemErrors.length > 0) {
        errors.push(`Item ${index + 1}: ${itemErrors.join(', ')}`);
      }
    });

    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (this.status && !validStatuses.includes(this.status)) {
      errors.push('Status must be one of: ' + validStatuses.join(', '));
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  validateBookingItem(item) {
    const errors = [];
    const requiredFields = ['courseId', 'instanceId', 'className', 'price'];

    requiredFields.forEach((field) => {
      if (
        !item[field] ||
        (typeof item[field] === 'string' && item[field].trim() === '')
      ) {
        errors.push(`${field} is required`);
      }
    });

    if (item.price && (typeof item.price !== 'number' || item.price < 0)) {
      errors.push('Price must be a non-negative number');
    }

    if (
      item.quantity &&
      (typeof item.quantity !== 'number' || item.quantity <= 0)
    ) {
      errors.push('Quantity must be a positive number');
    }

    return errors;
  }

  toFirestore() {
    return {
      userId: this.userId,
      userEmail: this.userEmail,
      items: this.items,
      summary: this.summary,
      status: this.status,
      bookingDate: this.bookingDate,
      cancelledAt: this.cancelledAt,
      paymentDetails: this.paymentDetails,
      updatedAt: new Date().toISOString(),
    };
  }

  static fromFirestore(id, data) {
    return new BookingModel({
      id,
      ...data,
    });
  }

  getDisplayFormat() {
    return {
      id: this.id,
      bookingReference: this.id ? this.id.slice(-8).toUpperCase() : 'N/A',
      userEmail: this.userEmail,
      totalAmount: `£${this.summary.totalAmount?.toFixed(2) || '0.00'}`,
      totalItems: this.summary.totalItems || 0,
      status:
        this.status?.charAt(0).toUpperCase() + this.status?.slice(1) ||
        'Unknown',
      bookingDate: this.bookingDate
        ? new Date(this.bookingDate.toDate()).toLocaleDateString('en-GB')
        : 'N/A',
      isCancellable: this.status === 'confirmed' && this.hasUpcomingClasses(),
      upcomingClasses: this.getUpcomingClasses(),
      pastClasses: this.getPastClasses(),
    };
  }

  hasUpcomingClasses() {
    const today = new Date().toISOString().split('T')[0];
    return this.items.some((item) => item.date && item.date > today);
  }

  getUpcomingClasses() {
    const today = new Date().toISOString().split('T')[0];
    return this.items
      .filter((item) => item.date && item.date > today)
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  getPastClasses() {
    const today = new Date().toISOString().split('T')[0];
    return this.items
      .filter((item) => item.date && item.date <= today)
      .sort((a, b) => b.date.localeCompare(a.date));
  }

  calculateTotal() {
    return this.items.reduce((sum, item) => {
      return sum + item.price * (item.quantity || 1);
    }, 0);
  }
}

/**
 * Cart Item Model
 */
export class CartItemModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.userId = data.userId || '';
    this.courseId = data.courseId || 0;
    this.instanceId = data.instanceId || '';
    this.className = data.className || '';
    this.classType = data.classType || '';
    this.teacher = data.teacher || '';
    this.date = data.date || '';
    this.time = data.time || '';
    this.duration = data.duration || 0;
    this.price = data.price || 0;
    this.quantity = data.quantity || 1;
    this.dayOfWeek = data.dayOfWeek || '';
    this.capacity = data.capacity || 0;
    this.description = data.description || '';
    this.comments = data.comments || '';
    this.addedAt = data.addedAt || null;
    this.status = data.status || 'pending';
  }

  validate() {
    const errors = [];
    const requiredFields = [
      'userId',
      'courseId',
      'instanceId',
      'className',
      'price',
    ];

    requiredFields.forEach((field) => {
      if (
        !this[field] ||
        (typeof this[field] === 'string' && this[field].trim() === '')
      ) {
        errors.push(`${field} is required`);
      }
    });

    if (this.price && (typeof this.price !== 'number' || this.price < 0)) {
      errors.push('Price must be a non-negative number');
    }

    if (
      this.quantity &&
      (typeof this.quantity !== 'number' || this.quantity <= 0)
    ) {
      errors.push('Quantity must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  toFirestore() {
    return {
      userId: this.userId,
      courseId: parseInt(this.courseId),
      instanceId: this.instanceId,
      className: this.className,
      classType: this.classType,
      teacher: this.teacher,
      date: this.date,
      time: this.time,
      duration: parseInt(this.duration),
      price: parseFloat(this.price),
      quantity: parseInt(this.quantity),
      dayOfWeek: this.dayOfWeek,
      capacity: parseInt(this.capacity),
      description: this.description,
      comments: this.comments,
      status: this.status,
      addedAt: this.addedAt || new Date(),
    };
  }

  static fromFirestore(id, data) {
    return new CartItemModel({
      id,
      ...data,
    });
  }

  getDisplayFormat() {
    const totalPrice = this.price * this.quantity;
    return {
      id: this.id,
      title: this.className,
      subtitle: `${this.dayOfWeek} at ${this.time}`,
      teacher: this.teacher,
      date: this.date
        ? new Date(this.date + 'T00:00:00').toLocaleDateString('en-GB')
        : 'N/A',
      time: this.time,
      duration: `${this.duration} mins`,
      price: `£${this.price.toFixed(2)}`,
      quantity: this.quantity,
      totalPrice: `£${totalPrice.toFixed(2)}`,
      description: this.description,
      comments: this.comments || 'No additional notes',
    };
  }

  // Convert to booking item format
  toBookingItem() {
    return {
      courseId: this.courseId,
      instanceId: this.instanceId,
      className: this.className,
      classType: this.classType,
      teacher: this.teacher,
      date: this.date,
      time: this.time,
      duration: this.duration,
      price: this.price,
      quantity: this.quantity,
      dayOfWeek: this.dayOfWeek,
      description: this.description,
      comments: this.comments,
    };
  }
}

/**
 * API INTEGRATION UTILITIES
 */

/**
 * Firestore Helper Functions
 */
export const firestoreHelpers = {
  // Convert Firestore timestamp to Date
  timestampToDate: (timestamp) => {
    if (!timestamp) return null;
    if (timestamp.toDate) return timestamp.toDate();
    if (timestamp.seconds) return new Date(timestamp.seconds * 1000);
    return new Date(timestamp);
  },

  // Convert Date to Firestore timestamp
  dateToTimestamp: (date) => {
    if (!date) return null;
    return new Date(date);
  },

  // Sanitize data for Firestore (remove undefined values)
  sanitizeForFirestore: (data) => {
    const sanitized = {};
    Object.keys(data).forEach((key) => {
      if (data[key] !== undefined && data[key] !== null) {
        sanitized[key] = data[key];
      }
    });
    return sanitized;
  },

  // Handle Firestore errors
  handleFirestoreError: (error, operation) => {
    console.error(`Firestore error during ${operation}:`, error);

    // Map common Firestore errors to user-friendly messages
    const errorMap = {
      'permission-denied': 'You do not have permission to perform this action',
      'not-found': 'The requested data was not found',
      'already-exists': 'This data already exists',
      'resource-exhausted': 'Too many requests. Please try again later',
      unauthenticated: 'Please sign in to continue',
      unavailable: 'Service is temporarily unavailable. Please try again',
    };

    const userMessage = errorMap[error.code] || 'An unexpected error occurred';

    return {
      code: error.code,
      message: userMessage,
      originalError: error.message,
      operation,
    };
  },
};

/**
 * Data Validation Utilities
 */
export const validationUtils = {
  // Email validation
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Phone number validation (UK format)
  isValidPhoneNumber: (phone) => {
    const phoneRegex = /^(\+44\s?7\d{3}|\(?07\d{3}\)?)\s?\d{3}\s?\d{3}$/;
    return phoneRegex.test(phone);
  },

  // Date validation (YYYY-MM-DD format)
  isValidDate: (dateString) => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;

    const date = new Date(dateString);
    const [year, month, day] = dateString
      .split('-')
      .map((num) => parseInt(num));

    return (
      date.getFullYear() === year &&
      date.getMonth() === month - 1 &&
      date.getDate() === day
    );
  },

  // Time validation (HH:MM format)
  isValidTime: (timeString) => {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(timeString);
  },

  // Price validation
  isValidPrice: (price) => {
    return typeof price === 'number' && price >= 0 && price <= 1000;
  },

  // Capacity validation
  isValidCapacity: (capacity) => {
    return Number.isInteger(capacity) && capacity > 0 && capacity <= 100;
  },

  // Duration validation (in minutes)
  isValidDuration: (duration) => {
    return Number.isInteger(duration) && duration > 0 && duration <= 480; // Max 8 hours
  },
};

/**
 * Search and Filter Utilities
 */
export const searchUtils = {
  // Text search (case-insensitive, partial match)
  textMatch: (searchTerm, text) => {
    if (!searchTerm || !text) return false;
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  },

  // Filter classes by search criteria
  filterClasses: (classes, filters) => {
    return classes.filter((classItem) => {
      // Text search
      if (filters.search) {
        const searchFields = [
          classItem.type,
          classItem.description,
          classItem.dayOfWeek,
        ];
        if (
          !searchFields.some(
            (field) => field && searchUtils.textMatch(filters.search, field)
          )
        ) {
          return false;
        }
      }

      // Day of week filter
      if (filters.dayOfWeek && classItem.dayOfWeek !== filters.dayOfWeek) {
        return false;
      }

      // Class type filter
      if (filters.type && classItem.type !== filters.type) {
        return false;
      }

      // Price range filter
      if (filters.maxPrice && classItem.price > filters.maxPrice) {
        return false;
      }
      if (filters.minPrice && classItem.price < filters.minPrice) {
        return false;
      }

      // Duration filter
      if (filters.maxDuration && classItem.duration > filters.maxDuration) {
        return false;
      }
      if (filters.minDuration && classItem.duration < filters.minDuration) {
        return false;
      }

      // Time filter
      if (filters.time && classItem.time !== filters.time) {
        return false;
      }

      return true;
    });
  },

  // Sort classes
  sortClasses: (classes, sortBy = 'dayOfWeek') => {
    const sortFunctions = {
      dayOfWeek: (a, b) => {
        const days = [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ];
        const aIndex = days.indexOf(a.dayOfWeek);
        const bIndex = days.indexOf(b.dayOfWeek);
        if (aIndex !== bIndex) return aIndex - bIndex;
        return a.time.localeCompare(b.time);
      },
      price: (a, b) => a.price - b.price,
      priceDesc: (a, b) => b.price - a.price,
      duration: (a, b) => a.duration - b.duration,
      type: (a, b) => a.type.localeCompare(b.type),
      time: (a, b) => a.time.localeCompare(b.time),
    };

    const sortFn = sortFunctions[sortBy] || sortFunctions.dayOfWeek;
    return [...classes].sort(sortFn);
  },

  // Filter schedules by date range
  filterSchedulesByDateRange: (schedules, startDate, endDate) => {
    return schedules.filter((schedule) => {
      if (!schedule.date) return false;
      if (startDate && schedule.date < startDate) return false;
      if (endDate && schedule.date > endDate) return false;
      return true;
    });
  },
};

/**
 * Display Formatting Utilities
 */
export const formatUtils = {
  // Format currency
  formatPrice: (price) => `£${(price || 0).toFixed(2)}`,

  // Format duration
  formatDuration: (minutes) => {
    if (!minutes) return '0 mins';
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  },

  // Format date
  formatDate: (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Invalid date';
    }
  },

  // Format short date
  formatDateShort: (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('en-GB');
    } catch (error) {
      return 'Invalid date';
    }
  },

  // Format time
  formatTime: (timeString) => {
    if (!timeString) return 'N/A';
    // Convert 24-hour to 12-hour format
    try {
      const [hours, minutes] = timeString.split(':');
      const hour12 = parseInt(hours) % 12 || 12;
      const ampm = parseInt(hours) >= 12 ? 'PM' : 'AM';
      return `${hour12}:${minutes} ${ampm}`;
    } catch (error) {
      return timeString; // Return original if formatting fails
    }
  },

  // Format capacity
  formatCapacity: (current, total) => {
    if (typeof current !== 'number' || typeof total !== 'number') {
      return 'N/A';
    }
    const available = Math.max(0, total - current);
    return `${available} of ${total} spots available`;
  },

  // Generate display title for class
  generateClassTitle: (classData) => {
    return `${classData.type} - ${
      classData.dayOfWeek
    }s at ${formatUtils.formatTime(classData.time)}`;
  },

  // Generate schedule display title
  generateScheduleTitle: (schedule, classData) => {
    const className = classData?.type || 'Yoga Class';
    const dateFormatted = formatUtils.formatDateShort(schedule.date);
    return `${className} - ${dateFormatted} with ${schedule.teacher}`;
  },
};

/**
 * Export all models and utilities
 */
export {
  YogaCourseModel,
  ScheduleModel,
  UserModel,
  BookingModel,
  CartItemModel,
  firestoreHelpers,
  validationUtils,
  searchUtils,
  formatUtils,
};

// Default export with all utilities
export default {
  models: {
    YogaCourse: YogaCourseModel,
    Schedule: ScheduleModel,
    User: UserModel,
    Booking: BookingModel,
    CartItem: CartItemModel,
  },
  helpers: {
    firestore: firestoreHelpers,
    validation: validationUtils,
    search: searchUtils,
    format: formatUtils,
  },
};
