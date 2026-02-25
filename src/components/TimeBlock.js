import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME, HOUR_START, HOUR_HEIGHT, HANDLE_HEIGHT } from '../state/constants';
import { timeStringToMinutes, minutesToTimeString } from '../utils/timeCalc';

export default function TimeBlock({ startTime, endTime, lunchStart, lunchEnd, lunchEnabled, isDragging, activeHandle }) {
  const startMin = timeStringToMinutes(startTime);
  const endMin = timeStringToMinutes(endTime);
  if (startMin === null || endMin === null || endMin <= startMin) return null;

  const originMin = HOUR_START * 60;
  const top = ((startMin - originMin) / 60) * HOUR_HEIGHT;
  const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;

  const lunchStartMin = lunchEnabled ? timeStringToMinutes(lunchStart) : null;
  const lunchEndMin = lunchEnabled ? timeStringToMinutes(lunchEnd) : null;

  let lunchOverlay = null;
  if (lunchStartMin !== null && lunchEndMin !== null) {
    const overlapStart = Math.max(startMin, lunchStartMin);
    const overlapEnd = Math.min(endMin, lunchEndMin);
    if (overlapEnd > overlapStart) {
      const lunchTop = ((overlapStart - startMin) / 60) * HOUR_HEIGHT;
      const lunchHeight = ((overlapEnd - overlapStart) / 60) * HOUR_HEIGHT;
      lunchOverlay = (
        <View style={[styles.lunchOverlay, { top: lunchTop, height: lunchHeight }]}>
          <Text style={styles.lunchLabel}>점심</Text>
        </View>
      );
    }
  }

  const blockMinutes = endMin - startMin;
  const showLabel = blockMinutes >= 60;

  return (
    <View
      style={[
        styles.block,
        { top, height },
        isDragging && styles.blockDragging,
      ]}
      pointerEvents="none"
    >
      {/* Top handle — drag to change start time */}
      <View style={[styles.handle, styles.handleTop, activeHandle === 'top' && styles.handleActive]}>
        <Text style={styles.handleTime}>{minutesToTimeString(startMin)}</Text>
        <View style={styles.gripRow}>
          <View style={styles.gripLine} />
          <View style={[styles.gripLine, styles.gripLineShort]} />
        </View>
      </View>

      {showLabel && (
        <View style={styles.labelContainer}>
          {lunchOverlay}
        </View>
      )}

      {/* Bottom handle — drag to change end time */}
      <View style={[styles.handle, styles.handleBottom, activeHandle === 'bottom' && styles.handleActive]}>
        <View style={styles.gripRow}>
          <View style={[styles.gripLine, styles.gripLineShort]} />
          <View style={styles.gripLine} />
        </View>
        <Text style={styles.handleTime}>{minutesToTimeString(endMin)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    position: 'absolute',
    left: 2,
    right: 2,
    backgroundColor: 'rgba(44, 181, 172, 0.12)',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: THEME.primary,
    overflow: 'hidden',
    zIndex: 10,
  },
  blockDragging: {
    backgroundColor: 'rgba(44, 181, 172, 0.22)',
    borderColor: THEME.primaryDark,
  },
  handle: {
    height: HANDLE_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 181, 172, 0.18)',
    gap: 3,
    cursor: 'ns-resize',
  },
  handleTop: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(44, 181, 172, 0.25)',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  handleBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(44, 181, 172, 0.25)',
    borderBottomLeftRadius: 6,
    borderBottomRightRadius: 6,
  },
  handleActive: {
    backgroundColor: 'rgba(44, 181, 172, 0.4)',
  },
  handleTime: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.primaryDark,
    fontFamily: 'monospace',
  },
  gripRow: {
    alignItems: 'center',
    gap: 2,
  },
  gripLine: {
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: THEME.primary,
    opacity: 0.5,
  },
  gripLineShort: {
    width: 18,
  },
  labelContainer: {
    flex: 1,
    position: 'relative',
  },
  lunchOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: THEME.lunch,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: THEME.lunchBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lunchLabel: {
    fontSize: 9,
    color: THEME.warning,
    fontWeight: '600',
    fontFamily: 'NotoSansKR_400Regular',
  },
});
