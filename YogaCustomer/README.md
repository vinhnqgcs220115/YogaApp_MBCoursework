# YogaCustomer - Yoga Studio Customer App

## Overview

YogaCustomer is a React Native mobile application designed for yoga studio customers to browse classes, book sessions, and manage their yoga experience. Built with React Native and Firebase, it provides a modern, intuitive interface for customers to discover and book yoga classes.

## Features

### 1. Authentication System

**Core Files:**

- `src/context/AuthContext.js` - Authentication state management
- `src/screens/auth/SignInScreen.js` - User sign-in interface
- `src/screens/auth/SignUpScreen.js` - User registration interface
- `src/screens/auth/OnboardingScreen.js` - First-time user onboarding
- `src/navigation/AuthNavigator.js` - Authentication navigation flow

**Key Features:**

- **User Registration**: Email and password-based account creation
- **User Sign-in**: Secure authentication with Firebase Auth
- **Password Reset**: Forgot password functionality
- **Profile Management**: User profile creation and updates
- **Onboarding Flow**: First-time user experience
- **Session Persistence**: Automatic login state management

**Core Code Implementation:**

```javascript
// Authentication context with Firebase integration
const signIn = async (email, password) => {
  try {
    setLoading(true);
    clearError();

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Fetch user profile from Firestore
    await fetchUserProfile(user.uid);

    dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });
  } catch (error) {
    console.error('Sign in error:', error);
    setError(getAuthErrorMessage(error.code));
  } finally {
    setLoading(false);
  }
};

// Real-time form validation
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handleSignIn = async () => {
  if (!email.trim() || !password.trim()) {
    Alert.alert('Missing Information', 'Please enter both email and password');
    return;
  }

  if (!validateEmail(email.trim())) {
    Alert.alert('Invalid Email', 'Please enter a valid email address');
    return;
  }

  try {
    setIsLoading(true);
    clearError();
    await signIn(email.trim(), password);
  } catch (error) {
    // Error is handled by AuthContext
  } finally {
    setIsLoading(false);
  }
};
```

### 2. Yoga Class Discovery System

**Core Files:**

- `src/screens/yoga/YogaScreen.js` - Main yoga class listing
- `src/screens/yoga/ClassDetailScreen.js` - Detailed class information
- `src/services/yogaService.js` - Yoga class data operations
- `src/components/common/Loading.js` - Loading states

**Key Features:**

- **Class Browsing**: Browse available yoga classes
- **Class Details**: View detailed class information
- **Class Filtering**: Filter by type, day, or time
- **Real-time Updates**: Live updates from Firebase
- **Offline Support**: Cached data for offline viewing
- **Search Functionality**: Search classes by name or type

**Core Code Implementation:**

```javascript
// Yoga class service with Firebase integration
export const yogaClassService = {
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
          dayOfWeek: data.dayOfWeek,
          time: data.time,
          capacity: data.capacity,
          duration: data.duration,
          price: data.price,
          type: data.type,
          description: data.description,
          lastUpdated: data.lastUpdated,
          ...data,
        });
      });

      console.log(`✅ Fetched ${classes.length} classes`);
      return classes;
    } catch (error) {
      console.error('❌ Error fetching classes:', error);
      throw new Error(`Failed to fetch classes: ${error.message}`);
    }
  },

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
};
```

### 3. Booking and Shopping Cart System

**Core Files:**

- `src/services/bookingService.js` - Booking and cart operations
- `src/context/CartContext.js` - Shopping cart state management
- `src/screens/yoga/ClassDetailScreen.js` - Booking interface
- `src/components/common/Button.js` - Reusable UI components

**Key Features:**

- **Shopping Cart**: Add classes to cart for batch booking
- **Class Booking**: Direct booking of individual classes
- **Cart Management**: View, modify, and checkout cart items
- **Booking History**: Track past and upcoming bookings
- **Payment Integration**: Ready for payment gateway integration
- **Booking Confirmation**: Email confirmations and receipts

**Core Code Implementation:**

