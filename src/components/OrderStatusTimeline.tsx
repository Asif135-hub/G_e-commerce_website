import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ORDER_STATUS_STEPS, OrderStatus } from '@/context/StoreContext';
import { colors, radii, spacing } from '@/theme';

interface OrderStatusTimelineProps {
  status: OrderStatus;
  trackingNote?: string;
}

export function OrderStatusTimeline({ status, trackingNote }: OrderStatusTimelineProps) {
  if (status === 'Cancelled') {
    return (
      <View style={styles.cancelledBox}>
        <Ionicons name="close-circle" size={18} color={colors.danger} />
        <Text style={styles.cancelledText}>
          {trackingNote || 'This order has been cancelled.'}
        </Text>
      </View>
    );
  }

  const currentIdx = ORDER_STATUS_STEPS.indexOf(status);

  return (
    <View style={styles.wrapper}>
      <View style={styles.stepsRow}>
        {ORDER_STATUS_STEPS.map((step, index) => {
          const completed = index <= currentIdx;
          const isCurrent = index === currentIdx;
          return (
            <View key={step} style={styles.stepItem}>
              <View style={styles.lineRow}>
                {index > 0 ? (
                  <View
                    style={[
                      styles.connector,
                      index <= currentIdx && styles.connectorActive,
                    ]}
                  />
                ) : (
                  <View style={styles.connectorSpacer} />
                )}
                <View
                  style={[
                    styles.dot,
                    completed && styles.dotCompleted,
                    isCurrent && styles.dotCurrent,
                  ]}
                >
                  {completed ? (
                    <Ionicons name="checkmark" size={11} color={colors.white} />
                  ) : null}
                </View>
                {index < ORDER_STATUS_STEPS.length - 1 ? (
                  <View
                    style={[
                      styles.connector,
                      index < currentIdx && styles.connectorActive,
                    ]}
                  />
                ) : (
                  <View style={styles.connectorSpacer} />
                )}
              </View>
              <Text
                style={[styles.stepLabel, completed && styles.stepLabelActive]}
                numberOfLines={1}
              >
                {step}
              </Text>
            </View>
          );
        })}
      </View>
      {trackingNote ? <Text style={styles.note}>{trackingNote}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  stepsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  lineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
  },
  connectorActive: {
    backgroundColor: colors.success,
  },
  connectorSpacer: {
    flex: 1,
  },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotCompleted: {
    borderColor: colors.success,
    backgroundColor: colors.success,
  },
  dotCurrent: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },
  stepLabelActive: {
    color: colors.text,
    fontWeight: '700',
  },
  note: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  cancelledBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.dangerBg,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  cancelledText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: colors.danger,
  },
});
