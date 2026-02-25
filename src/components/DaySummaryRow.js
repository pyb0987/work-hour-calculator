import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { THEME, DAY_KEYS, DAY_LABELS, TIME_AXIS_WIDTH } from '../state/constants';
import { useWorkCalendar } from '../state/WorkCalendarContext';
import { formatHoursMinutes } from '../utils/timeCalc';

export default function DaySummaryRow() {
  const { dailyMinutes, resetDay, resetWeek } = useWorkCalendar();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <View style={styles.axisSpace} />
        {DAY_KEYS.map((key) => {
          const mins = dailyMinutes[key];
          const { hours, minutes } = formatHoursMinutes(mins);
          const hasTime = mins > 0;
          return (
            <Pressable
              key={key}
              style={styles.cell}
              onPress={hasTime ? () => resetDay(key) : undefined}
            >
              <Text style={[styles.time, !hasTime && styles.timeEmpty]}>
                {hasTime ? `${hours}h${String(minutes).padStart(2, '0')}m` : '-'}
              </Text>
              {hasTime && <Text style={styles.resetHint}>초기화</Text>}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.border,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  axisSpace: {
    width: TIME_AXIS_WIDTH,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  time: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.primary,
    fontFamily: 'monospace',
  },
  timeEmpty: {
    color: THEME.textDim,
    fontWeight: '400',
  },
  resetHint: {
    fontSize: 9,
    color: THEME.danger,
    opacity: 0.7,
  },
});
