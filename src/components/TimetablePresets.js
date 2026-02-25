import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { THEME, PRESETS } from '../state/constants';
import { useWorkCalendar } from '../state/WorkCalendarContext';

export default function TimetablePresets() {
  const { schedule, applyPresetToAll, isReadOnly } = useWorkCalendar();

  const activeKey = PRESETS.find((p) => {
    const days = Object.values(schedule.days);
    return days.length > 0 && days.every(
      (d) => d.startTime === p.startTime && d.endTime === p.endTime
    );
  })?.key || null;

  return (
    <View style={[styles.container, isReadOnly && styles.disabled]}>
      <Text style={styles.label}>전체 빠른 입력</Text>
      <View style={styles.row}>
        {PRESETS.map((preset) => {
          const isActive = preset.key === activeKey;
          return (
            <Pressable
              key={preset.key}
              style={[styles.button, isActive && styles.buttonActive]}
              onPress={() => applyPresetToAll(preset)}
              disabled={isReadOnly}
            >
              <Text style={[styles.buttonText, isActive && styles.buttonTextActive]}>
                {preset.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  label: {
    fontSize: 11,
    color: THEME.textDim,
    fontFamily: 'NotoSansKR_400Regular',
    flexShrink: 0,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    flex: 1,
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  buttonActive: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  buttonText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontWeight: '500',
  },
  buttonTextActive: {
    color: THEME.textOnPrimary,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
});
