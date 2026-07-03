import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, spacing } from '../theme/theme';
import { useAuth } from '../context/AuthContext';

const AVATAR_IMAGE = 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&q=80';

const MENU_ITEMS = [
  { key: 'Home', label: 'Home', icon: 'home-outline' },
  { key: 'Explore', label: 'Explore', icon: 'compass-outline' },
  { key: 'AIIdeas', label: 'AI Ideas', icon: 'sparkles-outline' },
  { key: 'Profile', label: 'Profile', icon: 'person-outline' },
];

export default function DrawerContent(props) {
  const { navigation } = props;
  const { user, logout } = useAuth();

  const goToTab = (tabName) => {
    navigation.navigate('MainTabs', { screen: tabName });
    navigation.closeDrawer();
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: user?.avatar || AVATAR_IMAGE }} style={styles.avatar} />
        <Text style={styles.title}>{user?.name || 'Our Bucket List'}</Text>
        <Text style={styles.subtitle}>Dream together. Plan together.</Text>
      </View>

      <View style={styles.menu}>
        {MENU_ITEMS.map((item) => (
          <TouchableOpacity key={item.key} style={styles.menuItem} onPress={() => goToTab(item.key)} activeOpacity={0.7}>
            <Ionicons name={item.icon} size={20} color={colors.textDark} />
            <Text style={styles.menuLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.menuItem} onPress={logout} activeOpacity={0.7}>
          <Ionicons name="log-out-outline" size={20} color={colors.primary} />
          <Text style={[styles.menuLabel, { color: colors.primary }]}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { padding: spacing.lg, borderBottomWidth: 1, borderBottomColor: colors.border, marginBottom: spacing.sm },
  avatar: { width: 56, height: 56, borderRadius: 28, marginBottom: spacing.sm },
  title: { fontSize: 18, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 12, color: colors.textGray, marginTop: 2 },
  menu: { paddingHorizontal: spacing.sm },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  menuLabel: { fontSize: 15, color: colors.textDark, marginLeft: spacing.md, fontWeight: '600' },
});
