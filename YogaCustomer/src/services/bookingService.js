import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  arrayUnion,
  arrayRemove,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Booking Service - Handles all booking related operations
 * Updated to match your actual Firestore structure
 */

// CORRECTED Collection names
const COLLECTIONS = {
  CLASSES: 'yoga_courses', // YogaCourse entities
  INSTANCES: 'schedules', // Schedule entities
  BOOKINGS: 'bookings', // User bookings
  USERS: 'users', // User profiles
  SHOPPING_CART: 'shoppingCart', // Cart items
};

/**
 * Shopping Cart Operations
 */
export const shoppingCartService = {
  // Add item to cart
  addToCart: async (userId, cartItem) => {
    try {
      console.log('Adding item to cart for user:', userId);

      if (!userId) {
        throw new Error('User ID is required');
      }

      // Validate required cart item fields
      const requiredFields = ['courseId', 'instanceId', 'className', 'price'];
      const missing = requiredFields.filter((field) => !cartItem[field]);
      if (missing.length > 0) {
        throw new Error(`Missing cart item fields: ${missing.join(', ')}`);
      }

      const cartData = {
        userId,
        courseId: cartItem.courseId, // Links to yoga_courses
        instanceId: cartItem.instanceId, // Links to schedules
        className: cartItem.className,
        classType: cartItem.classType,
        teacher: cartItem.teacher,
        date: cartItem.date, // Schedule date
        time: cartItem.time, // Class time
        duration: cartItem.duration,
        price: cartItem.price,
        quantity: cartItem.quantity || 1,
        dayOfWeek: cartItem.dayOfWeek,
        capacity: cartItem.capacity,
        description: cartItem.description,
        comments: cartItem.comments, // Schedule comments
        addedAt: serverTimestamp(),
        status: 'pending',
      };

      const cartRef = collection(db, COLLECTIONS.SHOPPING_CART);
      const docRef = await addDoc(cartRef, cartData);

      console.log('✅ Item added to cart with ID:', docRef.id);
      return {
        id: docRef.id,
        ...cartData,
      };
    } catch (error) {
      console.error('❌ Error adding to cart:', error);
      throw new Error(`Failed to add item to cart: ${error.message}`);
    }
  },

  // Get user's cart items with class and schedule details
  getUserCart: async (userId) => {
    try {
      console.log('Fetching cart for user:', userId);
      const cartRef = collection(db, COLLECTIONS.SHOPPING_CART);
      const q = query(
        cartRef,
        where('userId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('addedAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const cartItems = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        cartItems.push({
          id: doc.id,
          ...data,
          // Format for display
          priceFormatted: `£${data.price?.toFixed(2) || '0.00'}`,
          dateFormatted: data.date
            ? new Date(data.date + 'T00:00:00').toLocaleDateString('en-GB')
            : 'N/A',
          durationFormatted: `${data.duration || 0} minutes`,
        });
      });

      console.log(`✅ Found ${cartItems.length} items in cart`);
      return cartItems;
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      throw new Error(`Failed to fetch cart: ${error.message}`);
    }
  },

  // Remove item from cart
  removeFromCart: async (cartItemId) => {
    try {
      console.log('Removing item from cart:', cartItemId);
      await deleteDoc(doc(db, COLLECTIONS.SHOPPING_CART, cartItemId));
      console.log('✅ Item removed from cart successfully');
      return true;
    } catch (error) {
      console.error('❌ Error removing from cart:', error);
      throw new Error(`Failed to remove item from cart: ${error.message}`);
    }
  },

  // Update cart item quantity
  updateCartItemQuantity: async (cartItemId, newQuantity) => {
    try {
      console.log('Updating cart item quantity:', cartItemId, newQuantity);

      if (newQuantity <= 0) {
        return await shoppingCartService.removeFromCart(cartItemId);
      }

      const cartItemRef = doc(db, COLLECTIONS.SHOPPING_CART, cartItemId);
      await updateDoc(cartItemRef, {
        quantity: newQuantity,
        updatedAt: serverTimestamp(),
      });

      console.log('✅ Cart item quantity updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating cart item:', error);
      throw new Error(`Failed to update cart item: ${error.message}`);
    }
  },

  // Clear user's cart
  clearCart: async (userId) => {
    try {
      console.log('Clearing cart for user:', userId);
      const cartRef = collection(db, COLLECTIONS.SHOPPING_CART);
      const q = query(
        cartRef,
        where('userId', '==', userId),
        where('status', '==', 'pending')
      );

      const querySnapshot = await getDocs(q);
      const batch = [];

      querySnapshot.forEach((doc) => {
        batch.push(deleteDoc(doc.ref));
      });

      await Promise.all(batch);
      console.log('✅ Cart cleared successfully');
      return true;
    } catch (error) {
      console.error('❌ Error clearing cart:', error);
      throw new Error(`Failed to clear cart: ${error.message}`);
    }
  },

  // Get cart summary
  getCartSummary: async (userId) => {
    try {
      const cartItems = await shoppingCartService.getUserCart(userId);

      const summary = {
        totalItems: cartItems.length,
        totalQuantity: cartItems.reduce(
          (sum, item) => sum + (item.quantity || 1),
          0
        ),
        totalAmount: cartItems.reduce(
          (sum, item) => sum + item.price * (item.quantity || 1),
          0
        ),
        itemsByType: {},
        upcomingClasses: 0,
      };

      // Group by class type and count upcoming
      const today = new Date().toISOString().split('T')[0];
      cartItems.forEach((item) => {
        // Count by type
        const type = item.classType || 'Unknown';
        summary.itemsByType[type] =
          (summary.itemsByType[type] || 0) + (item.quantity || 1);

        // Count upcoming classes
        if (item.date && item.date >= today) {
          summary.upcomingClasses += item.quantity || 1;
        }
      });

      summary.totalAmountFormatted = `£${summary.totalAmount.toFixed(2)}`;

      return summary;
    } catch (error) {
      console.error('❌ Error calculating cart summary:', error);
      throw new Error(`Failed to calculate cart summary: ${error.message}`);
    }
  },
};

