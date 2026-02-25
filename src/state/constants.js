export const STORAGE_KEY = '__wc_schedule';
export const HISTORY_KEY = '__wc_history';
export const WEEK_KEY_PREFIX = '__wc_week_';

export const TARGET_HOURS = 40;
export const TARGET_MINUTES = TARGET_HOURS * 60;
export const LUNCH_DURATION_MINUTES = 60;

export const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri'];

export const DAY_LABELS = {
  mon: '월',
  tue: '화',
  wed: '수',
  thu: '목',
  fri: '금',
};

export const PRESETS = [
  { key: '9to6', label: '9-6', startTime: '09:00', endTime: '18:00' },
  { key: '10to7', label: '10-7', startTime: '10:00', endTime: '19:00' },
  { key: '8to5', label: '8-5', startTime: '08:00', endTime: '17:00' },
  { key: '9to5', label: '9-5', startTime: '09:00', endTime: '17:00' },
  { key: '10to6', label: '10-6', startTime: '10:00', endTime: '18:00' },
];

// Timetable constants
export const HOUR_START = 7;
export const HOUR_END = 23;
export const HOUR_HEIGHT = 50;
export const TOTAL_HOURS = HOUR_END - HOUR_START;
export const GRID_HEIGHT = TOTAL_HOURS * HOUR_HEIGHT;
export const TIME_AXIS_WIDTH = 44;
export const HANDLE_HEIGHT = 32;
export const MIN_DRAG_MINUTES = 10;

// Default settings
export const DEFAULT_SETTINGS = {
  lunchEnabled: true,
  lunchStart: '12:30',
  lunchEnd: '13:30',
  coreStart: '11:00',
  coreEnd: '17:00',
};

export const THEME = {
  bg: '#F0F2F5',
  surface: '#FFFFFF',
  surfaceLight: '#E8F4F3',
  primary: '#2CB5AC',
  primaryLight: '#5DD5CD',
  primaryDark: '#1A9A92',
  textOnPrimary: '#FFFFFF',
  text: '#1A1A2E',
  textSecondary: '#6B7280',
  textDim: '#9CA3AF',
  border: '#E2E8F0',
  card: '#F8FAFB',
  danger: '#EF4444',
  warning: '#F59E0B',
  success: '#10B981',
  perfect: '#34D399',
  lunch: 'rgba(245, 158, 11, 0.12)',
  lunchBorder: 'rgba(245, 158, 11, 0.35)',
  coreBg: 'rgba(44, 181, 172, 0.06)',
  coreBorder: 'rgba(44, 181, 172, 0.3)',
};
