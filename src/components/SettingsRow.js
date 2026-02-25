import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { THEME } from '../state/constants';
import { useWorkCalendar } from '../state/WorkCalendarContext';
import TimeInput from './TimeInput';

export default function SettingsRow() {
  const { schedule, updateSettings, isReadOnly } = useWorkCalendar();
  const { settings } = schedule;

  return (
    <View style={[styles.container, isReadOnly && styles.disabled]}>
      <View style={styles.group}>
        <Pressable
          style={styles.checkRow}
          onPress={() => updateSettings('lunchEnabled', !settings.lunchEnabled)}
          hitSlop={6}
        >
          <View style={[styles.checkbox, settings.lunchEnabled && styles.checkboxChecked]}>
            {settings.lunchEnabled && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.label}>점심</Text>
        </Pressable>
        {settings.lunchEnabled && (
          <View style={styles.timeRange}>
            <TimeInput
              value={settings.lunchStart}
              onChange={(v) => updateSettings('lunchStart', v)}
            />
            <Text style={styles.tilde}>~</Text>
            <TimeInput
              value={settings.lunchEnd}
              onChange={(v) => updateSettings('lunchEnd', v)}
            />
          </View>
        )}
      </View>

      <View style={styles.divider} />

      <View style={styles.group}>
        <Text style={styles.label}>코어</Text>
        <View style={styles.timeRange}>
          <TimeInput
            value={settings.coreStart}
            onChange={(v) => updateSettings('coreStart', v)}
          />
          <Text style={styles.tilde}>~</Text>
          <TimeInput
            value={settings.coreEnd}
            onChange={(v) => updateSettings('coreEnd', v)}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    flexWrap: 'wrap',
    gap: 4,
  },
  group: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: THEME.textDim,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: THEME.primary,
    borderColor: THEME.primary,
  },
  checkmark: {
    fontSize: 12,
    color: THEME.textOnPrimary,
    fontWeight: '700',
  },
  label: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontFamily: 'NotoSansKR_400Regular',
    fontWeight: '600',
  },
  timeRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  tilde: {
    fontSize: 13,
    color: THEME.textDim,
  },
  divider: {
    width: 1,
    height: 20,
    backgroundColor: THEME.border,
    marginHorizontal: 6,
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none',
  },
});
