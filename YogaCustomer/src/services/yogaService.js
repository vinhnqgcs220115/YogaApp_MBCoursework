import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Yoga Service - Handles all yoga class related operations
 * Updated to match your actual Firestore structure
 */

// CORRECTED Collection names based on your Firestore
const COLLECTIONS = {
  CLASSES: 'yoga_courses', // Changed from 'yogaClasses'
  INSTANCES: 'schedules', // Changed from 'classInstances'
  BOOKINGS: 'bookings',
  USERS: 'users',
  SHOPPING_CART: 'shoppingCart',
};

/**
 * Yoga Class Operations - Based on YogaCourse.java entity
 */
export const yogaClassService = {
  // Get all yoga classes
  getAllClasses: async () => {
    try {
      console.log('Fetching all yoga classes from:', COLLECTIONS.CLASSES);
      const classesRef = collection(db, COLLECTIONS.CLASSES);
      const q = query(classesRef, orderBy('dayOfWeek'), orderBy('time'));
      const querySnapshot = await getDocs(q);

      const classes = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        classes.push({
          id: doc.id,
          // Map Firestore fields to match YogaCourse entity
          dayOfWeek: data.dayOfWeek,
          time: data.time,
          capacity: data.capacity,
          duration: data.duration,
          price: data.price,
          type: data.type,
          description: data.description,
          // Additional fields that might exist
          lastUpdated: data.lastUpdated,
          ...data, // Include any other fields
        });
      });

      console.log(`✅ Fetched ${classes.length} classes`);
      return classes;
    } catch (error) {
      console.error('❌ Error fetching classes:', error);
      throw new Error(`Failed to fetch classes: ${error.message}`);
    }
  },

  // Get class by ID
  getClassById: async (classId) => {
    try {
      console.log('Fetching class:', classId);
      const classDoc = await getDoc(doc(db, COLLECTIONS.CLASSES, classId));

      if (!classDoc.exists()) {
        throw new Error('Class not found');
      }

      const data = classDoc.data();
      return {
        id: classDoc.id,
        dayOfWeek: data.dayOfWeek,
        time: data.time,
        capacity: data.capacity,
        duration: data.duration,
        price: data.price,
        type: data.type,
        description: data.description,
        lastUpdated: data.lastUpdated,
        ...data,
      };
    } catch (error) {
      console.error('❌ Error fetching class:', error);
      throw new Error(`Failed to fetch class: ${error.message}`);
    }
  },

  // Search classes by type
  searchClassesByType: async (classType) => {
    try {
      console.log('Searching classes by type:', classType);
      const classesRef = collection(db, COLLECTIONS.CLASSES);
      const q = query(
        classesRef,
        where('type', '==', classType),
        orderBy('dayOfWeek'),
        orderBy('time')
      );
      const querySnapshot = await getDocs(q);

      const classes = [];
      querySnapshot.forEach((doc) => {
        classes.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`✅ Found ${classes.length} ${classType} classes`);
      return classes;
    } catch (error) {
      console.error('❌ Error searching classes:', error);
      throw new Error(`Failed to search classes: ${error.message}`);
    }
  },

  // Search classes by day of week
  searchClassesByDay: async (dayOfWeek) => {
    try {
      console.log('Searching classes by day:', dayOfWeek);
      const classesRef = collection(db, COLLECTIONS.CLASSES);
      const q = query(
        classesRef,
        where('dayOfWeek', '==', dayOfWeek),
        orderBy('time')
      );
      const querySnapshot = await getDocs(q);

      const classes = [];
      querySnapshot.forEach((doc) => {
        classes.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`✅ Found ${classes.length} classes on ${dayOfWeek}`);
      return classes;
    } catch (error) {
      console.error('❌ Error searching classes by day:', error);
      throw new Error(`Failed to search classes: ${error.message}`);
    }
  },

  // Search classes by time
  searchClassesByTime: async (time) => {
    try {
      console.log('Searching classes by time:', time);
      const classesRef = collection(db, COLLECTIONS.CLASSES);
      const q = query(
        classesRef,
        where('time', '==', time),
        orderBy('dayOfWeek')
      );
      const querySnapshot = await getDocs(q);

      const classes = [];
      querySnapshot.forEach((doc) => {
        classes.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`✅ Found ${classes.length} classes at ${time}`);
      return classes;
    } catch (error) {
      console.error('❌ Error searching classes by time:', error);
      throw new Error(`Failed to search classes: ${error.message}`);
    }
  },

  // Advanced search with multiple filters
  searchClasses: async (filters = {}) => {
    try {
      console.log('Advanced search with filters:', filters);
      const classesRef = collection(db, COLLECTIONS.CLASSES);
      let q = query(classesRef);

      // Apply filters based on YogaCourse fields
      if (filters.dayOfWeek) {
        q = query(q, where('dayOfWeek', '==', filters.dayOfWeek));
      }
      if (filters.time) {
        q = query(q, where('time', '==', filters.time));
      }
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters.maxPrice) {
        q = query(q, where('price', '<=', filters.maxPrice));
      }
      if (filters.minCapacity) {
        q = query(q, where('capacity', '>=', filters.minCapacity));
      }
      if (filters.maxDuration) {
        q = query(q, where('duration', '<=', filters.maxDuration));
      }

      // Add default ordering
      q = query(q, orderBy('dayOfWeek'), orderBy('time'));

      const querySnapshot = await getDocs(q);
      const classes = [];
      querySnapshot.forEach((doc) => {
        classes.push({
          id: doc.id,
          ...doc.data(),
        });
      });

      console.log(`✅ Advanced search found ${classes.length} classes`);
      return classes;
    } catch (error) {
      console.error('❌ Error in advanced search:', error);
      throw new Error(`Failed to search classes: ${error.message}`);
    }
  },

  // Listen to class changes (real-time updates)
  subscribeToClasses: (callback, filters = {}) => {
    try {
      console.log('Setting up classes subscription with filters:', filters);
      const classesRef = collection(db, COLLECTIONS.CLASSES);
      let q = query(classesRef, orderBy('dayOfWeek'), orderBy('time'));

      // Apply filters if provided
      if (filters.dayOfWeek) {
        q = query(q, where('dayOfWeek', '==', filters.dayOfWeek));
      }
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }

      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          const classes = [];
          querySnapshot.forEach((doc) => {
            classes.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          console.log(`📡 Real-time update: ${classes.length} classes`);
          callback(classes);
        },
        (error) => {
          console.error('❌ Error in classes subscription:', error);
          callback(null, error);
        }
      );

      return unsubscribe;
    } catch (error) {
      console.error('❌ Error setting up subscription:', error);
      throw new Error(`Failed to setup subscription: ${error.message}`);
    }
  },
};

