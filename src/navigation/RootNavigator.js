import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DrawerNavigator from './DrawerNavigator';
import AuthNavigator from './AuthNavigator';
import AddToBucketListScreen from '../screens/AddToBucketListScreen';
import AITravelInsightsScreen from '../screens/AITravelInsightsScreen';
import ActivityDetailScreen from '../screens/ActivityDetailScreen';
import CompletionScreen from '../screens/CompletionScreen';
import AllBucketListScreen from '../screens/AllBucketListScreen';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/theme';

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const { isAuthenticated, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
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
