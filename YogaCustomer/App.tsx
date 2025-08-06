// App.tsx
import React from 'react';
import { StatusBar } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import { colors } from './src/utils/colors';

const App = () => {
  return (
    <>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.background.primary}
        translucent={false}
      />
      <AuthProvider>
        <CartProvider>
          <AppNavigator />
        </CartProvider>
      </AuthProvider>
    </>
  );
};

export default App;