```javascript
// Shopping cart service with Firebase integration
export const shoppingCartService = {
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
        courseId: cartItem.courseId,
        instanceId: cartItem.instanceId,
        className: cartItem.className,
        classType: cartItem.classType,
        teacher: cartItem.teacher,
        date: cartItem.date,
        time: cartItem.time,
        duration: cartItem.duration,
        price: cartItem.price,
        quantity: cartItem.quantity || 1,
        dayOfWeek: cartItem.dayOfWeek,
        capacity: cartItem.capacity,
        description: cartItem.description,
        comments: cartItem.comments,
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

      for (const doc of querySnapshot.docs) {
        const data = doc.data();
        cartItems.push({
          id: doc.id,
          ...data,
        });
      }

      console.log(`✅ Fetched ${cartItems.length} cart items`);
      return cartItems;
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      throw new Error(`Failed to fetch cart: ${error.message}`);
    }
  },
};
```

### 4. Navigation and User Experience

**Core Files:**

- `src/navigation/AppNavigator.js` - Main app navigation
- `src/navigation/TabNavigator.js` - Tab-based navigation
- `src/navigation/AuthNavigator.js` - Authentication flow
- `src/utils/colors.js` - Design system colors
- `src/utils/fonts.js` - Typography system

**Key Features:**

- **Tab Navigation**: Home, Classes, Profile, Cart tabs
- **Stack Navigation**: Deep linking and screen transitions
- **Authentication Flow**: Seamless auth state management
- **Loading States**: Smooth loading animations
- **Error Handling**: User-friendly error messages
- **Responsive Design**: Adaptive layouts for different devices

**Core Code Implementation:**

