import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import HomeScreen from '../screens/HomeScreen';
import ExploreScreen from '../screens/ExploreScreen';
import AIIdeasScreen from '../screens/AIIdeasScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

function AddTabIcon() {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors, 0), [colors]);
  return (
    <View style={styles.addButton}>
      <Ionicons name="add" size={28} color={colors.white} />
    </View>
  );
}

export default function MainTabs() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors, insets.bottom), [colors, insets.bottom]);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textGray,
        tabBarStyle: styles.tabBar,
        tabBarHideOnKeyboard: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="AddTab"
        component={HomeScreen}
        options={{
          tabBarLabel: () => null,
          tabBarIcon: AddTabIcon,
        }}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate('AddToBucketList');
          },
        })}
      />
      <Tab.Screen
        name="AIIdeas"
        component={AIIdeasScreen}
        options={{
          title: 'AI Ideas',
          tabBarIcon: ({ color, size }) => <Ionicons name="sparkles-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

// Base height is designed for a device with no bottom inset; devices with a
// gesture bar or 3-button nav (edge-to-edge on Android, home indicator on iOS)
// add their inset on top so the bar never sits under/behind the system UI.
function createStyles(colors, bottomInset) {
  return StyleSheet.create({
    tabBar: {
      height: 56 + bottomInset,
      paddingBottom: 8 + bottomInset,
      paddingTop: 6,
      backgroundColor: colors.card,
      borderTopColor: colors.border,
    },
    addButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
      shadowColor: colors.primary,
      shadowOpacity: 0.4,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
  });
}
