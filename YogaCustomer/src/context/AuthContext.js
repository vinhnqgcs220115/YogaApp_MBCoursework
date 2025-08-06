// AuthContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';

// Initial state
const initialState = {
  user: null,
  userProfile: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_USER_PROFILE: 'SET_USER_PROFILE',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SIGN_OUT: 'SIGN_OUT',
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
        error: null,
      };
    case AUTH_ACTIONS.SET_USER_PROFILE:
      return {
        ...state,
        userProfile: action.payload,
      };
    case AUTH_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case AUTH_ACTIONS.SIGN_OUT:
      return {
        ...initialState,
        loading: false,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Helper functions
  const setLoading = (loading) => {
    dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  };

  // Fetch user profile from Firestore
  const fetchUserProfile = async (userId) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const profileData = userDoc.data();
        dispatch({ type: AUTH_ACTIONS.SET_USER_PROFILE, payload: profileData });
        return profileData;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  // Create user profile in Firestore
  const createUserProfile = async (userId, profileData) => {
    try {
      const userProfile = {
        uid: userId,
        email: profileData.email,
        displayName: profileData.displayName || '',
        photoURL: profileData.photoURL || '',
        phoneNumber: profileData.phoneNumber || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        bookings: [],
        preferences: {
          notifications: true,
          newsletter: false,
        },
      };

      await setDoc(doc(db, 'users', userId), userProfile);
      dispatch({ type: AUTH_ACTIONS.SET_USER_PROFILE, payload: userProfile });
      return userProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  };

  // Sign up function
  const signUp = async (email, password, displayName) => {
    try {
      setLoading(true);
      clearError();
      console.log('🔐 Attempting sign up for:', email);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update display name
      if (displayName) {
        await updateProfile(user, { displayName });
      }

      // Create user profile in Firestore
      await createUserProfile(user.uid, {
        email: user.email,
        displayName: displayName || '',
        photoURL: user.photoURL,
      });

      console.log('✅ Sign up successful:', user.email);
      return user;
    } catch (error) {
      console.error('❌ Sign up error:', error);

      // Provide user-friendly error messages
      let userFriendlyMessage = error.message;

      switch (error.code) {
        case 'auth/email-already-in-use':
          userFriendlyMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          userFriendlyMessage = 'Please enter a valid email address.';
          break;
        case 'auth/operation-not-allowed':
          userFriendlyMessage = 'Email/password accounts are not enabled.';
          break;
        case 'auth/weak-password':
          userFriendlyMessage = 'Password should be at least 6 characters.';
          break;
        case 'auth/network-request-failed':
          userFriendlyMessage = 'Network error. Please check your connection.';
          break;
        default:
          userFriendlyMessage = 'Account creation failed. Please try again.';
      }

      setError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    }
  };

  // Sign in function
  const signIn = async (email, password) => {
    try {
      setLoading(true);
      clearError();
      console.log('🔐 Attempting sign in for:', email);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      console.log('✅ Sign in successful:', user.email);
      return user;
    } catch (error) {
      console.error('❌ Sign in error:', error);

      // Provide user-friendly error messages
      let userFriendlyMessage = error.message;

      switch (error.code) {
        case 'auth/user-not-found':
          userFriendlyMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          userFriendlyMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          userFriendlyMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          userFriendlyMessage = 'This account has been disabled.';
          break;
        case 'auth/too-many-requests':
          userFriendlyMessage =
            'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          userFriendlyMessage = 'Network error. Please check your connection.';
          break;
        default:
          userFriendlyMessage = 'Sign in failed. Please try again.';
      }

      setError(userFriendlyMessage);
      throw new Error(userFriendlyMessage);
    }
  };

  // Sign out function
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      dispatch({ type: AUTH_ACTIONS.SIGN_OUT });
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Reset password function
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      clearError();
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Method to refresh user data
  const refreshUserData = async () => {
    if (!state.user) return;

    try {
      setLoading(true);
      await fetchUserProfile(state.user.uid);
      console.log('✅ User data refreshed');
    } catch (error) {
      console.error('❌ Error refreshing user data:', error);
      setError('Failed to refresh user data');
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      setLoading(true);
      clearError();

      if (!state.user) {
        throw new Error('No user logged in');
      }

      // Update Firebase Auth profile if needed
      if (updates.displayName || updates.photoURL) {
        await updateProfile(state.user, {
          displayName: updates.displayName || state.user.displayName,
          photoURL: updates.photoURL || state.user.photoURL,
        });
      }

      // Update Firestore profile
      const updatedProfile = {
        ...state.userProfile,
        ...updates,
        updatedAt: new Date().toISOString(),
      };

      await updateDoc(doc(db, 'users', state.user.uid), updatedProfile);
      dispatch({
        type: AUTH_ACTIONS.SET_USER_PROFILE,
        payload: updatedProfile,
      });

      setLoading(false);
      return updatedProfile;
    } catch (error) {
      setError(error.message);
      throw error;
    }
  };

  // Listen to auth state changes
  useEffect(() => {
    let mounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!mounted) return;

        try {
          console.log('🔐 Auth state changed:', user ? user.email : 'No user');

          if (user) {
            // User is signed in
            dispatch({ type: AUTH_ACTIONS.SET_USER, payload: user });

            // Fetch user profile in the background
            try {
              await fetchUserProfile(user.uid);
            } catch (profileError) {
              console.warn(
                'Warning: Could not fetch user profile:',
                profileError
              );
              // Don't block authentication if profile fetch fails
            }
          } else {
            // User is signed out
            console.log('🔐 User signed out');
            dispatch({ type: AUTH_ACTIONS.SIGN_OUT });
          }
        } catch (error) {
          console.error('Error in auth state listener:', error);
          if (mounted) {
            setError(`Authentication error: ${error.message}`);
          }
        }
      },
      (error) => {
        console.error('Auth state change error:', error);
        if (mounted) {
          setError(`Authentication error: ${error.message}`);
        }
      }
    );

    // Cleanup function
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  // Context value
  const value = {
    // State
    user: state.user,
    userProfile: state.userProfile,
    loading: state.loading,
    error: state.error,
    isAuthenticated: state.isAuthenticated,

    // Actions
    signUp,
    signIn,
    logout,
    resetPassword,
    updateUserProfile,
    clearError,
    refreshUserData,

    // Helper functions
    fetchUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
