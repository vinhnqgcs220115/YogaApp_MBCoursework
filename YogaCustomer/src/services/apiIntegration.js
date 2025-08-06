import {
  yogaClassService,
  classInstanceService,
  yogaServiceUtils,
} from './yogaService';
import {
  shoppingCartService,
  bookingService,
  bookingUtils,
  integrationHelpers,
} from './bookingService';
import {
  YogaCourseModel,
  ScheduleModel,
  UserModel,
  BookingModel,
  CartItemModel,
  firestoreHelpers,
  validationUtils,
  searchUtils,
  formatUtils,
} from '../utils/dataModels';

/**
 * UNIFIED API INTEGRATION LAYER
 * This layer combines all services and provides a clean interface for your React components
 * Complete implementation for Steps 5-7
 */

class YogaAppAPI {
  constructor() {
    this.services = {
      classes: yogaClassService,
      instances: classInstanceService,
      cart: shoppingCartService,
      booking: bookingService,
    };

    this.models = {
      YogaCourse: YogaCourseModel,
      Schedule: ScheduleModel,
      User: UserModel,
      Booking: BookingModel,
      CartItem: CartItemModel,
    };

    this.utils = {
      validation: validationUtils,
      search: searchUtils,
      format: formatUtils,
      firestore: firestoreHelpers,
      booking: bookingUtils,
    };
  }

  // ==================== CLASS OPERATIONS ====================

  /**
   * Get all yoga classes with proper data models and validation
   */
  async getClasses(options = {}) {
    try {
      const rawClasses = await this.services.classes.getAllClasses();

      // Convert to data models
      const classModels = rawClasses.map((classData) =>
        YogaCourseModel.fromFirestore(classData.id, classData)
      );

      // Filter valid models only
      const validClasses = classModels.filter(
        (model) => model.validate().isValid
      );

      // Apply search filters if provided
      let filteredClasses = validClasses;
      if (options.filters) {
        filteredClasses = this.utils.search.filterClasses(
          validClasses,
          options.filters
        );
      }

      // Apply sorting
      if (options.sortBy) {
        filteredClasses = this.utils.search.sortClasses(
          filteredClasses,
          options.sortBy
        );
      }

      // Return display format if requested
      if (options.displayFormat) {
        return filteredClasses.map((model) => model.getDisplayFormat());
      }

      return filteredClasses;
    } catch (error) {
      console.error('API Error - getClasses:', error);
      throw this.utils.firestore.handleFirestoreError(error, 'getClasses');
    }
  }

  /**
   * Get class by ID with validation
   */
  async getClassById(classId, options = {}) {
    try {
      const rawClass = await this.services.classes.getClassById(classId);
      const classModel = YogaCourseModel.fromFirestore(classId, rawClass);

      const validation = classModel.validate();
      if (!validation.isValid) {
        console.warn('Class validation failed:', validation.errors);
      }

      return options.displayFormat ? classModel.getDisplayFormat() : classModel;
    } catch (error) {
      console.error('API Error - getClassById:', error);
      throw this.utils.firestore.handleFirestoreError(error, 'getClassById');
    }
  }

  /**
   * Search classes with advanced options
   */
  async searchClasses(searchTerm, filters = {}, options = {}) {
    try {
      // Add text search to filters
      const searchFilters = {
        ...filters,
        search: searchTerm,
      };

      return await this.getClasses({
        filters: searchFilters,
        sortBy: options.sortBy || 'dayOfWeek',
        displayFormat: options.displayFormat,
      });
    } catch (error) {
      console.error('API Error - searchClasses:', error);
      throw this.utils.firestore.handleFirestoreError(error, 'searchClasses');
    }
  }

  // ==================== SCHEDULE OPERATIONS ====================

