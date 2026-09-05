import Holiday from '../models/holiday.model.js';
import Event from '../models/event.model.js';
import SchoolSettings from '../models/schoolSettings.model.js';
import { ApiError } from '../utils/apiError.js';

// ─── Helpers ────────────────────────────────────────────────────────

const toDateStr = (date) => {
  if (!date) throw new ApiError(400, 'Date is required');
  const d = new Date(date);
  if (isNaN(d.getTime())) throw new ApiError(400, `Invalid date: ${date}`);
  return d.toISOString().split('T')[0];
};

const getDayName = (date) => {
  const d = new Date(date);
  if (isNaN(d.getTime())) throw new ApiError(400, `Invalid date: ${date}`);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
};

const parseTime = (str) => {
  if (!str || !str.trim()) return null;
  const trimmed = str.trim();

  const parts = trimmed.split(':');
  if (parts.length === 2) {
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (!isNaN(hours) && !isNaN(minutes) && hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return hours * 60 + minutes;
    }
  }

  const match = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const ampm = match[3].toUpperCase();
    if (hours < 1 || hours > 12 || minutes < 0 || minutes >= 60) return null;
    if (ampm === 'PM' && hours !== 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }

  return null;
};

// ─── Rule Checks ────────────────────────────────────────────────────

const checkWeekendPolicy = async (date) => {
  const settings = await SchoolSettings.getSettings();

  if (!settings.weekendEnabled) {
    return { isWeekend: false, weekendDay: null, weekendEnabled: false, weekendDays: [] };
  }

  const dayName = getDayName(date);
  const isWeekend = settings.weekendDays.includes(dayName);

  return {
    isWeekend,
    weekendDay: isWeekend ? dayName : null,
    weekendEnabled: true,
    weekendDays: settings.weekendDays,
  };
};

const checkHolidayPolicy = async (date, filters = {}) => {
  const dateStr = toDateStr(date);

  const query = {
    startDate: { $lte: dateStr },
    endDate: { $gte: dateStr },
  };

  if (filters.appliesTo) {
    query.$or = [
      { appliesTo: 'All' },
      { appliesTo: filters.appliesTo },
    ];
  }

  const holidays = await Holiday.find(query).lean();

  return {
    isHoliday: holidays.length > 0,
    holidays,
  };
};

const checkEventPolicy = async (date, filters = {}) => {
  const dateStr = toDateStr(date);

  const query = { date: dateStr };

  if (filters.audience) {
    query.$or = [
      { audience: 'All' },
      { audience: filters.audience },
    ];
  }

  const events = await Event.find(query).lean();

  return {
    hasEvent: events.length > 0,
    events,
  };
};

const checkAttendanceTimeRules = async (currentTime) => {
  const settings = await SchoolSettings.getSettings();
  const startStr = settings.attendanceStartTime?.trim();
  const closeStr = settings.attendanceClosingTime?.trim();

  if (!startStr || !closeStr) {
    return {
      isTimeAllowed: true,
      attendanceStartTime: startStr || '',
      attendanceClosingTime: closeStr || '',
      message: 'Attendance time rules are not configured',
    };
  }

  const now = currentTime || new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const startMin = parseTime(startStr);
  const closeMin = parseTime(closeStr);

  if (startMin === null || closeMin === null) {
    return {
      isTimeAllowed: true,
      attendanceStartTime: startStr,
      attendanceClosingTime: closeStr,
      message: 'Attendance time format could not be parsed — rules bypassed',
    };
  }

  const isTimeAllowed = nowMin >= startMin && nowMin <= closeMin;

  let message = '';
  if (!isTimeAllowed) {
    if (nowMin < startMin) {
      message = `Attendance cannot be marked because the Attendance Start Time is ${startStr}. It is not yet the configured start time.`;
    } else {
      message = `Attendance time has closed for today. Attendance is only allowed until ${closeStr}.`;
    }
  }

  return {
    isTimeAllowed,
    attendanceStartTime: startStr,
    attendanceClosingTime: closeStr,
    message,
  };
};

const checkLateRule = async ({ checkInTime, date } = {}) => {
  if (!checkInTime) {
    return { isLate: false, lateGracePeriod: 0, attendanceStartTime: '', message: 'No check-in time provided' };
  }

  const settings = await SchoolSettings.getSettings();
  const startStr = settings.attendanceStartTime?.trim();

  if (!startStr) {
    return { isLate: false, lateGracePeriod: 0, attendanceStartTime: '', message: 'Attendance start time not configured' };
  }

  if (!settings.lateAllowed) {
    return { isLate: false, lateGracePeriod: 0, attendanceStartTime: startStr, message: 'Late marking is disabled' };
  }

  const checkInMin = parseTime(checkInTime);
  const startMin = parseTime(startStr);
  const gracePeriod = settings.lateGracePeriod ?? 5;

  if (checkInMin === null || startMin === null) {
    return { isLate: false, lateGracePeriod: gracePeriod, attendanceStartTime: startStr, message: 'Could not parse time values' };
  }

  const lateThreshold = startMin + gracePeriod;
  const isLate = checkInMin > lateThreshold;

  return {
    isLate,
    lateGracePeriod: gracePeriod,
    attendanceStartTime: startStr,
    message: isLate
      ? `Check-in at ${checkInTime} exceeds the start time ${startStr} by more than ${gracePeriod} minute(s)`
      : 'Check-in is within the allowed grace period',
  };
};

const checkEditRules = async (record) => {
  if (!record) {
    return { canEdit: false, message: 'No attendance record provided' };
  }

  const settings = await SchoolSettings.getSettings();

  if (!settings.allowEditAfterSubmit) {
    return { canEdit: false, message: 'Editing attendance after submission is not allowed' };
  }

  const createdAt = new Date(record.createdAt);
  if (isNaN(createdAt.getTime())) {
    return { canEdit: false, message: 'Record creation date is invalid' };
  }

  const timeLimitMs = (settings.editTimeLimit ?? 1) * 60 * 60 * 1000;
  const elapsed = Date.now() - createdAt.getTime();
  const canEdit = elapsed <= timeLimitMs;

  return {
    canEdit,
    message: canEdit
      ? 'Record is within the editable time window'
      : `Edit window of ${settings.editTimeLimit} hour(s) has expired`,
  };
};

const getAutoAbsentRule = async () => {
  const settings = await SchoolSettings.getSettings();

  return {
    autoMarkAbsent: settings.autoMarkAbsent ?? false,
    attendanceClosingTime: settings.attendanceClosingTime?.trim() || '',
  };
};

const getAllRules = async (date, options = {}) => {
  const { appliesTo, audience, checkInTime } = options || {};

  const results = await Promise.all([
    checkWeekendPolicy(date),
    checkHolidayPolicy(date, appliesTo ? { appliesTo } : {}),
    checkEventPolicy(date, audience ? { audience } : {}),
    checkAttendanceTimeRules(),
    getAutoAbsentRule(),
  ]);

  return {
    weekend: results[0],
    holiday: results[1],
    event: results[2],
    timeRules: results[3],
    autoAbsent: results[4],
  };
};

export default {
  checkWeekendPolicy,
  checkHolidayPolicy,
  checkEventPolicy,
  checkAttendanceTimeRules,
  checkLateRule,
  checkEditRules,
  getAutoAbsentRule,
  getAllRules,
};
