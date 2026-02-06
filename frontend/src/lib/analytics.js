// Analytics utilities for mood and journal entry analysis

// Mood mapping for numeric moods to string moods
const numericMoodMap = {
  1: 'Sad',
  2: 'Sad',
  3: 'Neutral',
  4: 'Happy',
  5: 'Happy',
};

// Get mood from entry (handles both numeric and string moods)
export function getMoodFromEntry(entry) {
  if (typeof entry.mood === 'string') {
    return entry.mood;
  }
  if (typeof entry.mood === 'number') {
    return numericMoodMap[entry.mood] || 'Neutral';
  }
  return 'Neutral';
}

// Get mood value for charting (converts moods to numeric scale)
export function getMoodValue(mood) {
  const moodValues = {
    'Sad': 1,
    'Stressed': 2,
    'Anxious': 2,
    'Angry': 2,
    'Tired': 2,
    'Confused': 2.5,
    'Overwhelmed': 2.5,
    'Neutral': 3,
    'Calm': 4,
    'Happy': 5,
  };
  return moodValues[mood] || 3;
}

// Get mood color for charts
export function getMoodColor(mood) {
  const moodColors = {
    'Happy': '#10b981', // green
    'Calm': '#3b82f6', // blue
    'Neutral': '#6b7280', // gray
    'Sad': '#8b5cf6', // purple
    'Stressed': '#f59e0b', // amber
    'Angry': '#ef4444', // red
    'Anxious': '#f97316', // orange
    'Tired': '#6366f1', // indigo
    'Confused': '#ec4899', // pink
    'Overwhelmed': '#dc2626', // dark red
  };
  return moodColors[mood] || '#6b7280';
}

// Get mood emoji
export function getMoodEmoji(mood) {
  const moodEmojis = {
    'Happy': '😊',
    'Calm': '😌',
    'Neutral': '😐',
    'Sad': '😢',
    'Stressed': '😣',
    'Angry': '😠',
    'Anxious': '😟',
    'Tired': '😴',
    'Confused': '😕',
    'Overwhelmed': '😵‍💫',
  };
  return moodEmojis[mood] || '😐';
}

// Analyze mood trends over time
export function analyzeMoodTrends(entries, days = 30) {
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const filteredEntries = entries
    .filter((e) => !e.isArchived)
    .filter((e) => new Date(e.createdAt) >= startDate)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  // Group by date
  const dailyData = {};
  filteredEntries.forEach((entry) => {
    const date = new Date(entry.createdAt);
    const dateKey = date.toISOString().split('T')[0];
    const mood = getMoodFromEntry(entry);

    if (!dailyData[dateKey]) {
      dailyData[dateKey] = {
        date: dateKey,
        moods: [],
        values: [],
        count: 0,
      };
    }

    dailyData[dateKey].moods.push(mood);
    dailyData[dateKey].values.push(getMoodValue(mood));
    dailyData[dateKey].count++;
  });

  // Calculate average mood per day
  const trendData = Object.values(dailyData).map((day) => ({
    date: day.date,
    averageMood: day.values.reduce((a, b) => a + b, 0) / day.values.length,
    mood: day.moods[day.moods.length - 1], // Most recent mood of the day
    count: day.count,
  }));

  return trendData;
}

// Get mood distribution
export function getMoodDistribution(entries) {
  const distribution = {};
  let total = 0;

  entries
    .filter((e) => !e.isArchived)
    .forEach((entry) => {
      const mood = getMoodFromEntry(entry);
      distribution[mood] = (distribution[mood] || 0) + 1;
      total++;
    });

  return Object.entries(distribution)
    .map(([mood, count]) => ({
      mood,
      count,
      percentage: total > 0 ? (count / total) * 100 : 0,
      color: getMoodColor(mood),
      emoji: getMoodEmoji(mood),
    }))
    .sort((a, b) => b.count - a.count);
}

// Get weekly mood pattern
export function getWeeklyMoodPattern(entries) {
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weeklyData = weekDays.map((day) => ({
    day,
    moods: [],
    values: [],
  }));

  entries
    .filter((e) => !e.isArchived)
    .forEach((entry) => {
      const date = new Date(entry.createdAt);
      const dayOfWeek = date.getDay();
      const mood = getMoodFromEntry(entry);

      weeklyData[dayOfWeek].moods.push(mood);
      weeklyData[dayOfWeek].values.push(getMoodValue(mood));
    });

  return weeklyData.map((day) => ({
    day: day.day,
    averageMood:
      day.values.length > 0
        ? day.values.reduce((a, b) => a + b, 0) / day.values.length
        : 0,
    count: day.moods.length,
  }));
}

// Get monthly mood summary
export function getMonthlyMoodSummary(entries) {
  const now = new Date();
  const months = [];
  
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    months.push({
      month: monthKey,
      monthIndex: date.getMonth(),
      year: date.getFullYear(),
      moods: [],
      values: [],
    });
  }

  entries
    .filter((e) => !e.isArchived)
    .forEach((entry) => {
      const date = new Date(entry.createdAt);
      const monthIndex = months.findIndex(
        (m) => m.monthIndex === date.getMonth() && m.year === date.getFullYear()
      );

      if (monthIndex >= 0) {
        const mood = getMoodFromEntry(entry);
        months[monthIndex].moods.push(mood);
        months[monthIndex].values.push(getMoodValue(mood));
      }
    });

  return months.map((month) => ({
    month: month.month,
    averageMood:
      month.values.length > 0
        ? month.values.reduce((a, b) => a + b, 0) / month.values.length
        : 0,
    count: month.moods.length,
  }));
}

// Get most common emotions
export function getMostCommonEmotions(entries, limit = 5) {
  const emotionCount = {};

  entries
    .filter((e) => !e.isArchived)
    .forEach((entry) => {
      if (entry.emotions && Array.isArray(entry.emotions)) {
        entry.emotions.forEach((emotion) => {
          emotionCount[emotion] = (emotionCount[emotion] || 0) + 1;
        });
      }
    });

  return Object.entries(emotionCount)
    .map(([emotion, count]) => ({
      emotion,
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

// Get insights summary
export function getInsightsSummary(entries) {
  const totalEntries = entries.filter((e) => !e.isArchived).length;
  const moodDistribution = getMoodDistribution(entries);
  const averageMood =
    moodDistribution.length > 0
      ? moodDistribution.reduce(
          (sum, m) => sum + getMoodValue(m.mood) * m.count,
          0
        ) / totalEntries
      : 0;

  const mostCommonMood = moodDistribution[0]?.mood || 'Neutral';
  const trendData = analyzeMoodTrends(entries, 7);
  const recentTrend =
    trendData.length >= 2
      ? trendData[trendData.length - 1].averageMood -
        trendData[0].averageMood
      : 0;

  return {
    totalEntries,
    averageMood: Math.round(averageMood * 10) / 10,
    mostCommonMood,
    recentTrend: recentTrend > 0 ? 'improving' : recentTrend < 0 ? 'declining' : 'stable',
    trendValue: Math.round(recentTrend * 10) / 10,
  };
}