```javascript
// Main app navigator with authentication flow
const AppNavigator = () => {
  const { user, loading: authLoading } = useAuth();
  const [isFirstLaunch, setIsFirstLaunch] = useState(null);
  const [appInitialized, setAppInitialized] = useState(false);

  // Check if this is the first app launch
  useEffect(() => {
    const checkFirstLaunch = async () => {
      try {
        console.log('Checking first launch status...');
        const hasLaunchedBefore = await AsyncStorage.getItem(
          '@app_has_launched'
        );

        if (hasLaunchedBefore === null) {
          console.log('First launch detected');
          setIsFirstLaunch(true);
          await AsyncStorage.setItem('@app_has_launched', 'true');
        } else {
          console.log('Not first launch');
          setIsFirstLaunch(false);
        }
      } catch (error) {
        console.error('Error checking first launch:', error);
        setIsFirstLaunch(false);
      } finally {
        setAppInitialized(true);
      }
    };

    checkFirstLaunch();
  }, []);

  // Show loading screen while checking first launch or auth state
  if (!appInitialized || authLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background.primary },
        }}
      >
        {!user ? (
          // User is not authenticated
          <>
            {isFirstLaunch && (
              <Stack.Screen
                name="Onboarding"
                component={OnboardingScreen}
                options={{ animationEnabled: false }}
              />
            )}
            <Stack.Screen
              name="Auth"
              component={AuthNavigator}
              options={{ animationEnabled: !isFirstLaunch }}
            />
          </>
        ) : (
          // User is authenticated
          <Stack.Screen
            name="MainApp"
            component={TabNavigator}
            options={{ animationEnabled: true }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### 5. Firebase Integration and Data Management

**Core Files:**

- `src/services/firebase.js` - Firebase configuration
- `src/services/apiIntegration.js` - API integration utilities
- `src/utils/serviceTest.js` - Service testing utilities

**Key Features:**

- **Firebase Firestore**: Real-time database integration
- **Firebase Auth**: Secure user authentication
- **Offline Persistence**: Local data caching
- **Real-time Updates**: Live data synchronization
- **Error Handling**: Robust error management
- **Data Validation**: Input validation and sanitization

**Core Code Implementation:**

```javascript
// Firebase configuration and initialization
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Enable offline persistence
enableNetwork(db);
```

### 6. User Profile and Settings

**Core Files:**

- `src/screens/profile/ProfileScreen.js` - User profile interface
- `src/context/AuthContext.js` - Profile state management
- `src/services/firebase.js` - Profile data operations

**Key Features:**

- **Profile Management**: View and edit user profile
- **Booking History**: Track past and upcoming bookings
- **Preferences**: User preferences and settings
- **Account Settings**: Password change, email updates
- **Notifications**: Push notification preferences
- **Data Export**: Export personal data

### 7. UI/UX Components

**Core Files:**

- `src/components/common/Button.js` - Reusable button component
- `src/components/common/Loading.js` - Loading indicator
- `src/components/common/ErrorMessage.js` - Error display
- `src/utils/colors.js` - Color system
- `src/utils/fonts.js` - Typography system

**Key Features:**

- **Design System**: Consistent color and typography
- **Reusable Components**: Modular UI components
- **Accessibility**: Screen reader support
- **Animations**: Smooth transitions and micro-interactions
- **Responsive Design**: Adaptive layouts
- **Dark Mode**: Theme support (planned)

## Technical Architecture

### Firebase Collections

- **yoga_courses**: Yoga class information from admin app
- **schedules**: Class schedule instances
- **users**: User profile information
- **bookings**: User booking records
- **shoppingCart**: Shopping cart items

### State Management

- **AuthContext**: Authentication and user state
- **CartContext**: Shopping cart state management
- **React Navigation**: Navigation state management

### Key Dependencies

- **React Native**: Core framework
- **Firebase**: Backend services
- **React Navigation**: Navigation system
- **AsyncStorage**: Local data persistence
- **React Native Vector Icons**: Icon library

## Installation and Setup

1. **Prerequisites:**

   - Node.js 16+
   - React Native CLI
   - Android Studio / Xcode
   - Firebase project setup

2. **Setup Steps:**

   ```bash
   # Install dependencies
   npm install

   # iOS setup (macOS only)
   cd ios && pod install && cd ..

   # Start Metro bundler
   npx react-native start

   # Run on Android
   npx react-native run-android

   # Run on iOS
   npx react-native run-ios
   ```

3. **Environment Configuration:**
   - Create `.env` file with Firebase configuration
   - Configure Firebase project settings
   - Set up authentication providers

## Usage Instructions

1. **Getting Started:**

   - Download and install the app
   - Complete onboarding flow
   - Create account or sign in
   - Grant necessary permissions

2. **Browsing Classes:**

   - Navigate to Classes tab
   - Browse available yoga classes
   - Use filters to find specific classes
   - View class details and schedules

3. **Booking Classes:**

   - Select desired class and time
   - Add to cart or book directly
   - Complete booking process
   - Receive confirmation

4. **Managing Account:**
   - Access profile tab
   - View booking history
   - Update personal information
   - Manage preferences

## Security Features

- **Firebase Security Rules**: Data access control
- **Input Validation**: Client-side validation
- **Authentication**: Secure user authentication
- **Data Encryption**: Firebase data encryption
- **Session Management**: Secure session handling

## Performance Optimizations

- **Lazy Loading**: Component lazy loading
- **Image Optimization**: Optimized image loading
- **Caching**: Firebase offline persistence
- **Memory Management**: Proper cleanup and lifecycle
- **Bundle Optimization**: Code splitting and tree shaking

## Testing and Quality Assurance

- **Unit Testing**: Jest test framework
- **Component Testing**: React Native Testing Library
- **Integration Testing**: Firebase integration tests
- **Error Monitoring**: Crash reporting and analytics
- **Performance Monitoring**: App performance tracking

## Future Enhancements

- **Push Notifications**: Real-time class updates
- **Payment Integration**: Stripe/PayPal integration
- **Social Features**: Class reviews and ratings
- **Advanced Analytics**: User behavior tracking
- **Multi-language Support**: Internationalization
- **Apple Watch Integration**: Health app integration
- **AR Features**: Virtual class previews
- **Live Streaming**: Real-time class streaming
