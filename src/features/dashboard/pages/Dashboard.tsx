
import { useMemo } from 'react';
import {
  FileText, Clock, Activity, Plus, Users, AlertTriangle,
  TrendingUp, Calendar, ChevronRight, Heart, Shield,
  BarChart3, ArrowUpRight, ArrowDownRight, Minus, Zap
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { startOfDay, format } from 'date-fns';

// Hooks
import { useDatabase } from '@/hooks/useDatabase';
import { useDashboardStats, useVisitTrends, useRecentActivity, usePatients } from '@/hooks/useQueries';

// Charts
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Legend
} from 'recharts';

import type { User, Page, Note } from '@/App';

interface DashboardProps {
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  onNoteSelect?: (note: Note) => void;
}

const COLORS = {
  primary: '#0ea5e9', // Sky 500
  secondary: '#6366f1', // Indigo 500
  success: '#22c55e', // Green 500
  warning: '#eab308', // Yellow 500
  danger: '#ef4444', // Red 500
  neutral: '#94a3b8', // Slate 400
};

export default function Dashboard({ user, onNavigate, onLogout }: DashboardProps) {
  // Data Fetching via React Query
  const { data: stats, isLoading: statsLoading } = useDashboardStats(user.id);
  const { data: visitTrends, isLoading: trendsLoading } = useVisitTrends(user.id, 30);
  const { data: recentActivity, isLoading: activityLoading } = useRecentActivity(user.id, 5);
  const { data: patients } = usePatients(user.id);

  const isLoading = statsLoading || trendsLoading || activityLoading;

  // Derived Stats
  const timeSaved = useMemo(() => {
    if (!stats) return 0;
    // Assuming automation saves 50% of time per visit content gen
    const manualTimePerNote = 15; // mins
    return Math.round((stats.totalNotes * manualTimePerNote) / 60);
  }, [stats]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const weeklyTrend = useMemo(() => {
    if (!visitTrends || visitTrends.length < 14) return { change: 0, direction: 'neutral' };
    const lastWeek = visitTrends.slice(-7).reduce((sum, d) => sum + d.visits, 0);
    const prevWeek = visitTrends.slice(-14, -7).reduce((sum, d) => sum + d.visits, 0);
    const change = prevWeek > 0 ? Math.round(((lastWeek - prevWeek) / prevWeek) * 100) : 0;
    return {
      change: Math.abs(change),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
  }, [visitTrends]);

  // Loading State
  if (isLoading) {
    return (
      <DashboardLayout user={user} currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
        <div className="h-full flex flex-col items-center justify-center space-y-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 border-4 border-muted/30 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium animate-pulse">Loading Analytics...</p>
        </div>
      </DashboardLayout>
    );
  }

  const hasData = stats && (stats.totalPatients > 0 || stats.totalVisits > 0);

  return (
    <DashboardLayout user={user} currentPage="dashboard" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">

        {/* Helper Header & Quick Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {greeting}, Dr. {user.name.split(' ').pop()}
            </h1>
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
              <span className="hidden sm:inline text-muted-foreground/30">•</span>
              <span className="hidden sm:inline">{user.specialty} • {user.practiceName}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 hidden sm:flex" onClick={() => onNavigate('patients')}>
              <Users className="w-4 h-4" />
              Patients
            </Button>
            <Button className="gap-2 shadow-lg hover:shadow-primary/25 transition-all" onClick={() => onNavigate('recording')}>
              <Plus className="w-4 h-4" />
              New Consultation
            </Button>
          </div>
        </div>

        {!hasData ? (
          /* Zero State Dashboard */
          <Card className="border-dashed py-12 bg-muted/5">
            <div className="text-center space-y-4 max-w-lg mx-auto">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Get Started with ClinicalScribe</h2>
              <p className="text-muted-foreground">
                Your dashboard will populate with real-time analytics once you start seeing patients.
                Begin by adding a patient or recording your first consultation.
              </p>
              <div className="pt-4 flex justify-center gap-3">
                <Button onClick={() => onNavigate('recording')}>Start First Recording</Button>
                <Button variant="outline" onClick={() => onNavigate('patients')}>Add Patient</Button>
              </div>
            </div>
          </Card>
        ) : (
          /* Main Dashboard Content */
          <>
            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Patients KPI */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
                    <Users className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold">{stats?.activePatients}</span>
                    <span className="text-xs text-muted-foreground">active</span>
                  </div>
                  <div className="mt-4 h-1.5 w-full bg-primary/10 rounded-full overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${Math.min(((stats?.activePatients || 0) / 100) * 100, 100)}%` }} />
                  </div>
                </CardContent>
              </Card>

              {/* Visits KPI */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">Visits (Month)</p>
                    <Activity className="h-4 w-4 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold">{stats?.visitsThisMonth}</span>
                    <div className={`flex items-center text-xs px-1.5 py-0.5 rounded-full ${weeklyTrend.direction === 'up' ? 'bg-emerald-100 text-emerald-700' :
                        weeklyTrend.direction === 'down' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                      {weeklyTrend.direction === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1" /> :
                        weeklyTrend.direction === 'down' ? <ArrowDownRight className="w-3 h-3 mr-1" /> : <Minus className="w-3 h-3 mr-1" />}
                      {weeklyTrend.change}%
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">Vs. previous 30 days</p>
                </CardContent>
              </Card>

              {/* Risk KPI */}
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold text-red-600">{stats?.highRiskPatients}</span>
                    <span className="text-xs text-muted-foreground">needs review</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-4">{((stats?.highRiskPatients || 0) / (stats?.totalPatients || 1) * 100).toFixed(1)}% of total population</p>
                </CardContent>
              </Card>

              {/* Efficiency KPI */}
              <Card className="hover:shadow-md transition-shadow bg-gradient-to-br from-indigo-500 to-violet-600 text-white border-0">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-white/80">Time Saved</p>
                    <Clock className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-bold">{timeSaved}h</span>
                    <span className="text-xs text-white/60">automated</span>
                  </div>
                  <p className="text-xs text-white/80 mt-4">Est. {stats?.totalNotes} notes processed</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Trend Chart */}
              <Card className="lg:col-span-2 shadow-sm">
                <CardHeader>
                  <CardTitle>Patient Volume</CardTitle>
                  <CardDescription>Daily visit trends over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {visitTrends && visitTrends.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={visitTrends}>
                          <defs>
                            <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                          <XAxis
                            dataKey="date"
                            fontSize={12}
                            tickFormatter={(d) => format(new Date(d), 'MMM d')}
                            tickLine={false}
                            axisLine={false}
                            minTickGap={30}
                          />
                          <YAxis
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            labelStyle={{ color: '#64748b' }}
                          />
                          <Area
                            type="monotone"
                            dataKey="visits"
                            stroke={COLORS.primary}
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorVisits)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">No trend data available</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Risk Breakdown Pie Chart */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Risk Stratification</CardTitle>
                  <CardDescription>Current patient population risk</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px] relative">
                    {stats && (stats.highRiskPatients + stats.mediumRiskPatients + stats.lowRiskPatients > 0) ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Low', value: stats.lowRiskPatients, color: COLORS.success },
                              { name: 'Medium', value: stats.mediumRiskPatients, color: COLORS.warning },
                              { name: 'High', value: stats.highRiskPatients, color: COLORS.danger },
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {[{ name: 'Low', color: COLORS.success }, { name: 'Medium', color: COLORS.warning }, { name: 'High', color: COLORS.danger }].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No risk data</div>
                    )}

                    {/* Center Label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-8">
                      <div className="text-center">
                        <span className="text-2xl font-bold">{stats?.totalPatients}</span>
                        <p className="text-xs text-muted-foreground uppercase">Patients</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Risk Score</span>
                      <Badge variant={stats?.avgRiskScore && stats.avgRiskScore > 70 ? "destructive" : "outline"}>
                        {stats?.avgRiskScore || 0}/100
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                  <CardDescription>Latest actions and updates</CardDescription>
                </CardHeader>
                <ScrollArea className="h-[300px]">
                  <CardContent className="space-y-4">
                    {recentActivity && recentActivity.length > 0 ? (
                      recentActivity.map((activity) => (
                        <div key={activity.id} className="flex gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                          <div className={`mt-1 p-2 rounded-full h-fit flex items-center justify-center ${activity.type === 'note' ? 'bg-indigo-100 text-indigo-600' :
                              activity.type === 'visit' ? 'bg-emerald-100 text-emerald-600' :
                                'bg-amber-100 text-amber-600'
                            }`}>
                            {activity.type === 'note' && <FileText className="w-4 h-4" />}
                            {activity.type === 'visit' && <Users className="w-4 h-4" />}
                            {activity.type === 'risk_update' && <AlertTriangle className="w-4 h-4" />}
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                              <p className="font-medium text-sm">{activity.title}</p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {format(new Date(activity.timestamp), 'h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">{activity.description}</p>
                            {activity.patientName && (
                              <Badge variant="secondary" className="text-[10px] h-5 mt-1">
                                {activity.patientName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">No recent activity</div>
                    )}
                  </CardContent>
                </ScrollArea>
              </Card>

              {/* Visit Types (Horizontal Bar) */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>Visit Distribution</CardTitle>
                  <CardDescription>Breakdown by visit type</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {stats && Object.keys(stats.visitsByType).length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={Object.entries(stats.visitsByType).map(([k, v]) => ({ name: k, value: v }))}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" fontSize={12} />
                          <YAxis dataKey="name" type="category" width={100} fontSize={12} tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)} />
                          <Tooltip cursor={{ fill: 'transparent' }} />
                          <Bar dataKey="value" fill={COLORS.secondary} radius={[0, 4, 4, 0]} barSize={20} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">No data available</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
