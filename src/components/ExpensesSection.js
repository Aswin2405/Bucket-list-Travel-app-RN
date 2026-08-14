import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { useBucketList } from '../context/BucketListContext';
import { useAuth } from '../context/AuthContext';
import { useAlert } from '../context/AlertContext';
import { getErrorMessage } from '../api/errors';
import { formatMoney } from '../utils/format';

export default function ExpensesSection({ item }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const { addExpense, deleteExpense } = useBucketList();
  const { user } = useAuth();
  const showAlert = useAlert();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [adding, setAdding] = useState(false);

  const expenses = item.expenses || [];
  const members = [item.owner, ...(item.collaborators || [])].filter(Boolean);
  const memberCount = members.length || 1;

  const total = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const perPerson = total / memberCount;

  const paidByMember = (memberId) =>
    expenses
      .filter((e) => e.paidBy?._id === memberId)
      .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  const handleAdd = async () => {
    const desc = description.trim();
    const amt = Number(amount);
    if (!desc) return;
    if (!Number.isFinite(amt) || amt <= 0) {
      showAlert('Enter a valid amount', 'The expense amount must be a number greater than zero.');
      return;
    }
    setAdding(true);
    try {
      await addExpense(item._id, desc, amt);
      setDescription('');
      setAmount('');
    } catch (err) {
      showAlert('Could not add expense', getErrorMessage(err));
    } finally {
      setAdding(false);
    }
  };

  const canDelete = (expense) => item.owner?._id === user?._id || expense.paidBy?._id === user?._id;

  const handleDelete = (expenseId) => {
    deleteExpense(item._id, expenseId).catch((err) => showAlert('Could not remove', getErrorMessage(err)));
  };

  return (
    <>
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          <Text style={styles.sectionTitle}>Expenses</Text>
          <Ionicons name="wallet" size={16} color={colors.primary} style={{ marginLeft: 6 }} />
        </View>
        {expenses.length > 0 && <Text style={styles.total}>{formatMoney(total)}</Text>}
      </View>

      <View style={styles.card}>
        {expenses.length === 0 && (
          <Text style={styles.emptyText}>
            Add what you spend and it's split equally across all {memberCount} trip member
            {memberCount > 1 ? 's' : ''}.
          </Text>
        )}

        {expenses.map((expense) => {
          const isYou = expense.paidBy?._id === user?._id;
          return (
            <View key={expense._id} style={styles.expenseRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.expenseDesc}>{expense.description}</Text>
                <Text style={styles.expensePayer}>Paid by {isYou ? 'you' : expense.paidBy?.name || 'someone'}</Text>
              </View>
              <Text style={styles.expenseAmount}>{formatMoney(expense.amount)}</Text>
              {canDelete(expense) && (
                <TouchableOpacity onPress={() => handleDelete(expense._id)} hitSlop={8} style={{ marginLeft: spacing.sm }}>
                  <Ionicons name="close" size={18} color={colors.textGray} />
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        <View style={styles.addRow}>
          <TextInput
            style={[styles.input, styles.descInput]}
            placeholder="What was it for?"
            placeholderTextColor={colors.textGray}
            value={description}
            onChangeText={setDescription}
          />
          <TextInput
            style={[styles.input, styles.amountInput]}
            placeholder="0"
            placeholderTextColor={colors.textGray}
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            onSubmitEditing={handleAdd}
          />
          <TouchableOpacity
            style={[styles.addButton, (!description.trim() || !amount || adding) && styles.disabled]}
            onPress={handleAdd}
            disabled={!description.trim() || !amount || adding}
          >
            {adding ? <ActivityIndicator color={colors.white} size="small" /> : <Ionicons name="add" size={18} color={colors.white} />}
          </TouchableOpacity>
        </View>
      </View>

      {expenses.length > 0 && (
        <View style={styles.card}>
          <View style={styles.splitHeader}>
            <Text style={styles.splitTitle}>Split</Text>
            <Text style={styles.splitPer}>{formatMoney(perPerson)} each</Text>
          </View>
          {members.map((member) => {
            const paid = paidByMember(member._id);
            const balance = paid - perPerson;
            const isYou = member._id === user?._id;
            const rounded = Math.round(balance * 100) / 100;
            let statusText;
            let statusColor;
            if (rounded > 0) {
              statusText = `gets back ${formatMoney(rounded)}`;
              statusColor = colors.success;
            } else if (rounded < 0) {
              statusText = `owes ${formatMoney(-rounded)}`;
              statusColor = colors.primary;
            } else {
              statusText = 'settled up';
              statusColor = colors.textGray;
            }
            return (
              <View key={member._id} style={styles.memberRow}>
                <Text style={styles.memberName}>
                  {member.name}
                  {isYou ? ' (You)' : ''}
                </Text>
                <View style={styles.memberRight}>
                  <Text style={styles.memberPaid}>paid {formatMoney(paid)}</Text>
                  <Text style={[styles.memberStatus, { color: statusColor }]}>{statusText}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    titleRow: { flexDirection: 'row', alignItems: 'center' },
    sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.textDark },
    total: { fontSize: 15, fontWeight: '800', color: colors.textDark },
    card: { backgroundColor: colors.card, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm },
    emptyText: { fontSize: 13, color: colors.textGray, lineHeight: 18, marginBottom: spacing.sm },
    expenseRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.xs },
    expenseDesc: { fontSize: 14, color: colors.textDark, fontWeight: '600' },
    expensePayer: { fontSize: 11, color: colors.textGray, marginTop: 1 },
    expenseAmount: { fontSize: 14, fontWeight: '700', color: colors.textDark },
    addRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.sm },
    input: {
      backgroundColor: colors.chipBackground,
      borderRadius: radius.sm,
      paddingHorizontal: spacing.md,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.textDark,
    },
    descInput: { flex: 1, marginRight: spacing.sm },
    amountInput: { width: 72, marginRight: spacing.sm, textAlign: 'right' },
    addButton: {
      width: 40,
      height: 40,
      borderRadius: radius.sm,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: { opacity: 0.6 },
    splitHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    splitTitle: { fontSize: 14, fontWeight: '700', color: colors.textDark },
    splitPer: { fontSize: 13, fontWeight: '700', color: colors.primary },
    memberRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.xs,
    },
    memberName: { fontSize: 13, color: colors.textDark, flex: 1 },
    memberRight: { alignItems: 'flex-end' },
    memberPaid: { fontSize: 11, color: colors.textGray },
    memberStatus: { fontSize: 12, fontWeight: '700', marginTop: 1 },
  });
}
