import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Users, TrendingUp, Calendar, Download, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { saveAs } from 'file-saver';

interface ReportsComponentProps {
  attendance: any[];
  payments: any[];
  leaves: any[];
  users: any[];
}

export const ReportsComponent = ({ attendance, payments, leaves, users }: ReportsComponentProps) => {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [reportData, setReportData] = useState<any>({});

  useEffect(() => {
    generateReport();
  }, [selectedMonth, attendance, payments, leaves, users]);

  const generateReport = () => {
    const monthStart = startOfMonth(new Date(selectedMonth));
    const monthEnd = endOfMonth(new Date(selectedMonth));

    // Filter data for selected month
    const monthlyAttendance = attendance.filter(record => {
      const recordDate = record.date ? new Date(record.date) : new Date(record.timestamp?.seconds * 1000);
      return isWithinInterval(recordDate, { start: monthStart, end: monthEnd });
    });

    const monthlyPayments = payments.filter(payment => {
      const paymentDate = new Date(payment.createdAt?.seconds * 1000);
      return isWithinInterval(paymentDate, { start: monthStart, end: monthEnd });
    });

    const monthlyLeaves = leaves.filter(leave => {
      const leaveDate = new Date(leave.createdAt?.seconds * 1000);
      return isWithinInterval(leaveDate, { start: monthStart, end: monthEnd });
    });

    // Calculate statistics
    const totalAttendance = monthlyAttendance.length;
    const uniqueAttendees = new Set(monthlyAttendance.map(r => r.userId)).size;
    const totalRevenue = monthlyPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0);
    const approvedLeaves = monthlyLeaves.filter(l => l.status === 'approved').length;
    const averageAttendancePerUser = uniqueAttendees > 0 ? Math.round(totalAttendance / uniqueAttendees) : 0;

    // Daily attendance breakdown
    const dailyStats = monthlyAttendance.reduce((acc: any, record) => {
      const date = record.date || format(new Date(record.timestamp?.seconds * 1000), 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = 0;
      acc[date]++;
      return acc;
    }, {});

    setReportData({
      totalAttendance,
      uniqueAttendees,
      totalRevenue,
      approvedLeaves,
      averageAttendancePerUser,
      dailyStats,
      monthlyAttendance,
      monthlyPayments,
      monthlyLeaves
    });
  };

  const exportReport = () => {
    const reportContent = {
      'Month': format(new Date(selectedMonth), 'MMMM yyyy'),
      'Total Attendance': reportData.totalAttendance,
      'Unique Attendees': reportData.uniqueAttendees,
      'Total Revenue': `₹${reportData.totalRevenue}`,
      'Approved Leaves': reportData.approvedLeaves,
      'Average Attendance per User': reportData.averageAttendancePerUser,
      'Daily Breakdown': JSON.stringify(reportData.dailyStats, null, 2)
    };

    const csvContent = [
      Object.keys(reportContent).join(','),
      Object.values(reportContent).join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `monthly-report-${selectedMonth}.csv`);
  };

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return format(date, 'yyyy-MM');
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold">Monthly Reports</h2>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month} value={month}>
                  {format(new Date(month), 'MMMM yyyy')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={exportReport} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attendance</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalAttendance || 0}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.uniqueAttendees || 0} unique users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{reportData.totalRevenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Leaves</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.approvedLeaves || 0}</div>
            <p className="text-xs text-muted-foreground">leave requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Attendance</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.averageAttendancePerUser || 0}</div>
            <p className="text-xs text-muted-foreground">per user</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Attendance Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {reportData.dailyStats && Object.keys(reportData.dailyStats).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(reportData.dailyStats)
                .sort(([a], [b]) => b.localeCompare(a))
                .slice(0, 21) // Show last 21 days
                .map(([date, count]: [string, any]) => (
                  <div key={date} className="flex items-center justify-between p-3 border rounded-lg">
                    <span className="text-sm font-medium">
                      {format(new Date(date), 'MMM dd')}
                    </span>
                    <Badge variant="outline">{count} attendees</Badge>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No attendance data for selected month
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Attendees</CardTitle>
        </CardHeader>
        <CardContent>
          {reportData.monthlyAttendance && reportData.monthlyAttendance.length > 0 ? (
            <div className="space-y-3">
              {Object.entries(
                reportData.monthlyAttendance.reduce((acc: any, record: any) => {
                  const userEmail = record.userEmail || 'Unknown';
                  if (!acc[userEmail]) acc[userEmail] = 0;
                  acc[userEmail]++;
                  return acc;
                }, {})
              )
                .sort(([, a]: [string, any], [, b]: [string, any]) => b - a)
                .slice(0, 10)
                .map(([email, count]: [string, any], index) => (
                  <div key={email} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium">{email}</span>
                    </div>
                    <Badge variant="outline">{count} meals</Badge>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              No attendance data for selected month
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};