/**
 * Booking Operations
 */
export const bookingService = {
  // Submit cart as booking
  submitBooking: async (
    userId,
    userEmail,
    cartItems,
    paymentDetails = null
  ) => {
    try {
      console.log('Submitting booking for user:', userId);

      if (!userId || !userEmail || !cartItems || cartItems.length === 0) {
        throw new Error('Missing required booking information');
      }

      // Use transaction to ensure data consistency
      const bookingResult = await runTransaction(db, async (transaction) => {
        // Validate all items are still available
        for (const item of cartItems) {
          if (item.instanceId) {
            const instanceRef = doc(db, COLLECTIONS.INSTANCES, item.instanceId);
            const instanceDoc = await transaction.get(instanceRef);

            if (!instanceDoc.exists()) {
              throw new Error(`Schedule ${item.instanceId} no longer exists`);
            }

            const instanceData = instanceDoc.data();
            const classRef = doc(
              db,
              COLLECTIONS.CLASSES,
              item.courseId.toString()
            );
            const classDoc = await transaction.get(classRef);

            if (!classDoc.exists()) {
              throw new Error(`Class ${item.courseId} no longer exists`);
            }

            // In a real implementation, you'd check capacity here
            // For now, we'll assume booking is allowed
          }
        }

        // Create booking document
        const bookingData = {
          userId,
          userEmail,
          items: cartItems.map((item) => ({
            courseId: item.courseId,
            instanceId: item.instanceId,
            className: item.className,
            classType: item.classType,
            teacher: item.teacher,
            date: item.date,
            time: item.time,
            duration: item.duration,
            price: item.price,
            quantity: item.quantity || 1,
            dayOfWeek: item.dayOfWeek,
            description: item.description,
            comments: item.comments,
          })),
          summary: {
            totalAmount: cartItems.reduce(
              (sum, item) => sum + item.price * (item.quantity || 1),
              0
            ),
            totalItems: cartItems.length,
            totalQuantity: cartItems.reduce(
              (sum, item) => sum + (item.quantity || 1),
              0
            ),
          },
          status: 'confirmed',
          bookingDate: serverTimestamp(),
          paymentDetails: paymentDetails || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
        const bookingDocRef = doc(bookingsRef);
        transaction.set(bookingDocRef, bookingData);

        // Mark cart items as booked
        for (const item of cartItems) {
          if (item.id) {
            const cartItemRef = doc(db, COLLECTIONS.SHOPPING_CART, item.id);
            transaction.update(cartItemRef, {
              status: 'booked',
              bookingId: bookingDocRef.id,
              bookedAt: serverTimestamp(),
            });
          }
        }

        // Update schedules to track bookings (optional)
        for (const item of cartItems) {
          if (item.instanceId) {
            const instanceRef = doc(db, COLLECTIONS.INSTANCES, item.instanceId);

            // Add booking tracking to schedule
            transaction.update(instanceRef, {
              bookings: arrayUnion({
                bookingId: bookingDocRef.id,
                userId,
                userEmail,
                bookedAt: new Date().toISOString(),
                quantity: item.quantity || 1,
              }),
              lastUpdated: Date.now(),
            });
          }
        }

        return {
          id: bookingDocRef.id,
          ...bookingData,
        };
      });

      console.log('✅ Booking submitted successfully:', bookingResult.id);
      return bookingResult;
    } catch (error) {
      console.error('❌ Error submitting booking:', error);
      throw new Error(`Failed to submit booking: ${error.message}`);
    }
  },

  // Get user's bookings
  getUserBookings: async (userId) => {
    try {
      console.log('Fetching bookings for user:', userId);
      const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
      const q = query(
        bookingsRef,
        where('userId', '==', userId),
        orderBy('bookingDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const bookings = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        bookings.push({
          id: doc.id,
          ...data,
          // Format for display
          bookingDateFormatted:
            data.bookingDate?.toDate()?.toLocaleDateString('en-GB') || 'N/A',
          totalAmountFormatted: `£${
            data.summary?.totalAmount?.toFixed(2) || '0.00'
          }`,
          statusFormatted:
            data.status?.charAt(0).toUpperCase() + data.status?.slice(1) ||
            'Unknown',
        });
      });

      console.log(`✅ Found ${bookings.length} bookings for user`);
      return bookings;
    } catch (error) {
      console.error('❌ Error fetching user bookings:', error);
      throw new Error(`Failed to fetch bookings: ${error.message}`);
    }
  },

  // Get booking by ID
  getBookingById: async (bookingId) => {
    try {
      console.log('Fetching booking:', bookingId);
      const bookingDoc = await getDoc(doc(db, COLLECTIONS.BOOKINGS, bookingId));

      if (!bookingDoc.exists()) {
        throw new Error('Booking not found');
      }

      const data = bookingDoc.data();
      return {
        id: bookingDoc.id,
        ...data,
        bookingDateFormatted:
          data.bookingDate?.toDate()?.toLocaleDateString('en-GB') || 'N/A',
        totalAmountFormatted: `£${
          data.summary?.totalAmount?.toFixed(2) || '0.00'
        }`,
        statusFormatted:
          data.status?.charAt(0).toUpperCase() + data.status?.slice(1) ||
          'Unknown',
      };
    } catch (error) {
      console.error('❌ Error fetching booking:', error);
      throw new Error(`Failed to fetch booking: ${error.message}`);
    }
  },

  // Cancel booking
  cancelBooking: async (bookingId, userId) => {
    try {
      console.log('Canceling booking:', bookingId);

      // Use transaction to ensure data consistency
      await runTransaction(db, async (transaction) => {
        const bookingRef = doc(db, COLLECTIONS.BOOKINGS, bookingId);
        const bookingDoc = await transaction.get(bookingRef);

        if (!bookingDoc.exists()) {
          throw new Error('Booking not found');
        }

        const bookingData = bookingDoc.data();

        // Verify user owns this booking
        if (bookingData.userId !== userId) {
          throw new Error('Unauthorized to cancel this booking');
        }

        // Check if booking can be cancelled (not already cancelled)
        if (bookingData.status === 'cancelled') {
          throw new Error('Booking is already cancelled');
        }

        // Update booking status
        transaction.update(bookingRef, {
          status: 'cancelled',
          cancelledAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        // Remove bookings from schedules
        for (const item of bookingData.items) {
          if (item.instanceId) {
            const instanceRef = doc(db, COLLECTIONS.INSTANCES, item.instanceId);
            const instanceDoc = await transaction.get(instanceRef);

            if (instanceDoc.exists()) {
              const instanceData = instanceDoc.data();
              const currentBookings = instanceData.bookings || [];

              // Remove bookings related to this booking ID
              const updatedBookings = currentBookings.filter(
                (booking) => booking.bookingId !== bookingId
              );

              transaction.update(instanceRef, {
                bookings: updatedBookings,
                lastUpdated: Date.now(),
              });
            }
          }
        }
      });

      console.log('✅ Booking cancelled successfully');
      return true;
    } catch (error) {
      console.error('❌ Error canceling booking:', error);
      throw new Error(`Failed to cancel booking: ${error.message}`);
    }
  },

  // Get booking history with filters
  getBookingHistory: async (userId, filters = {}) => {
    try {
      console.log('Fetching booking history for user:', userId, filters);
      const bookingsRef = collection(db, COLLECTIONS.BOOKINGS);
      let q = query(
        bookingsRef,
        where('userId', '==', userId),
        orderBy('bookingDate', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const bookings = [];

      querySnapshot.forEach((doc) => {
        const bookingData = doc.data();

        // Apply client-side filters (for simple filters)
        if (filters.status && bookingData.status !== filters.status) {
          return;
        }

        // Apply date filters if provided
        if (filters.fromDate || filters.toDate) {
          const bookingDate = bookingData.bookingDate?.toDate();
          if (!bookingDate) return;

          if (filters.fromDate && bookingDate < new Date(filters.fromDate))
            return;
          if (filters.toDate && bookingDate > new Date(filters.toDate)) return;
        }

        bookings.push({
          id: doc.id,
          ...bookingData,
          bookingDateFormatted:
            bookingData.bookingDate?.toDate()?.toLocaleDateString('en-GB') ||
            'N/A',
          totalAmountFormatted: `£${
            bookingData.summary?.totalAmount?.toFixed(2) || '0.00'
          }`,
        });
      });

      console.log(`✅ Found ${bookings.length} bookings in history`);
      return bookings;
    } catch (error) {
      console.error('❌ Error fetching booking history:', error);
      throw new Error(`Failed to fetch booking history: ${error.message}`);
    }
  },

  // Get booking statistics
  getBookingStats: async (userId) => {
    try {
      console.log('Calculating booking statistics for user:', userId);
      const bookings = await bookingService.getUserBookings(userId);

      const stats = {
        totalBookings: bookings.length,
        totalSpent: 0,
        confirmedBookings: 0,
        cancelledBookings: 0,
        upcomingClasses: 0,
        pastClasses: 0,
        favoriteClassType: null,
        classTypeStats: {},
        monthlySpending: {},
      };

      const now = new Date();
      const today = now.toISOString().split('T')[0];

      bookings.forEach((booking) => {
        // Total spent
        stats.totalSpent += booking.summary?.totalAmount || 0;

        // Status counts
        if (booking.status === 'confirmed') {
          stats.confirmedBookings++;
        } else if (booking.status === 'cancelled') {
          stats.cancelledBookings++;
        }

        // Process each item in booking
        booking.items?.forEach((item) => {
          // Class type statistics
          const classType = item.classType || 'Unknown';
          stats.classTypeStats[classType] =
            (stats.classTypeStats[classType] || 0) + 1;

          // Upcoming vs past classes
          if (item.date) {
            if (item.date >= today) {
              stats.upcomingClasses++;
            } else {
              stats.pastClasses++;
            }
          }
        });

        // Monthly spending
        if (booking.bookingDate) {
          const month = booking.bookingDate.toDate().toISOString().slice(0, 7); // YYYY-MM
          stats.monthlySpending[month] =
            (stats.monthlySpending[month] || 0) +
            (booking.summary?.totalAmount || 0);
        }
      });

      // Find favorite class type
      let maxCount = 0;
      Object.entries(stats.classTypeStats).forEach(([type, count]) => {
        if (count > maxCount) {
          maxCount = count;
          stats.favoriteClassType = type;
        }
      });

      // Format totals
      stats.totalSpentFormatted = `£${stats.totalSpent.toFixed(2)}`;
      stats.averagePerBooking =
        stats.totalBookings > 0 ? stats.totalSpent / stats.totalBookings : 0;
      stats.averagePerBookingFormatted = `£${stats.averagePerBooking.toFixed(
        2
      )}`;

      console.log('✅ Calculated booking statistics');
      return stats;
    } catch (error) {
      console.error('❌ Error calculating booking stats:', error);
      throw new Error(
        `Failed to calculate booking statistics: ${error.message}`
      );
    }
  },
};

/**
 * Booking Utility Functions
 */
export const bookingUtils = {
  // Validate booking data
  validateBookingData: (bookingData) => {
    const required = ['userId', 'userEmail', 'items'];
    const missing = required.filter((field) => !bookingData[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    if (!Array.isArray(bookingData.items) || bookingData.items.length === 0) {
      throw new Error('Booking must contain at least one item');
    }

    // Validate each item
    bookingData.items.forEach((item, index) => {
      const itemRequired = ['courseId', 'instanceId', 'className', 'price'];
      const itemMissing = itemRequired.filter((field) => !item[field]);

      if (itemMissing.length > 0) {
        throw new Error(
          `Item ${index + 1} missing fields: ${itemMissing.join(', ')}`
        );
      }
    });

    return true;
  },

  // Calculate booking total
  calculateBookingTotal: (items) => {
    if (!Array.isArray(items))
      return { total: 0, itemCount: 0, totalQuantity: 0 };

    return {
      total: items.reduce(
        (sum, item) => sum + item.price * (item.quantity || 1),
        0
      ),
      itemCount: items.length,
      totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 1), 0),
    };
  },

  // Check if booking is cancellable
  isBookingCancellable: (booking) => {
    if (!booking || booking.status !== 'confirmed') {
      return false;
    }

    // Check if any class in the booking is in the future
    const today = new Date().toISOString().split('T')[0];
    return (
      booking.items?.some((item) => {
        return item.date && item.date > today;
      }) || false
    );
  },

  // Group bookings by status
  groupBookingsByStatus: (bookings) => {
    if (!Array.isArray(bookings)) {
      return { confirmed: [], cancelled: [], pending: [] };
    }

    return bookings.reduce(
      (groups, booking) => {
        const status = booking.status || 'pending';
        if (!groups[status]) {
          groups[status] = [];
        }
        groups[status].push(booking);
        return groups;
      },
      { confirmed: [], cancelled: [], pending: [] }
    );
  },

  // Get upcoming classes from bookings
  getUpcomingClasses: (bookings) => {
    const today = new Date().toISOString().split('T')[0];
    const upcomingClasses = [];

    bookings.forEach((booking) => {
      if (booking.status === 'confirmed' && booking.items) {
        booking.items.forEach((item) => {
          if (item.date && item.date > today) {
            upcomingClasses.push({
              ...item,
              bookingId: booking.id,
              bookingDate: booking.bookingDate,
            });
          }
        });
      }
    });

    // Sort by date
    upcomingClasses.sort((a, b) => a.date.localeCompare(b.date));

    return upcomingClasses;
  },

  // Format items for cart display
  formatCartItemsForDisplay: (cartItems) => {
    return cartItems.map((item) => ({
      ...item,
      priceFormatted: `£${item.price?.toFixed(2) || '0.00'}`,
      totalPriceFormatted: `£${(
        (item.price || 0) * (item.quantity || 1)
      ).toFixed(2)}`,
      dateFormatted: item.date
        ? new Date(item.date + 'T00:00:00').toLocaleDateString('en-GB')
        : 'N/A',
      durationFormatted: `${item.duration || 0} mins`,
      quantityFormatted: `${item.quantity || 1}x`,
    }));
  },
};

/**
 * Integration Helper Functions
 */
export const integrationHelpers = {
  // Convert class and schedule to cart item format
  createCartItemFromClassAndSchedule: (
    classData,
    scheduleData,
    quantity = 1
  ) => {
    return {
      courseId: classData.id || scheduleData.courseId,
      instanceId: scheduleData.id,
      className: classData.type || 'Yoga Class',
      classType: classData.type,
      teacher: scheduleData.teacher,
      date: scheduleData.date,
      time: classData.time,
      duration: classData.duration,
      price: classData.price,
      quantity,
      dayOfWeek: classData.dayOfWeek,
      capacity: classData.capacity,
      description: classData.description,
      comments: scheduleData.comments,
    };
  },

  // Validate class availability before adding to cart
  checkClassAvailability: async (courseId, instanceId) => {
    try {
      const scheduleDoc = await getDoc(
        doc(db, COLLECTIONS.INSTANCES, instanceId)
      );

      if (!scheduleDoc.exists()) {
        throw new Error('Schedule not found');
      }

      const scheduleData = scheduleData.data();
      const today = new Date().toISOString().split('T')[0];

      // Check if class is in the future
      if (scheduleData.date <= today) {
        throw new Error('Cannot book classes in the past');
      }

      // Get class data to check capacity
      const classDoc = await getDoc(
        doc(db, COLLECTIONS.CLASSES, courseId.toString())
      );

      if (!classDoc.exists()) {
        throw new Error('Class not found');
      }

      const classData = classDoc.data();
      const currentBookings = scheduleData.bookings || [];
      const capacity = classData.capacity || 0;
      const availableSpots = capacity - currentBookings.length;

      return {
        available: availableSpots > 0,
        availableSpots,
        capacity,
        scheduleData,
        classData,
      };
    } catch (error) {
      console.error('❌ Error checking availability:', error);
      throw error;
    }
  },

  // Send booking confirmation (placeholder)
  sendBookingConfirmation: async (booking) => {
    try {
      console.log('📧 Sending booking confirmation for:', booking.id);
      console.log('Confirmation details:', {
        bookingId: booking.id,
        userEmail: booking.userEmail,
        totalAmount: booking.summary?.totalAmount,
        itemCount: booking.items?.length,
        classes: booking.items?.map((item) => ({
          className: item.className,
          date: item.date,
          time: item.time,
          teacher: item.teacher,
        })),
      });

      // In a real app, integrate with email service here
      return true;
    } catch (error) {
      console.error('❌ Error sending booking confirmation:', error);
      return false;
    }
  },

  // Get collection names for debugging
  getCollectionNames: () => COLLECTIONS,
};

// Export main service objects
export default {
  cart: shoppingCartService,
  booking: bookingService,
  utils: bookingUtils,
  integration: integrationHelpers,
  collections: COLLECTIONS,
};

// Named exports for convenience
export {
  shoppingCartService,
  bookingService,
  bookingUtils,
  integrationHelpers,
};