  /**
   * Get available schedules/instances with class details
   */
  async getAvailableSchedules(options = {}) {
    try {
      const rawSchedules =
        await this.services.instances.getAvailableInstances();

      // Convert to data models
      const scheduleModels = rawSchedules.map((scheduleData) =>
        ScheduleModel.fromFirestore(scheduleData.id, scheduleData)
      );

      // Filter valid models
      const validSchedules = scheduleModels.filter(
        (model) => model.validate().isValid
      );

      // Get class details if requested
      if (options.includeClassDetails) {
        const schedulesWithClasses = await Promise.all(
          validSchedules.map(async (schedule) => {
            try {
              const classModel = await this.getClassById(schedule.courseId);
              return {
                schedule: options.displayFormat
                  ? schedule.getDisplayFormat()
                  : schedule,
                class: options.displayFormat
                  ? classModel.getDisplayFormat()
                  : classModel,
                combined: {
                  ...schedule,
                  classDetails: classModel,
                  isBookable: schedule.isBookable(classModel.capacity),
                  availableSpots: schedule.getAvailableSpots(
                    classModel.capacity
                  ),
                },
              };
            } catch (error) {
              console.warn(
                `Could not load class ${schedule.courseId}:`,
                error.message
              );
              return {
                schedule: options.displayFormat
                  ? schedule.getDisplayFormat()
                  : schedule,
                class: null,
                combined: schedule,
              };
            }
          })
        );

        return schedulesWithClasses;
      }

      // Apply date filters
      if (options.dateRange) {
        const filtered = this.utils.search.filterSchedulesByDateRange(
          validSchedules,
          options.dateRange.start,
          options.dateRange.end
        );
        return options.displayFormat
          ? filtered.map((s) => s.getDisplayFormat())
          : filtered;
      }

      return options.displayFormat
        ? validSchedules.map((s) => s.getDisplayFormat())
        : validSchedules;
    } catch (error) {
      console.error('API Error - getAvailableSchedules:', error);
      throw this.utils.firestore.handleFirestoreError(
        error,
        'getAvailableSchedules'
      );
    }
  }

  /**
   * Get schedules for a specific class
   */
  async getSchedulesForClass(classId, options = {}) {
    try {
      const rawSchedules = await this.services.instances.getInstancesForClass(
        classId
      );

      const scheduleModels = rawSchedules.map((scheduleData) =>
        ScheduleModel.fromFirestore(scheduleData.id, scheduleData)
      );

      const validSchedules = scheduleModels.filter(
        (model) => model.validate().isValid
      );

      return options.displayFormat
        ? validSchedules.map((s) => s.getDisplayFormat())
        : validSchedules;
    } catch (error) {
      console.error('API Error - getSchedulesForClass:', error);
      throw this.utils.firestore.handleFirestoreError(
        error,
        'getSchedulesForClass'
      );
    }
  }

  /**
   * Search schedules by teacher
   */
  async searchSchedulesByTeacher(teacherName, options = {}) {
    try {
      const rawSchedules =
        await this.services.instances.searchInstancesByTeacher(teacherName);

      const scheduleModels = rawSchedules.map((scheduleData) =>
        ScheduleModel.fromFirestore(scheduleData.id, scheduleData)
      );

      const validSchedules = scheduleModels.filter(
        (model) => model.validate().isValid
      );

      return options.displayFormat
        ? validSchedules.map((s) => s.getDisplayFormat())
        : validSchedules;
    } catch (error) {
      console.error('API Error - searchSchedulesByTeacher:', error);
      throw this.utils.firestore.handleFirestoreError(
        error,
        'searchSchedulesByTeacher'
      );
    }
  }

  // ==================== CART OPERATIONS ====================

  /**
   * Add item to cart with full validation
   */
  async addToCart(userId, cartItemData, options = {}) {
    try {
      // Create and validate cart item model
      const cartModel = new CartItemModel({ userId, ...cartItemData });
      const validation = cartModel.validate();

      if (!validation.isValid) {
        throw new Error(
          `Cart item validation failed: ${validation.errors.join(', ')}`
        );
      }

      // Check availability if requested
      if (options.checkAvailability !== false) {
        await integrationHelpers.checkClassAvailability(
          cartModel.courseId,
          cartModel.instanceId
        );
      }

      // Add to cart
      const addedItem = await this.services.cart.addToCart(
        userId,
        cartModel.toFirestore()
      );

      return options.displayFormat
        ? CartItemModel.fromFirestore(
            addedItem.id,
            addedItem
          ).getDisplayFormat()
        : addedItem;
    } catch (error) {
      console.error('API Error - addToCart:', error);
      throw this.utils.firestore.handleFirestoreError(error, 'addToCart');
    }
  }

