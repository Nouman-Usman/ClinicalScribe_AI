import supabase, { isSupabaseConfigured } from '../client';

export interface DashboardStats {
  totalPatients: number;
  activePatients: number;
  highRiskPatients: number;
  mediumRiskPatients: number;
  lowRiskPatients: number;
  totalVisits: number;
  visitsThisMonth: number;
  visitsThisWeek: number;
  visitsToday: number;
  totalNotes: number;
  notesThisMonth: number;
  avgVisitDuration: number;
  avgRiskScore: number;
  patientsByGender: { male: number; female: number; other: number };
  patientsByAgeGroup: { under30: number; age30to50: number; age50to70: number; over70: number };
  visitsByType: Record<string, number>;
  riskDistribution: { low: number; medium: number; high: number };
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const defaultStats: DashboardStats = {
    totalPatients: 0, activePatients: 0,
    highRiskPatients: 0, mediumRiskPatients: 0, lowRiskPatients: 0,
    totalVisits: 0, visitsThisMonth: 0, visitsThisWeek: 0, visitsToday: 0,
    totalNotes: 0, notesThisMonth: 0,
    avgVisitDuration: 0, avgRiskScore: 0,
    patientsByGender: { male: 0, female: 0, other: 0 },
    patientsByAgeGroup: { under30: 0, age30to50: 0, age50to70: 0, over70: 0 },
    visitsByType: {},
    riskDistribution: { low: 0, medium: 0, high: 0 },
  };

  if (!isSupabaseConfigured()) {
    return defaultStats;
  }

  try {
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .eq('user_id', userId);

    if (patientsError) throw patientsError;

    const { data: visits, error: visitsError } = await supabase
      .from('visits')
      .select('*')
      .eq('user_id', userId);

    if (visitsError) throw visitsError;

    const { data: notes, error: notesError } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId);

    if (notesError) throw notesError;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const activePatients = (patients || []).filter(p => p.is_active);
    const patientsByGender = { male: 0, female: 0, other: 0 };
    const patientsByAgeGroup = { under30: 0, age30to50: 0, age50to70: 0, over70: 0 };
    const riskDistribution = { low: 0, medium: 0, high: 0 };
    let totalRiskScore = 0;
    let patientsWithRisk = 0;

    for (const p of activePatients) {
      if (p.gender === 'M') patientsByGender.male++;
      else if (p.gender === 'F') patientsByGender.female++;
      else patientsByGender.other++;

      const age = p.age || 0;
      if (age < 30) patientsByAgeGroup.under30++;
      else if (age < 50) patientsByAgeGroup.age30to50++;
      else if (age < 70) patientsByAgeGroup.age50to70++;
      else patientsByAgeGroup.over70++;

      if (p.risk_level === 'high' || p.risk_level === 'critical') {
        riskDistribution.high++;
      } else if (p.risk_level === 'medium' || p.risk_level === 'moderate') {
        riskDistribution.medium++;
      } else {
        riskDistribution.low++;
      }

      if (p.risk_score !== null && p.risk_score !== undefined) {
        totalRiskScore += p.risk_score;
        patientsWithRisk++;
      }
    }

    const visitsByType: Record<string, number> = {};
    let totalDuration = 0;

    const visitsThisMonth = (visits || []).filter(v => new Date(v.visit_date) >= startOfMonth);
    const visitsThisWeek = (visits || []).filter(v => new Date(v.visit_date) >= startOfWeek);
    const visitsToday = (visits || []).filter(v => new Date(v.visit_date) >= startOfDay);

    for (const v of visits || []) {
      const type = v.visit_type || 'routine';
      visitsByType[type] = (visitsByType[type] || 0) + 1;
      totalDuration += v.duration || 0;
    }

    const notesThisMonth = (notes || []).filter(n => new Date(n.created_at) >= startOfMonth);

    return {
      totalPatients: (patients || []).length,
      activePatients: activePatients.length,
      highRiskPatients: riskDistribution.high,
      mediumRiskPatients: riskDistribution.medium,
      lowRiskPatients: riskDistribution.low,
      totalVisits: (visits || []).length,
      visitsThisMonth: visitsThisMonth.length,
      visitsThisWeek: visitsThisWeek.length,
      visitsToday: visitsToday.length,
      totalNotes: (notes || []).length,
      notesThisMonth: notesThisMonth.length,
      avgVisitDuration: (visits || []).length > 0 ? Math.round(totalDuration / (visits || []).length) : 0,
      avgRiskScore: patientsWithRisk > 0 ? Math.round(totalRiskScore / patientsWithRisk) : 0,
      patientsByGender,
      patientsByAgeGroup,
      visitsByType,
      riskDistribution,
    };
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    return defaultStats;
  }
}

