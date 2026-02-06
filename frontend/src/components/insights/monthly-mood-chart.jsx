import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMonthlyMoodSummary } from '@/lib/analytics';

export function MonthlyMoodChart({ entries }) {
  const data = useMemo(() => {
    return getMonthlyMoodSummary(entries);
  }, [entries]);

  if (data.every((d) => d.count === 0)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Mood Summary</CardTitle>
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
        <CardTitle>Monthly Mood Summary</CardTitle>
        <p className="text-sm text-muted-foreground">
          Average mood over the last 6 months
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="month"
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
                        {payload[0].payload.month}
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
            <Area
              type="monotone"
              dataKey="averageMood"
              stroke="#3b82f6"
              fillOpacity={1}
              fill="url(#colorMood)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}



