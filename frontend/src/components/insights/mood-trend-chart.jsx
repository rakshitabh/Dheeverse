import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyzeMoodTrends, getMoodColor } from '@/lib/analytics';
import { format, parseISO } from 'date-fns';

export function MoodTrendChart({ entries, days = 30 }) {
  const data = useMemo(() => {
    const trendData = analyzeMoodTrends(entries, days);
    return trendData.map((item) => ({
      date: format(parseISO(item.date), 'MMM dd'),
      mood: item.averageMood,
      fullDate: item.date,
    }));
  }, [entries, days]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No data available for the selected period
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Trend ({days} Days)</CardTitle>
        <p className="text-sm text-muted-foreground">
          Average mood over time (1 = Low, 5 = High)
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <YAxis
              domain={[1, 5]}
              className="text-xs"
              tick={{ fill: 'currentColor' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium">
                        {payload[0].payload.fullDate &&
                          format(parseISO(payload[0].payload.fullDate), 'MMM dd, yyyy')}
                      </p>
                      <p className="text-sm text-primary">
                        Mood: {payload[0].value?.toFixed(1)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4, fill: '#3b82f6' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}



