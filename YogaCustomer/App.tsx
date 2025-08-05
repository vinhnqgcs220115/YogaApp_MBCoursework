import React from 'react';
import { StatusBar, View, Text } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

const App = () => {
  console.log('App component rendered');
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <AuthProvider>
        <React.Suspense
          fallback={
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Text>Loading App...</Text>
            </View>
          }
        >
          <AppNavigator />
        </React.Suspense>
      </AuthProvider>
    </>
  );
};

export default App;
