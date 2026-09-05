import api from '../../api/axios';

const attendanceReportsService = {
  getRecords: async (filters = {}) => {
    const params = {};
    if (filters.academicYear) params.academicYear = filters.academicYear;
    if (filters.className) params.className = filters.className;
    if (filters.status && filters.status !== 'All') params.status = filters.status;
    if (filters.fromDate) params.fromDate = filters.fromDate;
    if (filters.toDate) params.toDate = filters.toDate;
    if (filters.search) params.search = filters.search;
    if (filters.type && filters.type !== 'All') params.type = filters.type;

    const response = await api.get('/student-attendance/reports', { params });
    return response.data.data?.records || [];
  },

  clearCache() {
  },

  getStats(records) {
    const total = records.length;
    const present = records.filter((r) => r.status === 'Present').length;
    const absent = records.filter((r) => r.status === 'Absent').length;
    const leave = records.filter((r) => r.status === 'Leave').length;
    const late = records.filter((r) => r.status === 'Late').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    return { total, present, absent, leave, late, percentage };
  },

  getMonthlyTrend(records) {
    const monthly = {};
    records.forEach((r) => {
      const month = r.date.slice(0, 7);
      if (!monthly[month]) monthly[month] = { present: 0, absent: 0, leave: 0, late: 0, total: 0 };
      monthly[month][r.status.toLowerCase()]++;
      monthly[month].total++;
    });
    return Object.entries(monthly)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data }));
  },

  getClassWiseStats(records) {
    const grouped = {};
    records.forEach((r) => {
      const key = r.classOrDept;
      if (!grouped[key]) grouped[key] = { present: 0, absent: 0, total: 0 };
      grouped[key].total++;
      if (r.status === 'Present') grouped[key].present++;
      else grouped[key].absent++;
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, data]) => ({ name, present: data.present, absent: data.absent, total: data.total, percentage: data.total > 0 ? Math.round((data.present / data.total) * 100) : 0 }));
  },

  getTeacherOverview(records) {
    const teacherRecords = records.filter((r) => r.type === 'Teacher');
    return attendanceReportsService.getClassWiseStats(teacherRecords);
  },

  getPersonSummaries(records) {
    const personMap = {};
    records.forEach((r) => {
      if (!personMap[r.personId]) {
        personMap[r.personId] = {
          name: r.name,
          personId: r.personId,
          type: r.type,
          classOrDept: r.classOrDept,
          present: 0, absent: 0, leave: 0, late: 0, total: 0,
        };
      }
      personMap[r.personId].total++;
      personMap[r.personId][r.status.toLowerCase()]++;
    });
    return Object.values(personMap)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((p) => ({ ...p, percentage: p.total > 0 ? Math.round((p.present / p.total) * 100) : 0 }));
  },

  getPersonSummary(records, personId) {
    const personRecords = records.filter((r) => r.personId === personId);
    if (!personRecords.length) return null;

    const person = personRecords[0];
    const stats = attendanceReportsService.getStats(personRecords);
    const monthly = attendanceReportsService.getMonthlyTrend(personRecords);

    const modeStats = {};
    personRecords.forEach((r) => {
      modeStats[r.mode] = (modeStats[r.mode] || 0) + 1;
    });

    return {
      name: person.name,
      personId: person.personId,
      type: person.type,
      classOrDept: person.classOrDept,
      academicYear: person.academicYear,
      ...stats,
      monthly,
      modeStats,
      records: personRecords,
    };
  },
};

export default attendanceReportsService;