export interface VisitTrendData {
  date: string;
  visits: number;
  avgRiskScore: number;
}

export async function getVisitTrends(userId: string, days: number = 30): Promise<VisitTrendData[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: visits, error } = await supabase
      .from('visits')
      .select('visit_date, risk_score')
      .eq('user_id', userId)
      .gte('visit_date', startDate.toISOString())
      .order('visit_date', { ascending: true });

    if (error) throw error;

    const visitsByDate: Record<string, { count: number; totalRisk: number; riskCount: number }> = {};

    for (const v of visits || []) {
      const dateKey = new Date(v.visit_date).toISOString().split('T')[0];
      if (!visitsByDate[dateKey]) {
        visitsByDate[dateKey] = { count: 0, totalRisk: 0, riskCount: 0 };
      }
      visitsByDate[dateKey].count++;
      if (v.risk_score !== null && v.risk_score !== undefined) {
        visitsByDate[dateKey].totalRisk += v.risk_score;
        visitsByDate[dateKey].riskCount++;
      }
    }

    const result: VisitTrendData[] = [];
    for (let i = 0; i <= days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateKey = d.toISOString().split('T')[0];
      const dayData = visitsByDate[dateKey] || { count: 0, totalRisk: 0, riskCount: 0 };

      result.push({
        date: dateKey,
        visits: dayData.count,
        avgRiskScore: dayData.riskCount > 0 ? Math.round(dayData.totalRisk / dayData.riskCount) : 0,
      });
    }

    return result;
  } catch (err) {
    console.error('Error fetching visit trends:', err);
    return [];
  }
}

export interface RecentActivity {
  id: string;
  type: 'note' | 'visit' | 'patient' | 'risk_update';
  title: string;
  description: string;
  timestamp: string;
  patientName?: string;
  patientId?: string;
  riskLevel?: string;
}

export async function getRecentActivity(userId: string, limit: number = 10): Promise<RecentActivity[]> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const activities: RecentActivity[] = [];

    const { data: notes } = await supabase
      .from('notes')
      .select('id, patient_name, chief_complaint, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    for (const n of notes || []) {
      activities.push({
        id: n.id,
        type: 'note',
        title: 'Clinical Note Created',
        description: n.chief_complaint || 'New clinical documentation',
        timestamp: n.created_at,
        patientName: n.patient_name,
      });
    }

    const { data: visits } = await supabase
      .from('visits')
      .select('id, patient_id, visit_type, chief_complaint, visit_date, risk_level')
      .eq('user_id', userId)
      .order('visit_date', { ascending: false })
      .limit(limit);

    for (const v of visits || []) {
      activities.push({
        id: v.id,
        type: 'visit',
        title: `${v.visit_type || 'Routine'} Visit`,
        description: v.chief_complaint || 'Patient visit recorded',
        timestamp: v.visit_date,
        patientId: v.patient_id,
        riskLevel: v.risk_level,
      });
    }

    return activities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  } catch (err) {
    console.error('Error fetching recent activity:', err);
    return [];
  }
}

export async function getUpcomingFollowUps(userId: string): Promise<Array<{
  patientId: string;
  patientName: string;
  followUpDate: string;
  reason: string;
  riskLevel?: string;
}>> {
  if (!isSupabaseConfigured()) {
    return [];
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const { data: visits, error } = await supabase
      .from('visits')
      .select('patient_id, follow_up_date, chief_complaint, risk_level')
      .eq('user_id', userId)
      .gte('follow_up_date', today)
      .lte('follow_up_date', nextMonth.toISOString())
      .order('follow_up_date', { ascending: true })
      .limit(10);

    if (error) throw error;

    const patientIds = [...new Set((visits || []).map(v => v.patient_id))];
    const { data: patients } = await supabase
      .from('patients')
      .select('id, name')
      .in('id', patientIds);

    const patientMap = new Map((patients || []).map(p => [p.id, p.name]));

    return (visits || []).map(v => ({
      patientId: v.patient_id,
      patientName: patientMap.get(v.patient_id) || 'Unknown Patient',
      followUpDate: v.follow_up_date,
      reason: v.chief_complaint || 'Follow-up visit',
      riskLevel: v.risk_level,
    }));
  } catch (err) {
    console.error('Error fetching upcoming follow-ups:', err);
    return [];
  }
}
