import { useState, useMemo } from 'react';
import { useJournal } from '@/lib/journal-context';
import { useUser } from '@/lib/user-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QuickEntry } from '@/components/dashboard/quick-entry';
import { RecentEntries } from '@/components/dashboard/recent-entries';
import { BookOpen, TrendingUp, Target, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMoodFromEntry, getMoodValue } from '@/lib/analytics';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { CalendarWidget } from '@/components/calendar-widget';

const motivationalQuotes = [
  { text: "You don't have to control your thoughts. You just have to stop letting them control you.", author: "Dan Millman" },
  { text: "The only way out is through.", author: "Robert Frost" },
  { text: "You are stronger than you think.", author: "Unknown" },
  { text: "Progress, not perfection.", author: "Unknown" },
  { text: "Healing is not linear.", author: "Unknown" },
  { text: "Your mental health is a priority.", author: "Unknown" },
  { text: "It's okay to not be okay.", author: "Unknown" },
  { text: "Small steps are still progress.", author: "Unknown" },
];

export default function DashboardPage() {
  const { entries, completedActivities } = useJournal();
  const { user, isLoading: isUserLoading } = useUser();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [quote, setQuote] = useState(motivationalQuotes[0]);

  if (isUserLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const activeEntries = entries.filter(e => !e.isArchived);
  
  // Comprehensive wellness score calculation
  // Formula: (Mood Score * 0.4) + (Activity Completion * 0.3) + (Consistency * 0.2) + (Stress Management * 0.1)
  const wellnessScore = useMemo(() => {
    if (activeEntries.length === 0) return 0;
    
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    // Get recent entries (last 7 days)
    const recentEntries = activeEntries.filter(e => new Date(e.createdAt) >= last7Days);
    
    // 1. Mood Score Component (40% weight) - Average mood from last 7 days
    let moodScore = 0;
    let moodCount = 0;
    recentEntries.forEach(entry => {
      const moodValue = typeof entry.mood === 'number' 
        ? entry.mood 
        : getMoodValue(getMoodFromEntry(entry));
      moodScore += moodValue;
      moodCount += 1;
    });
    const avgMood = moodCount > 0 ? (moodScore / moodCount) / 5 : 0; // Normalize to 0-1
    
    // 2. Activity Completion Component (30% weight) - Completed activities in last 7 days
    const recentActivities = completedActivities.filter(a => {
      const completedDate = new Date(a.completedAt);
      return completedDate >= last7Days;
    });
    const activityScore = Math.min(recentActivities.length / 7, 1); // Max 1 activity per day
    
    // 3. Consistency Component (20% weight) - Entry frequency in last 30 days
    const entriesLast30Days = activeEntries.filter(e => new Date(e.createdAt) >= last30Days);
    const uniqueDays = new Set(entriesLast30Days.map(e => {
      const d = new Date(e.createdAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })).size;
    const consistencyScore = Math.min(uniqueDays / 30, 1); // Max 30 days
    
    // 4. Stress Management Component (10% weight) - Lower stress entries = higher score
    const stressEntries = recentEntries.filter(e => {
      const mood = getMoodFromEntry(e);
      return ['Stressed', 'Anxious', 'Overwhelmed'].includes(mood);
    });
    const stressScore = Math.max(0, 1 - (stressEntries.length / Math.max(recentEntries.length, 1)));
    
    // Calculate final wellness score (0-5 scale)
    const finalScore = (avgMood * 0.4 + activityScore * 0.3 + consistencyScore * 0.2 + stressScore * 0.1) * 5;
    
    return Math.min(5, Math.max(0, finalScore)).toFixed(1);
  }, [activeEntries, completedActivities]);

  // Calculate weekly goals met (based on user goals: entries + activities)
  const goalsMetThisWeek = useMemo(() => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    // Count entries in the last week
    const recentEntries = activeEntries.filter(e => {
      const entryDate = new Date(e.createdAt);
      return entryDate >= oneWeekAgo;
    });
    
    // Count unique days with entries
    const uniqueEntryDays = new Set(recentEntries.map(e => {
      const d = new Date(e.createdAt);
      return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    })).size;
    
    // Count completed activities in the last week
    const recentActivities = completedActivities.filter(a => {
      const completedDate = new Date(a.completedAt);
      return completedDate >= oneWeekAgo;
    }).length;
    
    // Goals: At least 5 journal entries OR 3+ activities OR combination
    // Each entry day counts as 1, each activity counts as 1
    const totalGoalsMet = uniqueEntryDays + recentActivities;
    
    // Return the count (max 5 for display, but can show actual count)
    return Math.min(5, totalGoalsMet);
  }, [activeEntries, completedActivities]);

  // Get mood colors for calendar dates
  const getMoodForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEntries = activeEntries.filter(e => {
      const entryDate = format(new Date(e.createdAt), 'yyyy-MM-dd');
      return entryDate === dateStr;
    });

    if (dayEntries.length === 0) return null;

    let totalMood = 0;
    let count = 0;

    dayEntries.forEach(entry => {
      if (entry.moodCounts && Object.keys(entry.moodCounts).length > 0) {
        Object.entries(entry.moodCounts).forEach(([moodScore, moodCount]) => {
          totalMood += parseInt(moodScore) * moodCount;
          count += moodCount;
        });
      } else {
        const moodLabel = getMoodFromEntry(entry);
        const numeric = getMoodValue(moodLabel);
        totalMood += numeric;
        count += 1;
      }
    });

    const avgMood = count > 0 ? totalMood / count : 0;
    return avgMood;
  };

  const getMoodColor = (mood) => {
    if (mood >= 4.5) return 'bg-green-500';
    if (mood >= 3.5) return 'bg-lime-400';
    if (mood >= 2.5) return 'bg-yellow-400';
    if (mood >= 1.5) return 'bg-orange-400';
    return 'bg-red-400';
  };

  const rotateQuote = () => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    setQuote(motivationalQuotes[randomIndex]);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{greeting()}, {user?.name || 'Journal'}</h1>
        <p className="text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Total Entries */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Entries</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeEntries.length}</div>
            <p className="text-xs text-muted-foreground mt-1">journal entries</p>
          </CardContent>
        </Card>

        {/* Wellness Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Wellness Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{wellnessScore}/5</div>
            <p className="text-xs text-muted-foreground mt-1">+2% from last week</p>
          </CardContent>
        </Card>

        {/* Goals Met */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Goals Met</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{goalsMetThisWeek}/5</div>
            <p className="text-xs text-muted-foreground mt-1">weekly goals</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Quick Entry & Recent Entries */}
        <div className="lg:col-span-2 space-y-6">
          <QuickEntry />
          <RecentEntries />
        </div>

        {/* Right Column - Quote, Calendar & Mood Scale */}
        <div className="space-y-6">
          {/* Motivational Quote */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="text-6xl mb-2">💚</div>
                <Button variant="ghost" size="icon" onClick={rotateQuote}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <blockquote className="space-y-2">
                <p className="text-sm italic leading-relaxed">"{quote.text}"</p>
                <footer className="text-xs text-muted-foreground">— {quote.author}</footer>
              </blockquote>
              <Button variant="link" className="mt-4 p-0 h-auto text-xs" onClick={rotateQuote}>
                <RefreshCw className="mr-1 h-3 w-3" />
                New Quote
              </Button>
            </CardContent>
          </Card>

          {/* Calendar */}
          <CalendarWidget
            selectedDate={selectedDate}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setCurrentMonth(date);
            }}
            getMoodForDate={getMoodForDate}
            getMoodColor={getMoodColor}
          />

          {/* Mood Scale */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Mood Scale</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 text-center text-xs font-medium">
                <div className="space-y-1">
                  <div className="w-full rounded-lg bg-red-400 text-white py-2">1
                  </div>
                  <div className="text-[11px] text-muted-foreground">Very Sad</div>
                </div>
                <div className="space-y-1">
                  <div className="w-full rounded-lg bg-orange-400 text-white py-2">2</div>
                  <div className="text-[11px] text-muted-foreground">Sad</div>
                </div>
                <div className="space-y-1">
                  <div className="w-full rounded-lg bg-yellow-400 text-white py-2">3</div>
                  <div className="text-[11px] text-muted-foreground">Neutral</div>
                </div>
                <div className="space-y-1">
                  <div className="w-full rounded-lg bg-lime-400 text-white py-2">4</div>
                  <div className="text-[11px] text-muted-foreground">Good</div>
                </div>
                <div className="space-y-1">
                  <div className="w-full rounded-lg bg-green-500 text-white py-2">5</div>
                  <div className="text-[11px] text-muted-foreground">Very Good</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Your Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-3">
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl">
                    ✨
                  </div>
                  <span className="text-[10px] text-center text-muted-foreground">First Entry</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-xl">
                    🔥
                  </div>
                  <span className="text-[10px] text-center text-muted-foreground">Week Warrior</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-xl">
                    🏆
                  </div>
                  <span className="text-[10px] text-center text-muted-foreground">Month Master</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-xl">
                    💗
                  </div>
                  <span className="text-[10px] text-center text-muted-foreground">Gratitude Guru</span>
                </div>
                <div className="flex flex-col items-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-xl">
                    🧠
                  </div>
                  <span className="text-[10px] text-center text-muted-foreground">Mindful Maven</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
