import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator';
import AuthNavigator from './AuthNavigator';
import AddToBucketListScreen from '../screens/AddToBucketListScreen';
import AITravelInsightsScreen from '../screens/AITravelInsightsScreen';
import ActivityDetailScreen from '../screens/ActivityDetailScreen';
import CompletionScreen from '../screens/CompletionScreen';
import AllBucketListScreen from '../screens/AllBucketListScreen';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, initializing } = useAuth();
  const { colors, isDark } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: colors.background,
      card: colors.card,
      primary: colors.primary,
      text: colors.textDark,
      border: colors.border,
    },
  };

  if (initializing) {
    // Android's native splash screen API (12+) only ever shows a small centered
    // icon, never a full-bleed image, no matter what expo-splash-screen is
    // configured with. This full-screen image takes over the instant JS mounts
    // so the real splash artwork actually covers the screen while we check for
    // a stored session.
    return (
      <View style={styles.splashContainer}>
        <Image source={require('../../assets/splash-screen.png')} resizeMode="cover" style={StyleSheet.absoluteFillObject} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="DrawerRoot" component={DrawerNavigator} />
          <Stack.Screen name="AddToBucketList" component={AddToBucketListScreen} />
          <Stack.Screen name="AITravelInsights" component={AITravelInsightsScreen} />
          <Stack.Screen name="ActivityDetail" component={ActivityDetailScreen} />
          <Stack.Screen name="AllBucketList" component={AllBucketListScreen} />
          <Stack.Screen
            name="Completion"
            component={CompletionScreen}
            options={{ animation: 'fade' }}
          />
        </Stack.Navigator>
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splashContainer: { flex: 1, backgroundColor: '#FDF3EF' },
});