  /**
   * Get user's cart with validation and formatting
   */
  async getUserCart(userId, options = {}) {
    try {
      const rawCartItems = await this.services.cart.getUserCart(userId);

      // Convert to models and validate
      const cartModels = rawCartItems
        .map((item) => CartItemModel.fromFirestore(item.id, item))
        .filter((model) => model.validate().isValid);

      // Get cart summary
      const summary = await this.services.cart.getCartSummary(userId);

      const result = {
        items: options.displayFormat
          ? cartModels.map((model) => model.getDisplayFormat())
          : cartModels,
        summary: {
          ...summary,
          totalAmountFormatted: this.utils.format.formatPrice(
            summary.totalAmount
          ),
        },
      };

      return result;
    } catch (error) {
      console.error('API Error - getUserCart:', error);
      throw this.utils.firestore.handleFirestoreError(error, 'getUserCart');
    }
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId) {
    try {
      return await this.services.cart.removeFromCart(cartItemId);
    } catch (error) {
      console.error('API Error - removeFromCart:', error);
      throw this.utils.firestore.handleFirestoreError(error, 'removeFromCart');
    }
  }

  /**
   * Update cart item quantity
   */
  async updateCartItemQuantity(cartItemId, newQuantity) {
    try {
      if (newQuantity < 1) {
        return await this.removeFromCart(cartItemId);
      }
      return await this.services.cart.updateCartItemQuantity(
        cartItemId,
        newQuantity
      );
    } catch (error) {
      console.error('API Error - updateCartItemQuantity:', error);
      throw this.utils.firestore.handleFirestoreError(
        error,
        'updateCartItemQuantity'
      );
    }
  }

  /**
   * Clear user's cart
   */
  async clearCart(userId) {
    try {
      return await this.services.cart.clearCart(userId);
    } catch (error) {
      console.error('API Error - clearCart:', error);
      throw this.utils.firestore.handleFirestoreError(error, 'clearCart');
    }
  }

  // ==================== BOOKING OPERATIONS ====================

  /**
   * Submit booking with full validation
   */
  async submitBooking(
    userId,
    userEmail,
    cartItems,
    paymentDetails = null,
    options = {}
  ) {
    try {
      // Validate booking data
      const bookingData = { userId, userEmail, items: cartItems };
      this.utils.booking.validateBookingData(bookingData);

      // Submit booking
      const booking = await this.services.booking.submitBooking(
        userId,
        userEmail,
        cartItems,
        paymentDetails
      );

      // Send confirmation if enabled
      if (options.sendConfirmation !== false) {
        try {
          await integrationHelpers.sendBookingConfirmation(booking);
        } catch (confirmationError) {
          console.warn(
            'Booking confirmation failed:',
            confirmationError.message
          );
        }
      }

      return options.displayFormat
        ? BookingModel.fromFirestore(booking.id, booking).getDisplayFormat()
        : booking;
    } catch (error) {
      console.error('API Error - submitBooking:', error);
      throw this.utils.firestore.handleFirestoreError(error, 'submitBooking');
    }
  }

