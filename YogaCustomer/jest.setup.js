jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// 2. Polyfill XMLHttpRequest for Firebase Firestore webchannel
const { XMLHttpRequest } = require('xmlhttprequest');
global.XMLHttpRequest = XMLHttpRequest;