/**
 * Class Instance Operations - Based on Schedule.java entity
 */
export const classInstanceService = {
  // Get instances for a specific class (courseId)
  getInstancesForClass: async (courseId) => {
    try {
      console.log('Fetching instances for course:', courseId);
      const instancesRef = collection(db, COLLECTIONS.INSTANCES);
      const q = query(
        instancesRef,
        where('courseId', '==', parseInt(courseId)), // courseId is int in Java
        orderBy('date')
      );
      const querySnapshot = await getDocs(q);

      const instances = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        instances.push({
          id: doc.id,
          // Map Firestore fields to match Schedule entity
          courseId: data.courseId,
          date: data.date,
          teacher: data.teacher,
          comments: data.comments,
          // Additional computed fields
          lastUpdated: data.lastUpdated,
          ...data,
        });
      });

      console.log(
        `✅ Fetched ${instances.length} instances for course ${courseId}`
      );
      return instances;
    } catch (error) {
      console.error('❌ Error fetching instances:', error);
      throw new Error(`Failed to fetch instances: ${error.message}`);
    }
  },

  // Get instance by ID
  getInstanceById: async (instanceId) => {
    try {
      console.log('Fetching instance:', instanceId);
      const instanceDoc = await getDoc(
        doc(db, COLLECTIONS.INSTANCES, instanceId)
      );

      if (!instanceDoc.exists()) {
        throw new Error('Instance not found');
      }

      const data = instanceDoc.data();
      return {
        id: instanceDoc.id,
        courseId: data.courseId,
        date: data.date,
        teacher: data.teacher,
        comments: data.comments,
        lastUpdated: data.lastUpdated,
        ...data,
      };
    } catch (error) {
      console.error('❌ Error fetching instance:', error);
      throw new Error(`Failed to fetch instance: ${error.message}`);
    }
  },

  // Search instances by teacher name (partial match)
  searchInstancesByTeacher: async (teacherName) => {
    try {
      console.log('Searching instances by teacher:', teacherName);
      const instancesRef = collection(db, COLLECTIONS.INSTANCES);

      // For partial matching, we'll fetch all and filter
      // In a production app, you might want to use full-text search
      const q = query(instancesRef, orderBy('teacher'), orderBy('date'));
      const querySnapshot = await getDocs(q);

      const instances = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Case-insensitive partial matching
        if (
          data.teacher &&
          data.teacher.toLowerCase().includes(teacherName.toLowerCase())
        ) {
          instances.push({
            id: doc.id,
            ...data,
          });
        }
      });

      console.log(
        `✅ Found ${instances.length} instances for teacher containing "${teacherName}"`
      );
      return instances;
    } catch (error) {
      console.error('❌ Error searching instances by teacher:', error);
      throw new Error(`Failed to search instances: ${error.message}`);
    }
  },

  // Get available instances (future dates)
  getAvailableInstances: async () => {
    try {
      console.log('Fetching available instances...');
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const instancesRef = collection(db, COLLECTIONS.INSTANCES);
      const q = query(
        instancesRef,
        where('date', '>=', today),
        orderBy('date')
      );
      const querySnapshot = await getDocs(q);

      const instances = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        instances.push({
          id: doc.id,
          ...data,
        });
      });

      console.log(`✅ Found ${instances.length} available instances`);
      return instances;
    } catch (error) {
      console.error('❌ Error fetching available instances:', error);
      throw new Error(`Failed to fetch available instances: ${error.message}`);
    }
  },

  // Get instances with class details (JOIN operation)
  getInstancesWithClassDetails: async (filters = {}) => {
    try {
      console.log('Fetching instances with class details...');

      // First get instances
      let instancesQuery = query(collection(db, COLLECTIONS.INSTANCES));

      if (filters.fromDate) {
        instancesQuery = query(
          instancesQuery,
          where('date', '>=', filters.fromDate)
        );
      }
      if (filters.toDate) {
        instancesQuery = query(
          instancesQuery,
          where('date', '<=', filters.toDate)
        );
      }

      instancesQuery = query(instancesQuery, orderBy('date'));

      const instancesSnapshot = await getDocs(instancesQuery);

      // Get all unique courseIds
      const courseIds = new Set();
      const instancesData = [];

      instancesSnapshot.forEach((doc) => {
        const data = doc.data();
        instancesData.push({ id: doc.id, ...data });
        courseIds.add(data.courseId);
      });

      // Get class details for all courseIds
      const classesData = {};
      for (const courseId of courseIds) {
        try {
          const classDoc = await getDoc(
            doc(db, COLLECTIONS.CLASSES, courseId.toString())
          );
          if (classDoc.exists()) {
            classesData[courseId] = classDoc.data();
          }
        } catch (error) {
          console.warn(`Could not fetch class ${courseId}:`, error.message);
        }
      }

      // Combine instances with class details
      const combinedData = instancesData.map((instance) => ({
        ...instance,
        classDetails: classesData[instance.courseId] || null,
        // Computed fields for easy access
        className: classesData[instance.courseId]?.type || 'Unknown Class',
        classTime: classesData[instance.courseId]?.time || 'Unknown Time',
        classDuration: classesData[instance.courseId]?.duration || 0,
        classPrice: classesData[instance.courseId]?.price || 0,
        classCapacity: classesData[instance.courseId]?.capacity || 0,
        classDayOfWeek:
          classesData[instance.courseId]?.dayOfWeek || 'Unknown Day',
      }));

      console.log(
        `✅ Combined ${combinedData.length} instances with class details`
      );
      return combinedData;
    } catch (error) {
      console.error('❌ Error fetching instances with class details:', error);
      throw new Error(
        `Failed to fetch instances with details: ${error.message}`
      );
    }
  },
};

