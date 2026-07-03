import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing } from '../theme/theme';

export default function CustomAlert({ visible, title, message, buttons, onDismiss }) {
  const handlePress = (button) => {
    onDismiss();
    button.onPress?.();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onDismiss}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.buttonRow}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={`${button.text}-${index}`}
                style={[styles.button, index > 0 && styles.buttonSpacing]}
                onPress={() => handlePress(button)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === 'cancel' && styles.cancelText,
                    button.style === 'destructive' && styles.destructiveText,
                  ]}
                >
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(34,33,58,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xs,
    shadowColor: colors.black,
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  title: { fontSize: 17, fontWeight: '800', color: colors.textDark, textAlign: 'center' },
  message: {
    fontSize: 14,
    color: colors.textGray,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: { flex: 1, paddingVertical: spacing.md, alignItems: 'center', justifyContent: 'center' },
  buttonSpacing: { borderLeftWidth: 1, borderLeftColor: colors.border },
  buttonText: { fontSize: 15, fontWeight: '700', color: colors.primary },
  cancelText: { color: colors.textGray, fontWeight: '600' },
  destructiveText: { color: colors.primary, fontWeight: '800' },
});
