module.exports = {
  preset: 'react-native',

  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
    '^.+\\.mjs$': 'babel-jest',
  },

  // Allow these modules to be transpiled by Babel
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-native-async-storage/async-storage|firebase|@firebase|@react-navigation|react-native-gesture-handler)/)',
  ],

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'mjs'],

  moduleNameMapper: {
    // AsyncStorage mock
    '^@react-native-async-storage/async-storage$':
      '@react-native-async-storage/async-storage/jest/async-storage-mock',

    // React Navigation & Gesture Handler mocks
    '^react-native-gesture-handler$':
      '<rootDir>/__mocks__/react-native-gesture-handler.js',
    '^@react-navigation/native$':
      '<rootDir>/__mocks__/@react-navigation/native.js',
    '^@react-navigation/stack$':
      '<rootDir>/__mocks__/@react-navigation/stack.js',

    // Static assets
    '\\.(png|jpg|jpeg|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },

  // Run this setup before tests
  setupFiles: ['<rootDir>/jest.setup.js'],
};
