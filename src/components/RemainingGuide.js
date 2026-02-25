import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME, TARGET_MINUTES } from '../state/constants';
import { useWorkCalendar } from '../state/WorkCalendarContext';
import { formatHoursMinutes } from '../utils/timeCalc';

export default function RemainingGuide() {
  const { totalMinutes, filledDaysCount } = useWorkCalendar();
  const remainingMinutes = TARGET_MINUTES - totalMinutes;
  const emptyDays = 5 - filledDaysCount;

  if (filledDaysCount === 0) return null;

  let message;
  let icon;

  if (remainingMinutes <= 0) {
    message = '이번 주 40시간 달성!';
    icon = '\u2713';
  } else if (emptyDays > 0) {
    const avgPerDay = Math.ceil(remainingMinutes / emptyDays);
    const { hours, minutes } = formatHoursMinutes(avgPerDay);
    const timeStr = hours > 0
      ? `${hours}h ${String(minutes).padStart(2, '0')}m`
      : `${minutes}m`;
    message = `남은 ${emptyDays}일간 하루 평균 ${timeStr} 필요`;
    icon = '\u23F0';
  } else {
    const { hours, minutes } = formatHoursMinutes(remainingMinutes);
    const timeStr = hours > 0
      ? `${hours}시간 ${String(minutes).padStart(2, '0')}분`
      : `${minutes}분`;
    message = `입력한 시간이 ${timeStr} 부족합니다`;
    icon = '\u26A0';
  }

  const isAchieved = remainingMinutes <= 0;

  return (
    <View style={[styles.container, isAchieved && styles.containerAchieved]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[styles.message, isAchieved && styles.messageAchieved]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    backgroundColor: THEME.surface,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: THEME.border,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  containerAchieved: {
    backgroundColor: THEME.surfaceLight,
    borderColor: THEME.primary,
  },
  icon: {
    fontSize: 16,
  },
  message: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontFamily: 'NotoSansKR_400Regular',
    flex: 1,
  },
  messageAchieved: {
    color: THEME.primaryDark,
    fontWeight: '600',
  },
});
