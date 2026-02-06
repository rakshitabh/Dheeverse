import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getMoodDistribution } from '@/lib/analytics';

export function MoodDistributionChart({ entries }) {
  const data = useMemo(() => {
    return getMoodDistribution(entries);
  }, [entries]);

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Mood Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            No mood data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Mood Distribution</CardTitle>
        <p className="text-sm text-muted-foreground">
          Frequency of each mood in your entries
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ mood, percentage }) => `${mood} (${percentage.toFixed(0)}%)`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="count"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                      <p className="text-sm font-medium">
                        {data.emoji} {data.mood}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Count: {data.count}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Percentage: {data.percentage.toFixed(1)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              formatter={(value, entry) => (
                <span style={{ color: entry.color }}>{entry.payload.emoji} {value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}