  /**
   * Get user's bookings with formatting
   */
  async getUserBookings(userId, options = {}) {
    try {
      const rawBookings = await this.services.booking.getUserBookings(userId);

      // Convert to models
      const bookingModels = rawBookings
        .map((booking) => BookingModel.fromFirestore(booking.id, booking))
        .filter((model) => model.validate().isValid);

      // Apply filters
      let filteredBookings = bookingModels;
      if (options.status) {
        filteredBookings = bookingModels.filter(
          (b) => b.status === options.status
        );
      }

      return options.displayFormat
        ? filteredBookings.map((model) => model.getDisplayFormat())
        : filteredBookings;
    } catch (error) {
      console.error('API Error - getUserBookings:', error);
      throw this.utils.firestore.handleFirestoreError(error, 'getUserBookings');
    }
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId, options = {}) {
    try {
      const rawBooking = await this.services.booking.getBookingById(bookingId);
      const bookingModel = BookingModel.fromFirestore(bookingId, rawBooking);

      return options.displayFormat
        ? bookingModel.getDisplayFormat()
        : bookingModel;
    } catch (error) {
      console.error('API Error - getBookingById:', error);
      throw this.utils.firestore.handleFirestoreError(error, 'getBookingById');
    }
  }

  /**
   * Cancel booking
   */
  async cancelBooking(bookingId, userId, options = {}) {
    try {
      // Check if booking is cancellable
      if (options.checkCancellable !== false) {
        const booking = await this.getBookingById(bookingId);
        if (!this.utils.booking.isBookingCancellable(booking)) {
          throw new Error('This booking cannot be cancelled');
        }
      }

      return await this.services.booking.cancelBooking(bookingId, userId);
    } catch (error) {
      console.error('API Error - cancelBooking:', error);
      throw this.utils.firestore.handleFirestoreError(error, 'cancelBooking');
    }
  }

