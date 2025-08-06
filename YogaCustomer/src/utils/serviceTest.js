import {
  yogaClassService,
  classInstanceService,
} from '../services/yogaService';
import {
  shoppingCartService,
  bookingService,
} from '../services/bookingService';
import {
  YogaCourseModel,
  ScheduleModel,
  CartItemModel,
  validationUtils,
  formatUtils,
} from './dataModels';

/**
 * COMPLETE SERVICE INTEGRATION TEST
 * Tests Steps 5-7: Firebase Services + API Integration + Data Models & Validation
 */

export const serviceIntegrationTest = {
  // Test 1: Yoga Classes Service with Data Models
  testYogaClassesWithModels: async () => {
    console.log('🧪 Testing Yoga Classes Service with Data Models...');

    try {
      // Fetch classes from Firestore
      const classesData = await yogaClassService.getAllClasses();
      console.log(`📊 Raw classes from Firestore: ${classesData.length}`);

      // Convert to data models
      const classModels = classesData.map((classData) =>
        YogaCourseModel.fromFirestore(classData.id, classData)
      );

      // Validate each model
      let validCount = 0;
      let invalidCount = 0;
      const validationErrors = [];

      classModels.forEach((model, index) => {
        const validation = model.validate();
        if (validation.isValid) {
          validCount++;
        } else {
          invalidCount++;
          validationErrors.push({
            index,
            id: model.id,
            errors: validation.errors,
          });
        }
      });

      console.log(`✅ Valid classes: ${validCount}`);
      console.log(`❌ Invalid classes: ${invalidCount}`);

      if (invalidCount > 0) {
        console.warn('Validation errors found:', validationErrors);
      }

      // Test formatted display data
      const displayData = classModels
        .filter((model) => model.validate().isValid)
        .map((model) => model.getDisplayFormat());

      console.log('📋 Sample display format:', displayData[0]);

      // Test search functionality
      const flowClasses = await yogaClassService.searchClassesByType(
        'Flow Yoga'
      );
      console.log(`🔍 Flow Yoga classes found: ${flowClasses.length}`);

      return {
        success: true,
        totalClasses: classesData.length,
        validClasses: validCount,
        invalidClasses: invalidCount,
        flowClassesCount: flowClasses.length,
        validationErrors: invalidCount > 0 ? validationErrors : null,
      };
    } catch (error) {
      console.error('❌ Yoga Classes test failed:', error);
      return {
        success: false,
        error: error.message,
        details: error,
      };
    }
  },

  // Test 2: Schedules Service with Data Models
  testSchedulesWithModels: async () => {
    console.log('🧪 Testing Schedules Service with Data Models...');

    try {
      // Get available instances (schedules)
      const schedulesData = await classInstanceService.getAvailableInstances();
      console.log(`📊 Available schedules: ${schedulesData.length}`);

      // Convert to data models
      const scheduleModels = schedulesData.map((scheduleData) =>
        ScheduleModel.fromFirestore(scheduleData.id, scheduleData)
      );

      // Validate models
      let validCount = 0;
      const validationErrors = [];

      scheduleModels.forEach((model, index) => {
        const validation = model.validate();
        if (validation.isValid) {
          validCount++;
        } else {
          validationErrors.push({
            index,
            id: model.id,
            errors: validation.errors,
          });
        }
      });

      console.log(`✅ Valid schedules: ${validCount}`);
      console.log(
        `❌ Invalid schedules: ${scheduleModels.length - validCount}`
      );

      // Test teacher search
      const teacherSchedules =
        await classInstanceService.searchInstancesByTeacher('HAKUNA');
      console.log(`🔍 HAKUNA's schedules: ${teacherSchedules.length}`);

      // Test display formatting
      if (scheduleModels.length > 0) {
        const sampleSchedule = scheduleModels[0];
        console.log(
          '📋 Sample schedule display:',
          sampleSchedule.getDisplayFormat()
        );
      }

      return {
        success: true,
        totalSchedules: schedulesData.length,
        validSchedules: validCount,
        teacherSchedules: teacherSchedules.length,
        validationErrors: validationErrors.length > 0 ? validationErrors : null,
      };
    } catch (error) {
      console.error('❌ Schedules test failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Test 3: Cart Service with Data Models
  testCartWithModels: async () => {
    console.log('🧪 Testing Cart Service with Data Models...');

    const testUserId = `test-user-${Date.now()}`;

    try {
      // Get some real class and schedule data
      const classes = await yogaClassService.getAllClasses();
      const schedules = await classInstanceService.getAvailableInstances();

      if (classes.length === 0 || schedules.length === 0) {
        throw new Error(
          'No test data available - need classes and schedules in Firestore'
        );
      }

      // Create a cart item model
      const sampleClass = classes[0];
      const sampleSchedule =
        schedules.find((s) => s.courseId == sampleClass.id) || schedules[0];

      const cartItemData = {
        userId: testUserId,
        courseId: sampleClass.id,
        instanceId: sampleSchedule.id,
        className: sampleClass.type,
        classType: sampleClass.type,
        teacher: sampleSchedule.teacher,
        date: sampleSchedule.date,
        time: sampleClass.time,
        duration: sampleClass.duration,
        price: sampleClass.price,
        quantity: 1,
        dayOfWeek: sampleClass.dayOfWeek,
        capacity: sampleClass.capacity,
        description: sampleClass.description,
        comments: sampleSchedule.comments,
      };

      // Create and validate cart item model
      const cartModel = new CartItemModel(cartItemData);
      const validation = cartModel.validate();

      if (!validation.isValid) {
        console.error('Cart model validation failed:', validation.errors);
        return {
          success: false,
          error: 'Cart model validation failed',
          validationErrors: validation.errors,
        };
      }

      console.log('✅ Cart model validation passed');
      console.log('📋 Cart item display format:', cartModel.getDisplayFormat());

      // Test adding to cart
      const addedItem = await shoppingCartService.addToCart(
        testUserId,
        cartItemData
      );
      console.log('✅ Item added to cart:', addedItem.id);

      // Test getting cart
      const cartItems = await shoppingCartService.getUserCart(testUserId);
      console.log('✅ Cart items retrieved:', cartItems.length);

      // Test cart summary
      const cartSummary = await shoppingCartService.getCartSummary(testUserId);
      console.log('✅ Cart summary:', cartSummary);

      // Clean up - remove test item
      if (addedItem.id) {
        await shoppingCartService.removeFromCart(addedItem.id);
        console.log('✅ Test cart item cleaned up');
      }

      return {
        success: true,
        cartModel: cartModel.getDisplayFormat(),
        cartSummary,
        validationPassed: true,
      };
    } catch (error) {
      console.error('❌ Cart test failed:', error);

      // Try to clean up any test data
      try {
        await shoppingCartService.clearCart(testUserId);
      } catch (cleanupError) {
        console.warn('Cleanup failed:', cleanupError.message);
      }

      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Test 4: Full Booking Flow
  testFullBookingFlow: async () => {
    console.log('🧪 Testing Full Booking Flow...');

    const testUserId = `test-booking-user-${Date.now()}`;
    const testUserEmail = 'test@universalyoga.com';

    try {
      // Get test data
      const classes = await yogaClassService.getAllClasses();
      const schedules = await classInstanceService.getAvailableInstances();

      if (classes.length === 0 || schedules.length === 0) {
        throw new Error('No test data available');
      }

      // Create cart items
      const cartItems = [];
      for (let i = 0; i < Math.min(2, classes.length, schedules.length); i++) {
        const classData = classes[i];
        const scheduleData =
          schedules.find((s) => s.courseId == classData.id) || schedules[i];

        const cartItem = {
          id: `temp-cart-${i}`,
          userId: testUserId,
          courseId: classData.id,
          instanceId: scheduleData.id,
          className: classData.type,
          classType: classData.type,
          teacher: scheduleData.teacher,
          date: scheduleData.date,
          time: classData.time,
          duration: classData.duration,
          price: classData.price,
          quantity: 1,
          dayOfWeek: classData.dayOfWeek,
          description: classData.description,
          comments: scheduleData.comments,
        };

        // Validate cart item
        const cartModel = new CartItemModel(cartItem);
        const validation = cartModel.validate();

        if (validation.isValid) {
          cartItems.push(cartItem);
        } else {
          console.warn(`Invalid cart item ${i}:`, validation.errors);
        }
      }

      if (cartItems.length === 0) {
        throw new Error('No valid cart items created');
      }

      console.log(`✅ Created ${cartItems.length} valid cart items`);

      // Test booking submission
      const booking = await bookingService.submitBooking(
        testUserId,
        testUserEmail,
        cartItems,
        {
          method: 'test',
          amount: cartItems.reduce((sum, item) => sum + item.price, 0),
        }
      );

      console.log('✅ Booking created:', booking.id);
      console.log('📊 Booking summary:', booking.summary);

      // Test booking retrieval
      const userBookings = await bookingService.getUserBookings(testUserId);
      console.log('✅ User bookings retrieved:', userBookings.length);

      // Test booking details
      const bookingDetails = await bookingService.getBookingById(booking.id);
      console.log('✅ Booking details retrieved');

      // Test booking statistics
      const bookingStats = await bookingService.getBookingStats(testUserId);
      console.log('✅ Booking statistics:', bookingStats);

      // Test booking cancellation
      const cancelResult = await bookingService.cancelBooking(
        booking.id,
        testUserId
      );
      console.log('✅ Booking cancelled:', cancelResult);

      return {
        success: true,
        bookingId: booking.id,
        totalItems: cartItems.length,
        totalAmount: booking.summary.totalAmount,
        bookingStats,
        bookingCancelled: cancelResult,
      };
    } catch (error) {
      console.error('❌ Full booking flow test failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Test 5: Validation Utils
  testValidationUtils: () => {
    console.log('🧪 Testing Validation Utilities...');

    const testCases = [
      // Email validation
      { test: 'validEmail', input: 'test@example.com', expected: true },
      { test: 'invalidEmail', input: 'invalid-email', expected: false },

      // Date validation
      { test: 'validDate', input: '2025-08-10', expected: true },
      { test: 'invalidDate', input: '2025-13-32', expected: false },

      // Time validation
      { test: 'validTime', input: '14:30', expected: true },
      { test: 'invalidTime', input: '25:70', expected: false },

      // Price validation
      { test: 'validPrice', input: 45.5, expected: true },
      { test: 'invalidPrice', input: -10, expected: false },

      // Capacity validation
      { test: 'validCapacity', input: 20, expected: true },
      { test: 'invalidCapacity', input: 0, expected: false },

      // Duration validation
      { test: 'validDuration', input: 60, expected: true },
      { test: 'invalidDuration', input: 600, expected: false }, // > 480 mins (8 hours)
    ];

    let passedTests = 0;
    let failedTests = 0;
    const results = [];

    testCases.forEach((testCase) => {
      try {
        let result;
        switch (testCase.test) {
          case 'validEmail':
          case 'invalidEmail':
            result = validationUtils.isValidEmail(testCase.input);
            break;
          case 'validDate':
          case 'invalidDate':
            result = validationUtils.isValidDate(testCase.input);
            break;
          case 'validTime':
          case 'invalidTime':
            result = validationUtils.isValidTime(testCase.input);
            break;
          case 'validPrice':
          case 'invalidPrice':
            result = validationUtils.isValidPrice(testCase.input);
            break;
          case 'validCapacity':
          case 'invalidCapacity':
            result = validationUtils.isValidCapacity(testCase.input);
            break;
          case 'validDuration':
          case 'invalidDuration':
            result = validationUtils.isValidDuration(testCase.input);
            break;
          default:
            result = false;
        }

        if (result === testCase.expected) {
          passedTests++;
          results.push({ ...testCase, result, status: 'PASS' });
          console.log(`✅ ${testCase.test}: PASS`);
        } else {
          failedTests++;
          results.push({ ...testCase, result, status: 'FAIL' });
          console.log(
            `❌ ${testCase.test}: FAIL (expected ${testCase.expected}, got ${result})`
          );
        }
      } catch (error) {
        failedTests++;
        results.push({ ...testCase, error: error.message, status: 'ERROR' });
        console.log(`💥 ${testCase.test}: ERROR - ${error.message}`);
      }
    });

    console.log(
      `📊 Validation tests summary: ${passedTests} passed, ${failedTests} failed`
    );

    return {
      success: failedTests === 0,
      passedTests,
      failedTests,
      results,
    };
  },

  // Test 6: Format Utils
  testFormatUtils: () => {
    console.log('🧪 Testing Format Utilities...');

    const testData = {
      price: 45.5,
      duration: 90,
      date: '2025-08-10',
      time: '14:30',
      capacity: { current: 5, total: 20 },
    };

    try {
      const formatted = {
        price: formatUtils.formatPrice(testData.price),
        duration: formatUtils.formatDuration(testData.duration),
        date: formatUtils.formatDate(testData.date),
        dateShort: formatUtils.formatDateShort(testData.date),
        time: formatUtils.formatTime(testData.time),
        capacity: formatUtils.formatCapacity(
          testData.capacity.current,
          testData.capacity.total
        ),
      };

      console.log('✅ Formatting results:', formatted);

      // Verify expected formats
      const expectations = {
        price: '£45.50',
        duration: '1h 30m',
        time: '2:30 PM',
        capacity: '15 of 20 spots available',
      };

      let formatTests = 0;
      let formatPassed = 0;

      Object.keys(expectations).forEach((key) => {
        formatTests++;
        if (formatted[key] === expectations[key]) {
          formatPassed++;
          console.log(`✅ Format ${key}: ${formatted[key]}`);
        } else {
          console.log(
            `❌ Format ${key}: expected "${expectations[key]}", got "${formatted[key]}"`
          );
        }
      });

      return {
        success: formatPassed === formatTests,
        formatted,
        testsPassed: formatPassed,
        totalTests: formatTests,
      };
    } catch (error) {
      console.error('❌ Format utils test failed:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  // Master test runner
  runAllIntegrationTests: async () => {
    console.log('🚀 Starting Complete Service Integration Test Suite...');
    console.log(
      'Testing Steps 5-7: Firebase Services + API Integration + Data Models & Validation\n'
    );

    const testResults = {};

    // Test 1: Yoga Classes with Models
    console.log('='.repeat(60));
    testResults.yogaClasses =
      await serviceIntegrationTest.testYogaClassesWithModels();

    // Test 2: Schedules with Models
    console.log('\n' + '='.repeat(60));
    testResults.schedules =
      await serviceIntegrationTest.testSchedulesWithModels();

    // Test 3: Cart with Models
    console.log('\n' + '='.repeat(60));
    testResults.cart = await serviceIntegrationTest.testCartWithModels();

    // Test 4: Full Booking Flow
    console.log('\n' + '='.repeat(60));
    testResults.bookingFlow =
      await serviceIntegrationTest.testFullBookingFlow();

    // Test 5: Validation Utils
    console.log('\n' + '='.repeat(60));
    testResults.validation = serviceIntegrationTest.testValidationUtils();

    // Test 6: Format Utils
    console.log('\n' + '='.repeat(60));
    testResults.formatting = serviceIntegrationTest.testFormatUtils();

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 COMPLETE TEST SUITE RESULTS');
    console.log('='.repeat(60));

    let totalTests = 0;
    let passedTests = 0;

    Object.keys(testResults).forEach((testName) => {
      const result = testResults[testName];
      totalTests++;
      if (result.success) {
        passedTests++;
        console.log(`✅ ${testName}: PASSED`);
      } else {
        console.log(
          `❌ ${testName}: FAILED - ${result.error || 'See details above'}`
        );
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`🎯 FINAL SCORE: ${passedTests}/${totalTests} tests passed`);

    if (passedTests === totalTests) {
      console.log(
        '🎉 ALL TESTS PASSED! Steps 5-7 are complete and working correctly.'
      );
      console.log('✅ Firebase Services are properly connected');
      console.log('✅ API Integration with Firestore is working');
      console.log('✅ Data Models & Validation are functioning correctly');
      console.log(
        '\n🚀 Ready to proceed to Phase 3: Authentication & Onboarding (Steps 8-10)'
      );
    } else {
      console.log(
        '⚠️  Some tests failed. Please review the errors above and fix issues before proceeding.'
      );
    }

    return {
      success: passedTests === totalTests,
      totalTests,
      passedTests,
      failedTests: totalTests - passedTests,
      results: testResults,
      readyForNextPhase: passedTests === totalTests,
    };
  },

  // Quick diagnostic test
  runQuickDiagnostic: async () => {
    console.log('🔍 Running Quick Diagnostic Test...');

    try {
      // Test 1: Firebase connection
      const { db } = require('../services/firebase');
      console.log('✅ Firebase connection:', !!db);

      // Test 2: Collections access
      const { collection, getDocs } = require('firebase/firestore');
      const collections = ['yoga_courses', 'schedules', 'users'];

      const collectionResults = {};
      for (const collectionName of collections) {
        try {
          const snapshot = await getDocs(collection(db, collectionName));
          collectionResults[collectionName] = {
            exists: true,
            documentCount: snapshot.size,
          };
          console.log(
            `✅ Collection '${collectionName}': ${snapshot.size} documents`
          );
        } catch (error) {
          collectionResults[collectionName] = {
            exists: false,
            error: error.message,
          };
          console.log(`❌ Collection '${collectionName}': ${error.message}`);
        }
      }

      // Test 3: Basic service calls
      let servicesWorking = true;
      try {
        const classes = await yogaClassService.getAllClasses();
        console.log(`✅ Yoga service: ${classes.length} classes retrieved`);
      } catch (error) {
        console.log(`❌ Yoga service error: ${error.message}`);
        servicesWorking = false;
      }

      try {
        const schedules = await classInstanceService.getAvailableInstances();
        console.log(
          `✅ Schedule service: ${schedules.length} schedules retrieved`
        );
      } catch (error) {
        console.log(`❌ Schedule service error: ${error.message}`);
        servicesWorking = false;
      }

      const overallStatus =
        Object.values(collectionResults).every((result) => result.exists) &&
        servicesWorking;

      console.log('\n📋 DIAGNOSTIC SUMMARY:');
      console.log(`Firebase Connection: ${!!db ? 'OK' : 'FAILED'}`);
      console.log(
        `Collections: ${
          Object.values(collectionResults).filter((r) => r.exists).length
        }/${collections.length} accessible`
      );
      console.log(`Services: ${servicesWorking ? 'OK' : 'FAILED'}`);
      console.log(
        `Overall Status: ${overallStatus ? 'READY' : 'NEEDS ATTENTION'}`
      );

      if (overallStatus) {
        console.log(
          '\n🎉 System is ready! You can run the full integration test.'
        );
      } else {
        console.log(
          '\n⚠️  Issues detected. Please check your Firebase configuration and data.'
        );
      }

      return {
        success: overallStatus,
        firebase: !!db,
        collections: collectionResults,
        services: servicesWorking,
        recommendations: overallStatus
          ? ['Run full integration test', 'Proceed to next phase']
          : [
              'Check Firebase configuration',
              'Verify Firestore data exists',
              'Check network connection',
            ],
      };
    } catch (error) {
      console.error('💥 Diagnostic failed:', error);
      return {
        success: false,
        error: error.message,
        recommendations: [
          'Check if Firebase is properly configured',
          'Verify your internet connection',
          'Check if the Firebase project exists',
        ],
      };
    }
  },
};

/**
 * USAGE INSTRUCTIONS
 *
 * Add this to any React component to run tests:
 *
 * import { serviceIntegrationTest } from '../utils/serviceTest';
 *
 * // In your component
 * const runTests = async () => {
 *   // Quick check first
 *   const diagnostic = await serviceIntegrationTest.runQuickDiagnostic();
 *
 *   if (diagnostic.success) {
 *     // Run full test suite
 *     const results = await serviceIntegrationTest.runAllIntegrationTests();
 *     console.log('Test completed:', results);
 *   } else {
 *     console.log('System not ready:', diagnostic.recommendations);
 *   }
 * };
 *
 * // Add a test button to your UI
 * <Button title="Test Services" onPress={runTests} />
 */

export default serviceIntegrationTest;
