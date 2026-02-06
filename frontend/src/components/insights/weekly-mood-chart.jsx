import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getWeeklyMoodPattern } from '@/lib/analytics';

export function WeeklyMoodChart({ entries }) {
  const data = useMemo(() => {
    return getWeeklyMoodPattern(entries);
  }, [entries]);

  if (data.every((d) => d.count === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Weekly Mood Pattern</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Mood Pattern</CardTitle>
        <p className="text-sm text-muted-foreground">
          Average mood by day of the week
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="day"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              domain={[0, 5]}
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium">
                        {payload[0].payload.day}
                      </p>
                      <p className="text-sm text-primary">
                        Average Mood: {payload[0].value?.toFixed(1)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Entries: {payload[0].payload.count}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="averageMood" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}



