import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { HOUR_START, HOUR_HEIGHT, GRID_HEIGHT, HANDLE_HEIGHT, THEME } from '../state/constants';
import { useWorkCalendar } from '../state/WorkCalendarContext';
import { timeStringToMinutes, minutesToTimeString } from '../utils/timeCalc';
import { snapMinutes } from '../utils/snapTime';
import { useTimetableScroll } from './Timetable';
import TimeBlock from './TimeBlock';
import TimeInput from './TimeInput';

function yToMinutes(y) {
  return HOUR_START * 60 + (y / HOUR_HEIGHT) * 60;
}

function minutesToY(min) {
  return ((min - HOUR_START * 60) / 60) * HOUR_HEIGHT;
}

const AUTO_SCROLL_EDGE = 40;
const AUTO_SCROLL_SPEED = 6;

export default function DayColumn({ dayKey }) {
  const { schedule, setDayTime, isReadOnly } = useWorkCalendar();
  const day = schedule.days[dayKey];
  const { settings } = schedule;
  const scrollCtx = useTimetableScroll();

  const [drag, setDrag] = useState(null);
  const [inputStart, setInputStart] = useState('');
  const [inputEnd, setInputEnd] = useState('');
  const columnRef = useRef(null);

  const coreStartMin = timeStringToMinutes(settings.coreStart) || 600;
  const coreEndMin = timeStringToMinutes(settings.coreEnd) || 960;
  const hasBlock = day.startTime !== null && day.endTime !== null;

  // Keep latest values accessible to native event handlers via ref
  const latest = useRef({});
  latest.current = { day, hasBlock, coreStartMin, coreEndMin, settings, dayKey };

  useEffect(() => {
    if (Platform.OS !== 'web' || isReadOnly) return;
    const node = columnRef.current;
    if (!node) return;

    let activeDrag = null;
    let scrollInterval = null;

    function getY(e) {
      const rect = node.getBoundingClientRect();
      return e.clientY - rect.top;
    }

    function getHitZone(y) {
      const { day: d } = latest.current;
      const startMin = timeStringToMinutes(d.startTime);
      const endMin = timeStringToMinutes(d.endTime);
      if (startMin === null || endMin === null) return 'empty';

      const blockTop = minutesToY(startMin);
      const blockBottom = minutesToY(endMin);
      const pad = 10;

      if (y >= blockTop - pad && y <= blockTop + HANDLE_HEIGHT + pad) return 'top';
      if (y >= blockBottom - HANDLE_HEIGHT - pad && y <= blockBottom + pad) return 'bottom';
      if (y >= blockTop && y <= blockBottom) return 'body';
      return 'empty';
    }

    function doAutoScroll(clientY) {
      if (!scrollCtx) return;
      const { scrollRef, scrollInfoRef } = scrollCtx;
      if (!scrollRef.current) return;
      const scrollEl = scrollRef.current.getScrollableNode?.() || scrollRef.current;
      if (!scrollEl.getBoundingClientRect) return;
      const rect = scrollEl.getBoundingClientRect();

      const topDist = clientY - rect.top;
      const bottomDist = rect.bottom - clientY;
      let delta = 0;
      if (topDist < AUTO_SCROLL_EDGE && topDist >= 0) {
        delta = -AUTO_SCROLL_SPEED * (1 - topDist / AUTO_SCROLL_EDGE);
      } else if (bottomDist < AUTO_SCROLL_EDGE && bottomDist >= 0) {
        delta = AUTO_SCROLL_SPEED * (1 - bottomDist / AUTO_SCROLL_EDGE);
      }
      if (Math.abs(delta) > 0.5) {
        const next = Math.max(0, scrollInfoRef.current.offset + delta);
        scrollRef.current.scrollTo({ y: next, animated: false });
        scrollInfoRef.current.offset = next;
      }
    }

    function onPointerDown(e) {
      // Skip drag when interacting with time inputs
      if (e.target.tagName === 'INPUT') return;

      const { hasBlock: hb, coreStartMin: csm, coreEndMin: cem, dayKey: dk } = latest.current;
      const y = getY(e);
      const zone = getHitZone(y);

      // Handle drag
      if (zone === 'top' || zone === 'bottom') {
        e.preventDefault();
        e.stopPropagation();
        node.setPointerCapture(e.pointerId);

        const minutes = snapMinutes(yToMinutes(y));
        activeDrag = { mode: zone === 'top' ? 'resizeTop' : 'resizeBottom', current: minutes, lastClientY: e.clientY };
        setDrag({ ...activeDrag });

        scrollInterval = setInterval(() => {
          if (activeDrag) doAutoScroll(activeDrag.lastClientY);
        }, 16);
        return;
      }

      // Create default block: day is empty + click inside core time
      if (!hb && zone === 'empty') {
        const clickMin = yToMinutes(y);
        if (clickMin >= csm && clickMin <= cem) {
          e.preventDefault();
          setDayTime(dk, 'startTime', minutesToTimeString(csm));
          setDayTime(dk, 'endTime', minutesToTimeString(cem));
        }
        // Outside core time: do nothing — allows scroll
        return;
      }

      // Body or empty with existing block: do nothing — allows scroll
    }

    function onPointerMove(e) {
      if (!activeDrag) return;
      e.preventDefault();
      const y = getY(e);
      const minutes = snapMinutes(yToMinutes(y));
      activeDrag = { ...activeDrag, current: minutes, lastClientY: e.clientY };
      setDrag({ ...activeDrag });
    }

    function onPointerUp(e) {
      if (scrollInterval) { clearInterval(scrollInterval); scrollInterval = null; }
      if (!activeDrag) return;

      const { day: d, dayKey: dk, coreStartMin: csm, coreEndMin: cem } = latest.current;
      const startMin = timeStringToMinutes(d.startTime);
      const endMin = timeStringToMinutes(d.endTime);

      if (activeDrag.mode === 'resizeTop') {
        let final = Math.min(activeDrag.current, csm);
        final = Math.min(final, endMin - 10);
        setDayTime(dk, 'startTime', minutesToTimeString(final));
      } else {
        let final = Math.max(activeDrag.current, cem);
        final = Math.max(final, startMin + 10);
        setDayTime(dk, 'endTime', minutesToTimeString(final));
      }

      activeDrag = null;
      setDrag(null);
    }

    // Prevent scroll when touching a handle area
    function onTouchStart(e) {
      const touch = e.touches[0];
      if (!touch) return;
      const rect = node.getBoundingClientRect();
      const y = touch.clientY - rect.top;
      const zone = getHitZone(y);
      if (zone === 'top' || zone === 'bottom') {
        e.preventDefault();
      }
    }

    function onTouchMove(e) {
      if (activeDrag) {
        e.preventDefault();
      }
    }

    node.addEventListener('pointerdown', onPointerDown);
    node.addEventListener('pointermove', onPointerMove);
    node.addEventListener('pointerup', onPointerUp);
    node.addEventListener('pointercancel', onPointerUp);
    node.addEventListener('touchstart', onTouchStart, { passive: false });
    node.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      node.removeEventListener('pointerdown', onPointerDown);
      node.removeEventListener('pointermove', onPointerMove);
      node.removeEventListener('pointerup', onPointerUp);
      node.removeEventListener('pointercancel', onPointerUp);
      node.removeEventListener('touchstart', onTouchStart);
      node.removeEventListener('touchmove', onTouchMove);
      if (scrollInterval) clearInterval(scrollInterval);
    };
  }, [scrollCtx, setDayTime, isReadOnly]);

  // Sync input state from day data (external changes like drag or presets)
  useEffect(() => {
    setInputStart(day.startTime || '');
  }, [day.startTime]);

  useEffect(() => {
    setInputEnd(day.endTime || '');
  }, [day.endTime]);

  const handleStartBlur = () => {
    const match = inputStart.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return;
    const h = Math.min(23, Math.max(0, parseInt(match[1], 10)));
    const m = Math.min(59, Math.max(0, parseInt(match[2], 10)));
    const normalized = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    setInputStart(normalized);
    setDayTime(dayKey, 'startTime', normalized);
    // Auto-set endTime if missing
    if (!day.endTime) {
      const endVal = minutesToTimeString(coreEndMin);
      setInputEnd(endVal);
      setDayTime(dayKey, 'endTime', endVal);
    }
  };

  const handleEndBlur = () => {
    const match = inputEnd.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return;
    const h = Math.min(23, Math.max(0, parseInt(match[1], 10)));
    const m = Math.min(59, Math.max(0, parseInt(match[2], 10)));
    const normalized = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    setInputEnd(normalized);
    setDayTime(dayKey, 'endTime', normalized);
    // Auto-set startTime if missing
    if (!day.startTime) {
      const startVal = minutesToTimeString(coreStartMin);
      setInputStart(startVal);
      setDayTime(dayKey, 'startTime', startVal);
    }
  };

  // Display values during drag
  let displayStart = day.startTime;
  let displayEnd = day.endTime;
  let activeHandle = null;

  if (drag) {
    if (drag.mode === 'resizeTop') {
      displayStart = minutesToTimeString(drag.current);
      activeHandle = 'top';
    } else {
      displayEnd = minutesToTimeString(drag.current);
      activeHandle = 'bottom';
    }
  }

  // Position the input group below the lunch area to avoid overlap
  const coreBottom = minutesToY(coreEndMin);
  const lunchEndMin = settings.lunchEnabled
    ? timeStringToMinutes(settings.lunchEnd) || coreStartMin
    : coreStartMin;
  const areaTop = minutesToY(Math.max(lunchEndMin, coreStartMin));
  const INPUT_GROUP_HEIGHT = 52;
  const inputGroupTop = areaTop + (coreBottom - areaTop) / 2 - INPUT_GROUP_HEIGHT / 2;

  return (
    <View ref={columnRef} style={[styles.column, isReadOnly && styles.readOnly]}>
      <TimeBlock
        startTime={displayStart}
        endTime={displayEnd}
        lunchStart={settings.lunchStart}
        lunchEnd={settings.lunchEnd}
        lunchEnabled={settings.lunchEnabled}
        isDragging={!!drag}
        activeHandle={activeHandle}
      />
      <View
        style={[styles.inputGroup, { top: inputGroupTop }]}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <TimeInput
          value={inputStart}
          onChange={setInputStart}
          onBlur={handleStartBlur}
          placeholder="--:--"
          editable={!isReadOnly}
          style={styles.coreInput}
        />
        <Text style={styles.inputTilde}>~</Text>
        <TimeInput
          value={inputEnd}
          onChange={setInputEnd}
          onBlur={handleEndBlur}
          placeholder="--:--"
          editable={!isReadOnly}
          style={styles.coreInput}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    height: GRID_HEIGHT,
    position: 'relative',
    cursor: 'default',
    userSelect: 'none',
  },
  readOnly: {
    opacity: 0.7,
    pointerEvents: 'none',
  },
  inputGroup: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
    gap: 1,
  },
  coreInput: {
    width: 44,
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'monospace',
    paddingHorizontal: 2,
    paddingVertical: 2,
    backgroundColor: 'rgba(44, 181, 172, 0.08)',
    borderColor: THEME.coreBorder,
    color: THEME.primaryDark,
    borderRadius: 3,
  },
  inputTilde: {
    fontSize: 9,
    color: THEME.textDim,
    lineHeight: 10,
  },
});
