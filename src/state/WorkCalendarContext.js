import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEY, HISTORY_KEY, WEEK_KEY_PREFIX, DAY_KEYS, DEFAULT_SETTINGS } from './constants';
import { calculateDailyMinutes, calculateWeeklyTotal, getFilledDaysCount, getCurrentWeekMonday } from '../utils/timeCalc';

const WorkCalendarContext = createContext(null);

function createInitialState() {
  const emptyDays = {};
  DAY_KEYS.forEach((key) => {
    emptyDays[key] = { startTime: null, endTime: null };
  });
  return {
    weekStartDate: getCurrentWeekMonday(),
    settings: { ...DEFAULT_SETTINGS },
    days: emptyDays,
  };
}

function isWeekEmpty(days) {
  return DAY_KEYS.every((key) => {
    const d = days[key];
    return d.startTime === null && d.endTime === null;
  });
}

function migrateState(saved) {
  if (!saved.settings) {
    const hadLunch = Object.values(saved.days || {}).some((d) => d.lunchBreak !== false);
    saved.settings = { ...DEFAULT_SETTINGS, lunchEnabled: hadLunch };
  }
  DAY_KEYS.forEach((key) => {
    if (saved.days && saved.days[key]) {
      delete saved.days[key].lunchBreak;
    }
  });
  return saved;
}

async function archiveWeek(savedState) {
  const weekDate = savedState.weekStartDate;
  if (!weekDate) return;
  if (isWeekEmpty(savedState.days)) return;

  try {
    await AsyncStorage.setItem(WEEK_KEY_PREFIX + weekDate, JSON.stringify(savedState));
    const rawIndex = await AsyncStorage.getItem(HISTORY_KEY);
    const index = rawIndex ? JSON.parse(rawIndex) : [];
    if (!index.includes(weekDate)) {
      index.unshift(weekDate);
      // Keep max 12 weeks
      if (index.length > 12) index.length = 12;
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(index));
    }
  } catch {}
}

export function WorkCalendarProvider({ children }) {
  const [schedule, setSchedule] = useState(createInitialState);
  const [loaded, setLoaded] = useState(false);
  const [weekHistory, setWeekHistory] = useState([]);
  const [viewingWeek, setViewingWeek] = useState(null);
  const [viewingData, setViewingData] = useState(null);

  // Load current schedule + history index
  useEffect(() => {
    (async () => {
      try {
        const [raw, rawHistory] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(HISTORY_KEY),
        ]);

        if (rawHistory) {
          setWeekHistory(JSON.parse(rawHistory));
        }

        if (raw) {
          let saved = JSON.parse(raw);
          const currentMonday = getCurrentWeekMonday();
          if (saved.weekStartDate === currentMonday) {
            setSchedule(migrateState(saved));
          } else {
            // Archive the old week and start fresh
            await archiveWeek(saved);
            const initial = createInitialState();
            setSchedule(initial);
            // Update history index in state
            if (!isWeekEmpty(saved.days)) {
              setWeekHistory((prev) => {
                const next = [saved.weekStartDate, ...prev.filter((w) => w !== saved.weekStartDate)];
                if (next.length > 12) next.length = 12;
                return next;
              });
            }
          }
        }
      } catch {}
      setLoaded(true);
    })();
  }, []);

  // Persist current schedule
  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(schedule)).catch(() => {});
  }, [schedule, loaded]);

  const setDayTime = useCallback((dayKey, field, timeString) => {
    setSchedule((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [dayKey]: { ...prev.days[dayKey], [field]: timeString },
      },
    }));
  }, []);

  const updateSettings = useCallback((field, value) => {
    setSchedule((prev) => ({
      ...prev,
      settings: { ...prev.settings, [field]: value },
    }));
  }, []);

  const applyPreset = useCallback((dayKey, preset) => {
    setSchedule((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [dayKey]: {
          ...prev.days[dayKey],
          startTime: preset.startTime,
          endTime: preset.endTime,
        },
      },
    }));
  }, []);

  const applyPresetToAll = useCallback((preset) => {
    setSchedule((prev) => {
      const newDays = { ...prev.days };
      DAY_KEYS.forEach((key) => {
        newDays[key] = {
          ...newDays[key],
          startTime: preset.startTime,
          endTime: preset.endTime,
        };
      });
      return { ...prev, days: newDays };
    });
  }, []);

  const resetDay = useCallback((dayKey) => {
    setSchedule((prev) => ({
      ...prev,
      days: {
        ...prev.days,
        [dayKey]: { startTime: null, endTime: null },
      },
    }));
  }, []);

  const resetWeek = useCallback(() => {
    setSchedule(createInitialState());
  }, []);

  // View a past week (read-only)
  const viewWeek = useCallback(async (weekDate) => {
    try {
      const raw = await AsyncStorage.getItem(WEEK_KEY_PREFIX + weekDate);
      if (raw) {
        setViewingWeek(weekDate);
        setViewingData(JSON.parse(raw));
      }
    } catch {}
  }, []);

  const viewCurrentWeek = useCallback(() => {
    setViewingWeek(null);
    setViewingData(null);
  }, []);

  // Load shared schedule from URL
  const loadSharedSchedule = useCallback((sharedData) => {
    if (!sharedData) return;
    setSchedule((prev) => ({
      ...prev,
      settings: sharedData.settings || prev.settings,
      days: sharedData.days || prev.days,
    }));
    viewCurrentWeek();
  }, [viewCurrentWeek]);

  const isReadOnly = viewingWeek !== null;
  const activeSchedule = isReadOnly && viewingData ? viewingData : schedule;

  const dailyMinutes = useMemo(() => {
    const result = {};
    DAY_KEYS.forEach((key) => {
      const day = activeSchedule.days[key];
      result[key] = calculateDailyMinutes(day.startTime, day.endTime, activeSchedule.settings);
    });
    return result;
  }, [activeSchedule.days, activeSchedule.settings]);

  const totalMinutes = useMemo(
    () => calculateWeeklyTotal(activeSchedule.days, activeSchedule.settings),
    [activeSchedule.days, activeSchedule.settings]
  );
  const filledDaysCount = useMemo(() => getFilledDaysCount(activeSchedule.days), [activeSchedule.days]);

  const value = useMemo(
    () => ({
      schedule: activeSchedule,
      loaded,
      setDayTime,
      updateSettings,
      applyPreset,
      applyPresetToAll,
      resetDay,
      resetWeek,
      dailyMinutes,
      totalMinutes,
      filledDaysCount,
      isReadOnly,
      viewingWeek,
      weekHistory,
      viewWeek,
      viewCurrentWeek,
      loadSharedSchedule,
    }),
    [activeSchedule, loaded, setDayTime, updateSettings, applyPreset, applyPresetToAll, resetDay, resetWeek, dailyMinutes, totalMinutes, filledDaysCount, isReadOnly, viewingWeek, weekHistory, viewWeek, viewCurrentWeek, loadSharedSchedule]
  );

  return (
    <WorkCalendarContext.Provider value={value}>
      {children}
    </WorkCalendarContext.Provider>
  );
}

export function useWorkCalendar() {
  const ctx = useContext(WorkCalendarContext);
  if (!ctx) throw new Error('useWorkCalendar must be used within WorkCalendarProvider');
  return ctx;
}
