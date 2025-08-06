const React = require('react');
module.exports = {
  createStackNavigator: () => {
    const MockStack = ({ children }) => React.createElement('>{children}</>');
    MockStack.Screen = () => null;
    MockStack.Navigator = ({ children }) => children;
    return MockStack;
  },
};
