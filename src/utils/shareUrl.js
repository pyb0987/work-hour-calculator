import { DAY_KEYS, DEFAULT_SETTINGS } from '../state/constants';

// Encode time "HH:MM" → "HHMM", null → "----"
function encodeTime(timeStr) {
  if (!timeStr) return '----';
  return timeStr.replace(':', '');
}

// Decode "HHMM" → "HH:MM", "----" → null
function decodeTime(encoded) {
  if (encoded === '----') return null;
  return encoded.slice(0, 2) + ':' + encoded.slice(2, 4);
}

/**
 * Encode schedule into a compact string.
 * Format: lunchEnabled(1) + lunchStart(4) + lunchEnd(4) + coreStart(4) + coreEnd(4) = 17
 *         + days(5 x 8 = 40) = total 57 chars
 */
export function encodeSchedule(schedule) {
  const { settings, days } = schedule;
  let result = '';

  // Settings: 17 chars
  result += settings.lunchEnabled ? '1' : '0';
  result += encodeTime(settings.lunchStart);
  result += encodeTime(settings.lunchEnd);
  result += encodeTime(settings.coreStart);
  result += encodeTime(settings.coreEnd);

  // Days: 5 x 8 = 40 chars
  DAY_KEYS.forEach((key) => {
    const day = days[key];
    result += encodeTime(day.startTime);
    result += encodeTime(day.endTime);
  });

  return result;
}

/**
 * Decode a compact string back to schedule data.
 * Returns { settings, days } or null if invalid.
 */
export function decodeSchedule(encoded) {
  if (!encoded || encoded.length !== 57) return null;

  try {
    const lunchEnabled = encoded[0] === '1';
    const lunchStart = decodeTime(encoded.slice(1, 5));
    const lunchEnd = decodeTime(encoded.slice(5, 9));
    const coreStart = decodeTime(encoded.slice(9, 13));
    const coreEnd = decodeTime(encoded.slice(13, 17));

    const settings = {
      lunchEnabled,
      lunchStart: lunchStart || DEFAULT_SETTINGS.lunchStart,
      lunchEnd: lunchEnd || DEFAULT_SETTINGS.lunchEnd,
      coreStart: coreStart || DEFAULT_SETTINGS.coreStart,
      coreEnd: coreEnd || DEFAULT_SETTINGS.coreEnd,
    };

    const days = {};
    DAY_KEYS.forEach((key, i) => {
      const offset = 17 + i * 8;
      days[key] = {
        startTime: decodeTime(encoded.slice(offset, offset + 4)),
        endTime: decodeTime(encoded.slice(offset + 4, offset + 8)),
      };
    });

    return { settings, days };
  } catch {
    return null;
  }
}

/**
 * Generate a full share URL from schedule.
 */
export function generateShareUrl(schedule) {
  const encoded = encodeSchedule(schedule);
  const base = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '';
  return `${base}#s=${encoded}`;
}

/**
 * Parse share data from current URL hash.
 * Returns { settings, days } or null.
 */
export function parseShareUrl() {
  if (typeof window === 'undefined') return null;
  const hash = window.location.hash;
  if (!hash.startsWith('#s=')) return null;
  const encoded = hash.slice(3);
  return decodeSchedule(encoded);
}
