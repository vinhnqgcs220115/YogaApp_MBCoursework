// CartContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Initial state
const initialState = {
  items: [],
  totalAmount: 0,
  totalItems: 0,
  loading: false,
  error: null,
};

// Action types
const CART_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  ADD_ITEM: 'ADD_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  UPDATE_QUANTITY: 'UPDATE_QUANTITY',
  CLEAR_CART: 'CLEAR_CART',
  SET_CART: 'SET_CART',
};

// Reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };
    case CART_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    case CART_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };
    case CART_ACTIONS.ADD_ITEM: {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        (item) =>
          item.classId === newItem.classId &&
          item.sessionId === newItem.sessionId
      );

      let updatedItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      } else {
        // Add new item
        updatedItems = [...state.items, newItem];
      }

      const totalAmount = updatedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      const totalItems = updatedItems.reduce(
        (total, item) => total + item.quantity,
        0
      );

      return {
        ...state,
        items: updatedItems,
        totalAmount,
        totalItems,
        error: null,
      };
    }
    case CART_ACTIONS.REMOVE_ITEM: {
      const { classId, sessionId } = action.payload;
      const updatedItems = state.items.filter(
        (item) => !(item.classId === classId && item.sessionId === sessionId)
      );

      const totalAmount = updatedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      const totalItems = updatedItems.reduce(
        (total, item) => total + item.quantity,
        0
      );

      return {
        ...state,
        items: updatedItems,
        totalAmount,
        totalItems,
      };
    }
    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { classId, sessionId, quantity } = action.payload;

      if (quantity <= 0) {
        return cartReducer(state, {
          type: CART_ACTIONS.REMOVE_ITEM,
          payload: { classId, sessionId },
        });
      }

      const updatedItems = state.items.map((item) =>
        item.classId === classId && item.sessionId === sessionId
          ? { ...item, quantity }
          : item
      );

      const totalAmount = updatedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      const totalItems = updatedItems.reduce(
        (total, item) => total + item.quantity,
        0
      );

      return {
        ...state,
        items: updatedItems,
        totalAmount,
        totalItems,
      };
    }
    case CART_ACTIONS.CLEAR_CART:
      return {
        ...state,
        items: [],
        totalAmount: 0,
        totalItems: 0,
      };
    case CART_ACTIONS.SET_CART: {
      const items = action.payload;
      const totalAmount = items.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      );
      const totalItems = items.reduce(
        (total, item) => total + item.quantity,
        0
      );

      return {
        ...state,
        items,
        totalAmount,
        totalItems,
        loading: false,
      };
    }
    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Cart Provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();

  // Helper functions
  const setLoading = (loading) => {
    dispatch({ type: CART_ACTIONS.SET_LOADING, payload: loading });
  };

  const setError = (error) => {
    dispatch({ type: CART_ACTIONS.SET_ERROR, payload: error });
  };

  const clearError = () => {
    dispatch({ type: CART_ACTIONS.CLEAR_ERROR });
  };

  // Add item to cart
  const addToCart = (yogaClass, session, quantity = 1) => {
    try {
      clearError();

      if (!yogaClass || !session) {
        throw new Error('Invalid class or session data');
      }

      const cartItem = {
        classId: yogaClass.id,
        sessionId: session.id,
        className: yogaClass.name,
        classDescription: yogaClass.description,
        sessionDate: session.date,
        sessionTime: session.time,
        duration: yogaClass.duration,
        instructor: yogaClass.instructor,
        price: yogaClass.price,
        quantity,
        addedAt: new Date().toISOString(),
      };

      dispatch({ type: CART_ACTIONS.ADD_ITEM, payload: cartItem });

      // Save to local storage for persistence
      saveCartToStorage([...state.items, cartItem]);

      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  // Remove item from cart
  const removeFromCart = (classId, sessionId) => {
    try {
      clearError();
      dispatch({
        type: CART_ACTIONS.REMOVE_ITEM,
        payload: { classId, sessionId },
      });

      const updatedItems = state.items.filter(
        (item) => !(item.classId === classId && item.sessionId === sessionId)
      );
      saveCartToStorage(updatedItems);

      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  // Update item quantity
  const updateQuantity = (classId, sessionId, quantity) => {
    try {
      clearError();
      dispatch({
        type: CART_ACTIONS.UPDATE_QUANTITY,
        payload: { classId, sessionId, quantity },
      });

      let updatedItems;
      if (quantity <= 0) {
        updatedItems = state.items.filter(
          (item) => !(item.classId === classId && item.sessionId === sessionId)
        );
      } else {
        updatedItems = state.items.map((item) =>
          item.classId === classId && item.sessionId === sessionId
            ? { ...item, quantity }
            : item
        );
      }

      saveCartToStorage(updatedItems);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  // Clear entire cart
  const clearCart = () => {
    try {
      clearError();
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
      saveCartToStorage([]);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  // Check if item is in cart
  const isInCart = (classId, sessionId) => {
    return state.items.some(
      (item) => item.classId === classId && item.sessionId === sessionId
    );
  };

  // Get item quantity in cart
  const getItemQuantity = (classId, sessionId) => {
    const item = state.items.find(
      (item) => item.classId === classId && item.sessionId === sessionId
    );
    return item ? item.quantity : 0;
  };

  // Save cart to local storage (for persistence across app restarts)
  const saveCartToStorage = async (items) => {
    try {
      // In a real app, you might want to save this to AsyncStorage
      // For now, we'll just keep it in memory
      console.log('Cart saved:', items);
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  // Load cart from storage
  const loadCartFromStorage = async () => {
    try {
      setLoading(true);
      // In a real app, you would load from AsyncStorage
      // For now, we'll just initialize with empty cart
      dispatch({ type: CART_ACTIONS.SET_CART, payload: [] });
    } catch (error) {
      console.error('Error loading cart:', error);
      setError('Failed to load cart');
    }
  };

  // Validate cart items (check if classes/sessions still exist)
  const validateCartItems = async () => {
    try {
      // This would typically involve checking with your yoga service
      // to ensure all cart items are still valid/available
      console.log('Validating cart items...');
    } catch (error) {
      console.error('Error validating cart:', error);
    }
  };

  // Load cart when user changes or component mounts
  useEffect(() => {
    if (user) {
      loadCartFromStorage();
    } else {
      // Clear cart when user logs out
      dispatch({ type: CART_ACTIONS.CLEAR_CART });
    }
  }, [user]);

  // Context value
  const value = {
    // State
    items: state.items,
    totalAmount: state.totalAmount,
    totalItems: state.totalItems,
    loading: state.loading,
    error: state.error,

    // Actions
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    clearError,

    // Helper functions
    isInCart,
    getItemQuantity,
    validateCartItems,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
