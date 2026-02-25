import { TARGET_MINUTES } from '../state/constants';

export function timeStringToMinutes(timeStr) {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTimeString(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function calculateLunchOverlap(workStart, workEnd, lunchStart, lunchEnd) {
  const overlapStart = Math.max(workStart, lunchStart);
  const overlapEnd = Math.min(workEnd, lunchEnd);
  return Math.max(0, overlapEnd - overlapStart);
}

export function calculateDailyMinutes(startTime, endTime, settings) {
  const startMin = timeStringToMinutes(startTime);
  const endMin = timeStringToMinutes(endTime);
  if (startMin === null || endMin === null) return 0;
  if (endMin <= startMin) return 0;

  let worked = endMin - startMin;
  if (settings && settings.lunchEnabled) {
    const lunchStartMin = timeStringToMinutes(settings.lunchStart);
    const lunchEndMin = timeStringToMinutes(settings.lunchEnd);
    if (lunchStartMin !== null && lunchEndMin !== null) {
      worked -= calculateLunchOverlap(startMin, endMin, lunchStartMin, lunchEndMin);
    }
  }
  return Math.max(0, worked);
}

export function calculateWeeklyTotal(days, settings) {
  return Object.values(days).reduce((sum, day) => {
    return sum + calculateDailyMinutes(day.startTime, day.endTime, settings);
  }, 0);
}

export function formatHoursMinutes(totalMinutes) {
  const h = Math.floor(Math.abs(totalMinutes) / 60);
  const m = Math.abs(totalMinutes) % 60;
  return { hours: h, minutes: m };
}

export function getFilledDaysCount(days) {
  return Object.values(days).filter(
    (d) => d.startTime !== null && d.endTime !== null
  ).length;
}

export function getStatusMessage(workedMinutes, filledDays) {
  const remaining = TARGET_MINUTES - workedMinutes;
  const { hours: rh, minutes: rm } = formatHoursMinutes(remaining);
  const rmStr = rm > 0 ? ` ${rm}분` : '';

  if (filledDays === 0) {
    return { message: '이번 주도 화이팅! 출근 시간을 입력해주세요.', tone: 'neutral' };
  }

  if (remaining > 8 * 60) {
    return {
      message: `앞으로 ${rh}시간${rmStr} 남았습니다. 갈 길이 멀어요...`,
      tone: 'danger',
    };
  }

  if (remaining > 4 * 60) {
    return {
      message: `앞으로 ${rh}시간${rmStr} 남았습니다. 조금만 더 힘내세요!`,
      tone: 'warning',
    };
  }

  if (remaining > 60) {
    return {
      message: `${rh}시간${rmStr}만 더 버티면 됩니다! 거의 다 왔어요!`,
      tone: 'success',
    };
  }

  if (remaining > 0) {
    return {
      message: `${rm > 0 ? `${rm}분` : '조금'}만 더! 칼퇴까지 코앞입니다!`,
      tone: 'success',
    };
  }

  if (remaining === 0) {
    return {
      message: '40시간 정확히 달성! 칼퇴의 신이시네요.',
      tone: 'perfect',
    };
  }

  return {
    message: `${rh}시간${rmStr} 초과 근무 중... 퇴근하세요, 제발.`,
    tone: 'perfect',
  };
}

export function getCurrentWeekMonday() {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split('T')[0];
}

export function formatWeekRange(mondayISO) {
  const monday = new Date(mondayISO + 'T00:00:00');
  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const mMonth = monday.getMonth() + 1;
  const mDay = monday.getDate();
  const fMonth = friday.getMonth() + 1;
  const fDay = friday.getDate();

  return `${mMonth}/${mDay} (월) ~ ${fMonth}/${fDay} (금)`;
}
