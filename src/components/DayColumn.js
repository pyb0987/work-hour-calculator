import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { HOUR_START, HOUR_HEIGHT, GRID_HEIGHT, HANDLE_HEIGHT } from '../state/constants';
import { useWorkCalendar } from '../state/WorkCalendarContext';
import { timeStringToMinutes, minutesToTimeString } from '../utils/timeCalc';
import { snapMinutes } from '../utils/snapTime';
import { useTimetableScroll } from './Timetable';
import TimeBlock from './TimeBlock';

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
});