  /**
   * Get booking statistics
   */
  async getBookingStats(userId, options = {}) {
    try {
      const stats = await this.services.booking.getBookingStats(userId);

      // Add formatted versions
      return {
        ...stats,
        totalSpentFormatted: this.utils.format.formatPrice(stats.totalSpent),
        averagePerBookingFormatted: this.utils.format.formatPrice(
          stats.averagePerBooking || 0
        ),
      };
    } catch (error) {
      console.error('API Error - getBookingStats:', error);
      throw this.utils.firestore.handleFirestoreError(error, 'getBookingStats');
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get app configuration and constants
   */
  getAppConfig() {
    return {
      classTypes: this.utils.validation.getClassTypes
        ? this.utils.validation.getClassTypes()
        : ['Flow Yoga', 'Aerial Yoga', 'Family Yoga'],
      daysOfWeek: [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ],
      timeSlots: [
        '09:00',
        '09:30',
        '10:00',
        '10:30',
        '11:00',
        '11:30',
        '12:00',
        '12:30',
        '13:00',
        '13:30',
        '14:00',
        '14:30',
        '15:00',
        '15:30',
        '16:00',
        '16:30',
        '17:00',
        '17:30',
        '18:00',
        '18:30',
        '19:00',
        '19:30',
        '20:00',
      ],
      priceRange: { min: 10, max: 100 },
      durationRange: { min: 30, max: 120 },
      capacityRange: { min: 5, max: 30 },
    };
  }

  /**
   * Format data for display across the app
   */
  formatForDisplay(data, type) {
    switch (type) {
      case 'price':
        return this.utils.format.formatPrice(data);
      case 'duration':
        return this.utils.format.formatDuration(data);
      case 'date':
        return this.utils.format.formatDate(data);
      case 'time':
        return this.utils.format.formatTime(data);
      case 'capacity':
        return this.utils.format.formatCapacity(data.current, data.total);
      default:
        return data;
    }
  }

  /**
   * Validate data before operations
   */
  validateData(data, type) {
    switch (type) {
      case 'email':
        return this.utils.validation.isValidEmail(data);
      case 'date':
        return this.utils.validation.isValidDate(data);
      case 'time':
        return this.utils.validation.isValidTime(data);
      case 'price':
        return this.utils.validation.isValidPrice(data);
      case 'capacity':
        return this.utils.validation.isValidCapacity(data);
      case 'duration':
        return this.utils.validation.isValidDuration(data);
      default:
        return true;
    }
  }

  /**
   * Health check for all services
   */
  async healthCheck() {
    try {
      const results = {
        timestamp: new Date().toISOString(),
        services: {},
      };

      // Test classes service
      try {
        const classes = await this.services.classes.getAllClasses();
        results.services.classes = {
          status: 'OK',
          count: classes.length,
          message: `${classes.length} classes available`,
        };
      } catch (error) {
        results.services.classes = {
          status: 'ERROR',
          message: error.message,
        };
      }

      // Test instances service
      try {
        const instances = await this.services.instances.getAvailableInstances();
        results.services.instances = {
          status: 'OK',
          count: instances.length,
          message: `${instances.length} schedules available`,
        };
      } catch (error) {
        results.services.instances = {
          status: 'ERROR',
          message: error.message,
        };
      }

      // Overall status
      const allOK = Object.values(results.services).every(
        (service) => service.status === 'OK'
      );
      results.overall = {
        status: allOK ? 'HEALTHY' : 'DEGRADED',
        message: allOK
          ? 'All services operational'
          : 'Some services have issues',
      };

      return results;
    } catch (error) {
      return {
        overall: { status: 'CRITICAL', message: error.message },
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Create singleton instance
const yogaAPI = new YogaAppAPI();

/**
 * CONVENIENCE HOOKS FOR REACT COMPONENTS
 * These provide easy-to-use interfaces for your React components
 */

// React Hook for classes
export const useYogaClasses = () => {
  return {
    getAll: (options) => yogaAPI.getClasses(options),
    getById: (id, options) => yogaAPI.getClassById(id, options),
    search: (term, filters, options) =>
      yogaAPI.searchClasses(term, filters, options),
  };
};

// React Hook for schedules
export const useSchedules = () => {
  return {
    getAvailable: (options) => yogaAPI.getAvailableSchedules(options),
    getForClass: (classId, options) =>
      yogaAPI.getSchedulesForClass(classId, options),
    searchByTeacher: (teacher, options) =>
      yogaAPI.searchSchedulesByTeacher(teacher, options),
  };
};

// React Hook for cart
export const useCart = () => {
  return {
    add: (userId, item, options) => yogaAPI.addToCart(userId, item, options),
    get: (userId, options) => yogaAPI.getUserCart(userId, options),
    remove: (itemId) => yogaAPI.removeFromCart(itemId),
    updateQuantity: (itemId, quantity) =>
      yogaAPI.updateCartItemQuantity(itemId, quantity),
    clear: (userId) => yogaAPI.clearCart(userId),
  };
};

// React Hook for bookings
export const useBookings = () => {
  return {
    submit: (userId, email, items, payment, options) =>
      yogaAPI.submitBooking(userId, email, items, payment, options),
    getForUser: (userId, options) => yogaAPI.getUserBookings(userId, options),
    getById: (bookingId, options) => yogaAPI.getBookingById(bookingId, options),
    cancel: (bookingId, userId, options) =>
      yogaAPI.cancelBooking(bookingId, userId, options),
    getStats: (userId, options) => yogaAPI.getBookingStats(userId, options),
  };
};

// React Hook for utilities
export const useYogaUtils = () => {
  return {
    config: yogaAPI.getAppConfig(),
    format: (data, type) => yogaAPI.formatForDisplay(data, type),
    validate: (data, type) => yogaAPI.validateData(data, type),
    healthCheck: () => yogaAPI.healthCheck(),
  };
};

/**
 * ERROR BOUNDARY HELPER
 */
export const handleAPIError = (error, context = 'API Operation') => {
  console.error(`${context} failed:`, error);

  // User-friendly error messages
  const errorMap = {
    'permission-denied':
      'You do not have permission for this action. Please sign in.',
    'not-found': 'The requested data could not be found.',
    unavailable: 'Service is temporarily unavailable. Please try again.',
    unauthenticated: 'Please sign in to continue.',
    'already-exists': 'This item already exists.',
    'resource-exhausted': 'Too many requests. Please wait and try again.',
    cancelled: 'Operation was cancelled.',
    'deadline-exceeded': 'Operation timed out. Please try again.',
  };

  const userMessage =
    errorMap[error.code] || error.message || 'An unexpected error occurred';

  return {
    userMessage,
    technicalDetails: error,
    context,
    timestamp: new Date().toISOString(),
  };
};

/**
 * LOADING STATE HELPER
 */
export const createLoadingState = (initialState = {}) => {
  return {
    loading: false,
    error: null,
    data: null,
    ...initialState,
  };
};

/**
 * API RESPONSE WRAPPER
 */
export const wrapAPICall = async (apiFunction, errorContext) => {
  try {
    const result = await apiFunction();
    return {
      success: true,
      data: result,
      error: null,
    };
  } catch (error) {
    const errorInfo = handleAPIError(error, errorContext);
    return {
      success: false,
      data: null,
      error: errorInfo,
    };
  }
};

// Export main API instance and convenience functions
export default yogaAPI;

export {
  yogaAPI,
  YogaAppAPI,
  useYogaClasses,
  useSchedules,
  useCart,
  useBookings,
  useYogaUtils,
  handleAPIError,
  createLoadingState,
  wrapAPICall,
};

/**
 * USAGE EXAMPLES FOR YOUR REACT COMPONENTS
 *
 * // 1. Using the hooks in a component
 * import { useYogaClasses, useCart, wrapAPICall } from '../services/apiIntegration';
 *
 * const ClassListScreen = () => {
 *   const [state, setState] = useState(createLoadingState());
 *   const classAPI = useYogaClasses();
 *   const cartAPI = useCart();
 *
 *   const loadClasses = async () => {
 *     setState(prev => ({ ...prev, loading: true }));
 *
 *     const result = await wrapAPICall(
 *       () => classAPI.getAll({ displayFormat: true, sortBy: 'dayOfWeek' }),
 *       'Loading Classes'
 *     );
 *
 *     if (result.success) {
 *       setState({ loading: false, data: result.data, error: null });
 *     } else {
 *       setState({ loading: false, data: null, error: result.error });
 *     }
 *   };
 *
 *   const addToCart = async (classItem, scheduleItem) => {
 *     const cartItem = {
 *       courseId: classItem.id,
 *       instanceId: scheduleItem.id,
 *       className: classItem.title,
 *       price: classItem.price,
 *       // ... other fields
 *     };
 *
 *     const result = await wrapAPICall(
 *       () => cartAPI.add(userId, cartItem, { checkAvailability: true }),
 *       'Adding to Cart'
 *     );
 *
 *     if (result.success) {
 *       // Show success message
 *     } else {
 *       // Show error message: result.error.userMessage
 *     }
 *   };
 *
 *   return (
 *     <View>
 *       {state.loading && <Loading />}
 *       {state.error && <ErrorMessage error={state.error.userMessage} />}
 *       {state.data && (
 *         <FlatList
 *           data={state.data}
 *           renderItem={({ item }) => (
 *             <ClassCard
 *               class={item}
 *               onAddToCart={() => addToCart(item)}
 *             />
 *           )}
 *         />
 *       )}
 *     </View>
 *   );
 * };
 *
 * // 2. Direct API usage
 * import yogaAPI from '../services/apiIntegration';
 *
 * const searchClasses = async (searchTerm) => {
 *   try {
 *     const results = await yogaAPI.searchClasses(searchTerm, {
 *       type: 'Flow Yoga',
 *       maxPrice: 50
 *     }, {
 *       displayFormat: true,
 *       sortBy: 'price'
 *     });
 *     return results;
 *   } catch (error) {
 *     console.error('Search failed:', error);
 *     throw error;
 *   }
 * };
 *
 * // 3. Health check usage
 * const checkSystemHealth = async () => {
 *   const health = await yogaAPI.healthCheck();
 *   console.log('System health:', health);
 *
 *   if (health.overall.status !== 'HEALTHY') {
 *     // Show maintenance message
 *   }
 * };
 */
