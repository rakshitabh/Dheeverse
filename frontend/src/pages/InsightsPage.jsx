import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, BarChart3, Calendar, Smile } from 'lucide-react';
import { useJournal } from '@/lib/journal-context';
import {
  getInsightsSummary,
  getMostCommonEmotions,
  getMoodEmoji,
  getMoodColor,
} from '@/lib/analytics';
import { MoodTrendChart } from '@/components/insights/mood-trend-chart';
import { MoodDistributionChart } from '@/components/insights/mood-distribution-chart';
import { WeeklyMoodChart } from '@/components/insights/weekly-mood-chart';
import { MonthlyMoodChart } from '@/components/insights/monthly-mood-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function InsightsPage() {
  const { entries, loading } = useJournal();
  const [trendDays, setTrendDays] = useState(30);

  const summary = useMemo(() => getInsightsSummary(entries), [entries]);
  const commonEmotions = useMemo(() => getMostCommonEmotions(entries, 5), [entries]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Loading insights...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <BarChart3 className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Insights & Analytics</h1>
        </div>
        <p className="text-muted-foreground">
          Discover patterns and trends in your wellness journey
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalEntries}</div>
            <p className="text-xs text-muted-foreground">Journal entries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Mood</CardTitle>
            <Smile className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.averageMood.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">Out of 5.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Common Mood</CardTitle>
            <span className="text-2xl">{getMoodEmoji(summary.mostCommonMood)}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.mostCommonMood}</div>
            <p className="text-xs text-muted-foreground">Frequently experienced</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Trend</CardTitle>
            {summary.recentTrend === 'improving' ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : summary.recentTrend === 'declining' ? (
              <TrendingDown className="h-4 w-4 text-red-500" />
            ) : (
              <Minus className="h-4 w-4 text-muted-foreground" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{summary.recentTrend}</div>
            <p className="text-xs text-muted-foreground">
              {summary.trendValue !== 0 && (
                <span className={summary.trendValue > 0 ? 'text-green-500' : 'text-red-500'}>
                  {summary.trendValue > 0 ? '+' : ''}
                  {summary.trendValue.toFixed(1)} points
                </span>
              )}
              {summary.trendValue === 0 && 'No change'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="trends" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="trends">Trends</TabsTrigger>
            <TabsTrigger value="distribution">Distribution</TabsTrigger>
            <TabsTrigger value="patterns">Patterns</TabsTrigger>
          </TabsList>

          <Select value={trendDays.toString()} onValueChange={(v) => setTrendDays(parseInt(v))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <TabsContent value="trends" className="space-y-4">
          <MoodTrendChart entries={entries} days={trendDays} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WeeklyMoodChart entries={entries} />
            <MonthlyMoodChart entries={entries} />
          </div>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <MoodDistributionChart entries={entries} />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WeeklyMoodChart entries={entries} />
            <MonthlyMoodChart entries={entries} />
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Most Common Emotions */}
        <Card>
          <CardHeader>
            <CardTitle>Most Common Emotions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Emotions you've expressed most frequently
            </p>
          </CardHeader>
          <CardContent>
            {commonEmotions.length > 0 ? (
              <div className="space-y-3">
                {commonEmotions.map((item, index) => (
                  <div key={item.emotion} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                        {index + 1}
                      </div>
                      <span className="font-medium capitalize">{item.emotion}</span>
                    </div>
                    <Badge variant="secondary">{item.count} times</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                No emotion data available
              </p>
            )}
          </CardContent>
        </Card>

        {/* Mood Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Mood Insights</CardTitle>
            <p className="text-sm text-muted-foreground">
              Key insights about your mood patterns
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm font-medium mb-1">Your Average Mood</p>
                <p className="text-2xl font-bold text-primary">
                  {summary.averageMood.toFixed(1)} / 5.0
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Based on {summary.totalEntries} entries
                </p>
              </div>

              <div className="p-4 bg-accent/5 border border-accent/20 rounded-lg">
                <p className="text-sm font-medium mb-1">Most Common Mood</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getMoodEmoji(summary.mostCommonMood)}</span>
                  <span className="text-lg font-semibold">{summary.mostCommonMood}</span>
                </div>
              </div>

              {summary.recentTrend !== 'stable' && (
                <div
                  className={`p-4 rounded-lg border ${
                    summary.recentTrend === 'improving'
                      ? 'bg-green-500/10 border-green-500/20'
                      : 'bg-red-500/10 border-red-500/20'
                  }`}
                >
                  <p className="text-sm font-medium mb-1">Recent Trend</p>
                  <p className="text-sm">
                    Your mood has been{' '}
                    <span className="font-semibold">{summary.recentTrend}</span> over the past
                    week
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
