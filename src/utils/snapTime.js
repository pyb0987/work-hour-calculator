import { HOUR_START, HOUR_END } from '../state/constants';

const MIN_MINUTES = HOUR_START * 60;
const MAX_MINUTES = HOUR_END * 60;
const MAGNET_THRESHOLD = 7;

export function snapMinutes(raw) {
  const distToHour = raw % 60;
  const distToHourEnd = 60 - distToHour;
  if (distToHour <= MAGNET_THRESHOLD) return clamp(raw - distToHour);
  if (distToHourEnd <= MAGNET_THRESHOLD) return clamp(raw + distToHourEnd);

  const distTo30 = Math.abs((raw % 60) - 30);
  if (distTo30 <= MAGNET_THRESHOLD) return clamp(Math.floor(raw / 60) * 60 + 30);

  const rounded = Math.round(raw / 10) * 10;
  return clamp(rounded);
}

function clamp(minutes) {
  return Math.max(MIN_MINUTES, Math.min(MAX_MINUTES, minutes));
}
