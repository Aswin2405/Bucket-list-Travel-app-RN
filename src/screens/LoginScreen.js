import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import PrimaryButton from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../api/errors';

export default function LoginScreen({ navigation }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const canSubmit = email.trim() && password && !submitting;

  const handleLogin = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={16}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <Ionicons name="airplane" size={32} color={colors.white} />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Log in to keep planning your journey together.</Text>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.textGray}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />

            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Your password"
                placeholderTextColor={colors.textGray}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.textGray}
                />
              </TouchableOpacity>
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}

            <PrimaryButton
              title="Log In"
              onPress={handleLogin}
              disabled={!canSubmit}
              loading={submitting}
              style={{ marginTop: spacing.sm }}
            />
          </View>

          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
    header: { alignItems: 'center', marginBottom: spacing.xl },
    logoCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    title: { fontSize: 24, fontWeight: '800', color: colors.textDark },
    subtitle: {
      fontSize: 13,
      color: colors.textGray,
      marginTop: 6,
      textAlign: 'center',
      paddingHorizontal: spacing.lg,
    },
    formCard: {
      backgroundColor: colors.card,
      borderRadius: radius.md,
      padding: spacing.md,
    },
    label: { fontSize: 12, fontWeight: '700', color: colors.textDark, marginBottom: spacing.xs },
    input: {
      backgroundColor: colors.chipBackground,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.textDark,
      marginBottom: spacing.md,
    },
    passwordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.chipBackground,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    passwordInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: colors.textDark },
    errorText: { color: colors.primary, fontSize: 12, marginBottom: spacing.sm },
    footerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg },
    footerText: { fontSize: 13, color: colors.textGray },
    footerLink: { fontSize: 13, color: colors.primary, fontWeight: '700' },
  });
}
