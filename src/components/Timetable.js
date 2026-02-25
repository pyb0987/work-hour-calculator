import React, { useRef, useEffect, createContext, useContext } from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';
import { THEME, HOUR_START, HOUR_END, HOUR_HEIGHT, GRID_HEIGHT, TIME_AXIS_WIDTH, DAY_KEYS, DAY_LABELS } from '../state/constants';
import { useWorkCalendar } from '../state/WorkCalendarContext';
import { timeStringToMinutes } from '../utils/timeCalc';
import DayColumn from './DayColumn';

export const TimetableScrollContext = createContext(null);

export function useTimetableScroll() {
  return useContext(TimetableScrollContext);
}

function HourLines() {
  const lines = [];
  for (let h = HOUR_START; h <= HOUR_END; h++) {
    const top = (h - HOUR_START) * HOUR_HEIGHT;
    lines.push(
      <View key={h} style={[styles.hourLine, { top }]} pointerEvents="none">
        <View style={styles.hourLineMark} />
      </View>
    );
  }
  return lines;
}

function TimeAxis() {
  const labels = [];
  for (let h = HOUR_START; h <= HOUR_END; h++) {
    const top = (h - HOUR_START) * HOUR_HEIGHT;
    labels.push(
      <Text key={h} style={[styles.hourLabel, { top: top - 7 }]}>
        {String(h).padStart(2, '0')}
      </Text>
    );
  }
  return <View style={styles.timeAxis}>{labels}</View>;
}

function CoreTimeBackground({ coreStart, coreEnd }) {
  const startMin = timeStringToMinutes(coreStart);
  const endMin = timeStringToMinutes(coreEnd);
  if (startMin === null || endMin === null) return null;

  const originMin = HOUR_START * 60;
  const top = ((startMin - originMin) / 60) * HOUR_HEIGHT;
  const height = ((endMin - startMin) / 60) * HOUR_HEIGHT;

  return (
    <View style={[styles.coreBg, { top, height }]} pointerEvents="none">
      <View style={styles.coreLineTop} />
      <View style={styles.coreLineBottom} />
    </View>
  );
}

const SCROLL_AREA_HEIGHT = 400;

export default function Timetable() {
  const { schedule } = useWorkCalendar();
  const scrollRef = useRef(null);
  const scrollInfoRef = useRef({ offset: 0, height: SCROLL_AREA_HEIGHT });

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current) {
        const scrollTo = (9 - HOUR_START) * HOUR_HEIGHT - 20;
        if (scrollRef.current.scrollTo) {
          scrollRef.current.scrollTo({ y: Math.max(0, scrollTo), animated: false });
        }
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (e) => {
    scrollInfoRef.current.offset = e.nativeEvent.contentOffset.y;
    scrollInfoRef.current.height = e.nativeEvent.layoutMeasurement.height;
  };

  const scrollCtx = { scrollRef, scrollInfoRef };

  return (
    <TimetableScrollContext.Provider value={scrollCtx}>
      <View style={styles.container}>
        <View style={styles.dayHeader}>
          <View style={styles.timeAxisHeader} />
          {DAY_KEYS.map((key) => (
            <View key={key} style={styles.dayHeaderCell}>
              <Text style={styles.dayHeaderText}>{DAY_LABELS[key]}</Text>
            </View>
          ))}
        </View>

        <ScrollView
          ref={scrollRef}
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <View style={styles.gridContainer}>
            <TimeAxis />
            <View style={styles.columnsContainer}>
              <CoreTimeBackground
                coreStart={schedule.settings.coreStart}
                coreEnd={schedule.settings.coreEnd}
              />
              <HourLines />
              <View style={styles.columns}>
                {DAY_KEYS.map((key, idx) => (
                  <React.Fragment key={key}>
                    {idx > 0 && <View style={styles.columnDivider} />}
                    <DayColumn dayKey={key} />
                  </React.Fragment>
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    </TimetableScrollContext.Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: 'hidden',
  },
  dayHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
    backgroundColor: THEME.surface,
  },
  timeAxisHeader: {
    width: TIME_AXIS_WIDTH,
  },
  dayHeaderCell: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
  },
  dayHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.primary,
    fontFamily: 'NotoSansKR_700Bold',
  },
  scrollArea: {
    maxHeight: SCROLL_AREA_HEIGHT,
  },
  gridContainer: {
    flexDirection: 'row',
    height: GRID_HEIGHT,
  },
  timeAxis: {
    width: TIME_AXIS_WIDTH,
    position: 'relative',
  },
  hourLabel: {
    position: 'absolute',
    right: 6,
    fontSize: 10,
    color: THEME.textDim,
    fontFamily: 'monospace',
    fontWeight: '500',
  },
  columnsContainer: {
    flex: 1,
    position: 'relative',
  },
  columns: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  columnDivider: {
    width: 1,
    backgroundColor: THEME.border,
    opacity: 0.5,
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  hourLineMark: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.border,
    opacity: 0.6,
  },
  coreBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: THEME.coreBg,
    zIndex: 1,
  },
  coreLineTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: THEME.coreBorder,
    ...(Platform.OS === 'web' ? { borderTopWidth: 1, borderTopColor: THEME.coreBorder, borderStyle: 'dashed', height: 0 } : {}),
  },
  coreLineBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: THEME.coreBorder,
    ...(Platform.OS === 'web' ? { borderTopWidth: 1, borderTopColor: THEME.coreBorder, borderStyle: 'dashed', height: 0 } : {}),
  },
});
