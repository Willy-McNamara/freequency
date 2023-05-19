import React from 'react';
import { AppRegistry } from 'react-native';
import { View, Text } from 'react-native-web';

const App = () => {
  return (
    <View>
      <Text>Hello, World!</Text>
    </View>
  );
};

// Register the app for React Native Web
AppRegistry.registerComponent('App', () => App);
AppRegistry.runApplication('App', { rootTag: document.getElementById('root') });


