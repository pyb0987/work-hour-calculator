import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import { THEME } from '../state/constants';
import { useWorkCalendar } from '../state/WorkCalendarContext';
import { formatWeekRange, getCurrentWeekMonday } from '../utils/timeCalc';
import ShareButton from './ShareButton';

function getWeeksAgoLabel(weekDate) {
  const now = new Date(getCurrentWeekMonday() + 'T00:00:00');
  const target = new Date(weekDate + 'T00:00:00');
  const diffWeeks = Math.round((now - target) / (7 * 24 * 60 * 60 * 1000));
  if (diffWeeks === 1) return '1주 전';
  return `${diffWeeks}주 전`;
}

export default function WeeklyHeader() {
  const {
    schedule,
    resetWeek,
    isReadOnly,
    viewingWeek,
    weekHistory,
    viewWeek,
    viewCurrentWeek,
  } = useWorkCalendar();
  const [showConfirm, setShowConfirm] = useState(false);

  const currentMonday = getCurrentWeekMonday();
  const displayWeek = viewingWeek || schedule.weekStartDate;

  // Build navigable list: [current, ...history]
  const allWeeks = [currentMonday, ...weekHistory.filter((w) => w !== currentMonday)];
  const currentIndex = allWeeks.indexOf(displayWeek);
  const canGoBack = currentIndex < allWeeks.length - 1;
  const canGoForward = currentIndex > 0;

  const handlePrev = () => {
    if (!canGoBack) return;
    const prevWeek = allWeeks[currentIndex + 1];
    if (prevWeek === currentMonday) {
      viewCurrentWeek();
    } else {
      viewWeek(prevWeek);
    }
  };

  const handleNext = () => {
    if (!canGoForward) return;
    const nextWeek = allWeeks[currentIndex - 1];
    if (nextWeek === currentMonday) {
      viewCurrentWeek();
    } else {
      viewWeek(nextWeek);
    }
  };

  const handleReset = () => {
    if (Platform.OS === 'web') {
      setShowConfirm(true);
    } else {
      Alert.alert('초기화', '이번 주 기록을 모두 지울까요?', [
        { text: '취소', style: 'cancel' },
        { text: '초기화', style: 'destructive', onPress: resetWeek },
      ]);
    }
  };

  const confirmReset = () => {
    resetWeek();
    setShowConfirm(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          <Text style={styles.title}>근무 시간 계산기</Text>
          <View style={styles.weekNav}>
            <Pressable
              style={[styles.navArrow, !canGoBack && styles.navArrowDisabled]}
              onPress={handlePrev}
              disabled={!canGoBack}
              hitSlop={8}
            >
              <Text style={[styles.navArrowText, !canGoBack && styles.navArrowTextDisabled]}>{'<'}</Text>
            </Pressable>
            <Text style={styles.subtitle}>{formatWeekRange(displayWeek)}</Text>
            <Pressable
              style={[styles.navArrow, !canGoForward && styles.navArrowDisabled]}
              onPress={handleNext}
              disabled={!canGoForward}
              hitSlop={8}
            >
              <Text style={[styles.navArrowText, !canGoForward && styles.navArrowTextDisabled]}>{'>'}</Text>
            </Pressable>
          </View>
        </View>
        {!isReadOnly && (
          <View style={styles.headerButtons}>
            <ShareButton />
            <Pressable style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetText}>초기화</Text>
            </Pressable>
          </View>
        )}
      </View>

      {isReadOnly && (
        <View style={styles.readOnlyBadge}>
          <Text style={styles.readOnlyText}>
            {getWeeksAgoLabel(viewingWeek)} 기록 (읽기 전용)
          </Text>
          <Pressable style={styles.currentWeekBtn} onPress={viewCurrentWeek}>
            <Text style={styles.currentWeekBtnText}>현재 주로</Text>
          </Pressable>
        </View>
      )}

      {showConfirm && (
        <View style={styles.confirmBar}>
          <Text style={styles.confirmText}>이번 주 기록을 모두 지울까요?</Text>
          <View style={styles.confirmButtons}>
            <Pressable style={styles.confirmCancel} onPress={() => setShowConfirm(false)}>
              <Text style={styles.confirmCancelText}>취소</Text>
            </Pressable>
            <Pressable style={styles.confirmOk} onPress={confirmReset}>
              <Text style={styles.confirmOkText}>초기화</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleLeft: {
    flex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.text,
    fontFamily: 'NotoSansKR_700Bold',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  navArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navArrowDisabled: {
    opacity: 0.3,
  },
  navArrowText: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.textSecondary,
  },
  navArrowTextDisabled: {
    color: THEME.textDim,
  },
  subtitle: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontFamily: 'NotoSansKR_400Regular',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'flex-start',
  },
  resetButton: {
    backgroundColor: THEME.surface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: THEME.border,
  },
  resetText: {
    fontSize: 13,
    color: THEME.textSecondary,
    fontFamily: 'NotoSansKR_400Regular',
  },
  readOnlyBadge: {
    marginTop: 10,
    backgroundColor: THEME.surfaceLight,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: THEME.primary,
  },
  readOnlyText: {
    fontSize: 12,
    color: THEME.primaryDark,
    fontFamily: 'NotoSansKR_400Regular',
    fontWeight: '600',
  },
  currentWeekBtn: {
    backgroundColor: THEME.primary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  currentWeekBtnText: {
    fontSize: 11,
    color: THEME.textOnPrimary,
    fontWeight: '700',
  },
  confirmBar: {
    marginTop: 12,
    backgroundColor: THEME.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: THEME.danger,
  },
  confirmText: {
    fontSize: 14,
    color: THEME.text,
    marginBottom: 10,
    fontFamily: 'NotoSansKR_400Regular',
  },
  confirmButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
  confirmCancel: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: THEME.border,
  },
  confirmCancelText: {
    fontSize: 13,
    color: THEME.textSecondary,
  },
  confirmOk: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: THEME.danger,
  },
  confirmOkText: {
    fontSize: 13,
    color: THEME.text,
    fontWeight: '600',
  },
});
