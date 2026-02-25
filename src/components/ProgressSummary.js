import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { THEME, TARGET_MINUTES } from '../state/constants';
import { useWorkCalendar } from '../state/WorkCalendarContext';
import { formatHoursMinutes, getStatusMessage } from '../utils/timeCalc';

const TONE_COLORS = {
  neutral: THEME.textDim,
  danger: THEME.danger,
  warning: THEME.warning,
  success: THEME.success,
  perfect: THEME.perfect,
};

function getRemainingGuide(totalMinutes, filledDaysCount) {
  if (filledDaysCount === 0) return null;

  const remainingMinutes = TARGET_MINUTES - totalMinutes;
  const emptyDays = 5 - filledDaysCount;

  if (remainingMinutes <= 0) return null; // already covered by status message

  if (emptyDays > 0) {
    const avgPerDay = Math.ceil(remainingMinutes / emptyDays);
    const { hours, minutes } = formatHoursMinutes(avgPerDay);
    const timeStr = hours > 0
      ? `${hours}h ${String(minutes).padStart(2, '0')}m`
      : `${minutes}m`;
    return `남은 ${emptyDays}일간 하루 평균 ${timeStr} 필요`;
  }

  const { hours, minutes } = formatHoursMinutes(remainingMinutes);
  const timeStr = hours > 0
    ? `${hours}시간 ${String(minutes).padStart(2, '0')}분`
    : `${minutes}분`;
  return `입력한 시간이 ${timeStr} 부족합니다`;
}

export default function ProgressSummary() {
  const { totalMinutes, filledDaysCount } = useWorkCalendar();
  const progressAnim = useRef(new Animated.Value(0)).current;

  const ratio = Math.min(totalMinutes / TARGET_MINUTES, 1.2);
  const { hours, minutes } = formatHoursMinutes(totalMinutes);
  const status = getStatusMessage(totalMinutes, filledDaysCount);
  const toneColor = TONE_COLORS[status.tone] || THEME.textSecondary;
  const guide = getRemainingGuide(totalMinutes, filledDaysCount);

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: ratio,
      tension: 40,
      friction: 12,
      useNativeDriver: false,
    }).start();
  }, [ratio]);

  const barWidth = progressAnim.interpolate({
    inputRange: [0, 1, 1.2],
    outputRange: ['0%', '100%', '100%'],
    extrapolate: 'clamp',
  });

  const barColor = progressAnim.interpolate({
    inputRange: [0, 0.5, 0.8, 1],
    outputRange: [THEME.danger, THEME.warning, THEME.success, THEME.perfect],
  });

  return (
    <View style={styles.container}>
      <View style={styles.hoursRow}>
        <Text style={styles.hoursMain}>
          {hours}시간 {String(minutes).padStart(2, '0')}분
        </Text>
        <Text style={styles.hoursTarget}> / 40시간</Text>
      </View>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, { width: barWidth, backgroundColor: barColor }]} />
      </View>

      <Text style={[styles.statusMessage, { color: toneColor }]}>
        {status.message}
      </Text>
      {guide && (
        <Text style={styles.guideMessage}>{guide}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    backgroundColor: THEME.surface,
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  hoursRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 16,
  },
  hoursMain: {
    fontSize: 28,
    fontWeight: '800',
    color: THEME.text,
    fontFamily: 'NotoSansKR_700Bold',
  },
  hoursTarget: {
    fontSize: 16,
    color: THEME.textDim,
    fontFamily: 'NotoSansKR_400Regular',
  },
  barTrack: {
    height: 12,
    backgroundColor: THEME.border,
    borderRadius: 6,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  statusMessage: {
    marginTop: 12,
    fontSize: 14,
    fontFamily: 'NotoSansKR_400Regular',
    textAlign: 'center',
  },
  guideMessage: {
    marginTop: 4,
    fontSize: 12,
    color: THEME.textSecondary,
    fontFamily: 'NotoSansKR_400Regular',
    textAlign: 'center',
  },
});