/**
 * Utility Functions
 */
export const yogaServiceUtils = {
  // Validate class data structure (based on YogaCourse entity)
  validateClassData: (classData) => {
    const required = [
      'dayOfWeek',
      'time',
      'capacity',
      'duration',
      'price',
      'type',
    ];
    const missing = required.filter((field) => !classData[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Type validation
    if (typeof classData.capacity !== 'number' || classData.capacity <= 0) {
      throw new Error('Capacity must be a positive number');
    }
    if (typeof classData.duration !== 'number' || classData.duration <= 0) {
      throw new Error('Duration must be a positive number');
    }
    if (typeof classData.price !== 'number' || classData.price <= 0) {
      throw new Error('Price must be a positive number');
    }

    return true;
  },

  // Validate schedule data (based on Schedule entity)
  validateScheduleData: (scheduleData) => {
    const required = ['courseId', 'date', 'teacher'];
    const missing = required.filter((field) => !scheduleData[field]);

    if (missing.length > 0) {
      throw new Error(`Missing required fields: ${missing.join(', ')}`);
    }

    // Date validation (YYYY-MM-DD format)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(scheduleData.date)) {
      throw new Error('Date must be in YYYY-MM-DD format');
    }

    return true;
  },

  // Format class data for display
  formatClassForDisplay: (classData) => {
    return {
      ...classData,
      priceFormatted: `£${classData.price?.toFixed(2) || '0.00'}`,
      durationFormatted: `${classData.duration || 0} minutes`,
      timeFormatted: classData.time || 'N/A',
      dayFormatted: classData.dayOfWeek || 'N/A',
      capacityFormatted: `${classData.capacity || 0} people`,
    };
  },

  // Format schedule data for display
  formatScheduleForDisplay: (scheduleData, classData = null) => {
    return {
      ...scheduleData,
      dateFormatted: scheduleData.date
        ? new Date(scheduleData.date + 'T00:00:00').toLocaleDateString('en-GB')
        : 'N/A',
      teacherFormatted: scheduleData.teacher || 'TBA',
      commentsFormatted: scheduleData.comments || 'No additional comments',
      // Include class data if available
      ...(classData && {
        className: classData.type,
        classTime: classData.time,
        classPrice: `£${classData.price?.toFixed(2) || '0.00'}`,
      }),
    };
  },

  // Get class types (based on coursework specification)
  getClassTypes: () => {
    return ['Flow Yoga', 'Aerial Yoga', 'Family Yoga'];
  },

  // Get days of week
  getDaysOfWeek: () => {
    return [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
  },

  // Check if instance is bookable
  isInstanceBookable: (instance, classData = null) => {
    const today = new Date().toISOString().split('T')[0];
    const isInFuture = instance.date > today;

    // If we have class data, we could check capacity
    // For now, just check if it's in the future
    return isInFuture;
  },

  // Get collection names (for debugging/reference)
  getCollectionNames: () => {
    return COLLECTIONS;
  },

  // Convert Java entity to Firestore document
  yogaCourseToFirestore: (yogaCourse) => {
    return {
      dayOfWeek: yogaCourse.dayOfWeek,
      time: yogaCourse.time,
      capacity: yogaCourse.capacity,
      duration: yogaCourse.duration,
      price: yogaCourse.price,
      type: yogaCourse.type,
      description: yogaCourse.description || '',
      lastUpdated: Date.now(),
    };
  },

  scheduleToFirestore: (schedule) => {
    return {
      courseId: schedule.courseId,
      date: schedule.date,
      teacher: schedule.teacher,
      comments: schedule.comments || '',
      lastUpdated: Date.now(),
    };
  },
};

// Export main service object
export default {
  classes: yogaClassService,
  instances: classInstanceService,
  utils: yogaServiceUtils,
  collections: COLLECTIONS, // Export collection names
};
