import { createContext, useContext, useState, useEffect } from 'react';
import { journalAPI } from './api';
import { useUser } from './user-context';

const JournalContext = createContext(undefined);

const defaultBadges = [
  {
    id: '1',
    name: 'First Entry',
    description: 'Write your first journal entry',
    icon: 'sparkles',
    requirement: { type: 'entries', value: 1 },
  },
  {
    id: '2',
    name: 'Week Warrior',
    description: 'Maintain a 7-day streak',
    icon: 'flame',
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: '3',
    name: 'Month Master',
    description: 'Maintain a 30-day streak',
    icon: 'trophy',
    requirement: { type: 'streak', value: 30 },
  },
  {
    id: '4',
    name: 'Gratitude Guru',
    description: 'Write 10 grateful entries',
    icon: 'heart',
    requirement: { type: 'emotion', value: 10 },
  },
  {
    id: '5',
    name: 'Mindful Maven',
    description: 'Complete 5 wellness activities',
    icon: 'brain',
    requirement: { type: 'activity', value: 5 },
  },
];

function calculateStreak(entries) {
  if (entries.length === 0) return 0;

  // Unique dates only so multiple entries in one day count as one
  const uniqueDates = Array.from(
    new Set(
      entries
        .filter((e) => !e.isArchived)
        .map((e) => {
          const d = new Date(e.createdAt);
          d.setHours(0, 0, 0, 0);
          return d.getTime();
        })
    )
  )
    .sort((a, b) => b - a)
    .map((ts) => {
      const d = new Date(ts);
      d.setHours(0, 0, 0, 0);
      return d;
    });

  if (uniqueDates.length === 0) return 0;

  let streak = 0;
  let prevDate = null;

  for (const entryDate of uniqueDates) {
    if (!prevDate) {
      streak = 1;
      prevDate = entryDate;
      continue;
    }

    const diffDays = Math.floor((prevDate.getTime() - entryDate.getTime()) / 86400000);
    if (diffDays === 1) {
      streak += 1;
      prevDate = entryDate;
    } else {
      break;
    }
  }

  return streak;
}

export function JournalProvider({ children }) {
  const { user } = useUser();
  const [entries, setEntries] = useState([]);
  const [badges, setBadges] = useState(defaultBadges);
  const [completedActivities, setCompletedActivities] = useState([]);
  const [mindfulnessCompletions, setMindfulnessCompletions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load entries from backend on mount and when user changes
  useEffect(() => {
    if (user?._id || user?.id) {
      loadEntries();
    } else {
      setEntries([]);
      setLoading(false);
    }
  }, [user]);

  const streakData = {
    currentStreak: calculateStreak(entries),
    longestStreak: 7,
    totalEntries: entries.filter((e) => !e.isArchived).length,
    lastEntryDate: entries.length > 0 ? entries[0].createdAt : null,
  };

  useEffect(() => {
    checkAndUnlockBadges();
  }, [entries, completedActivities]);

  function checkAndUnlockBadges() {
    setBadges((prev) =>
      prev.map((badge) => {
        if (badge.unlockedAt) return badge;

        let shouldUnlock = false;

        switch (badge.requirement.type) {
          case 'entries':
            shouldUnlock = entries.length >= badge.requirement.value;
            break;
          case 'streak':
            shouldUnlock = streakData.currentStreak >= badge.requirement.value;
            break;
          case 'activity':
            shouldUnlock = completedActivities.length >= badge.requirement.value;
            break;
          case 'emotion': {
            const gratefulEntries = entries.filter((e) => {
              const emos = Array.isArray(e.emotions) ? e.emotions : [];
              return emos.includes('grateful');
            });
            shouldUnlock = gratefulEntries.length >= badge.requirement.value;
            break;
          }
        }

        return shouldUnlock ? { ...badge, unlockedAt: new Date() } : badge;
      })
    );
  }

  // Load entries from backend
  const loadEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📥 Loading entries from backend...');
      const fetchedEntries = await journalAPI.getAll(null);
      console.log(`✅ Loaded ${fetchedEntries.length} entries from backend`);
      setEntries(fetchedEntries);
    } catch (err) {
      console.error('❌ Failed to load entries:', err);
      setError(err.message);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (entry) => {
    try {
      console.log('📝 Adding entry with data:', { 
        hasContent: !!entry.content, 
        aiSource: entry.aiSource,
        mood: entry.mood 
      });

      // Save to backend first
      if (user?._id || user?.id) {
        console.log('💾 Saving to backend...');
        const savedEntry = await journalAPI.create(entry);
        console.log('✅ Entry saved to backend:', savedEntry);
        
        // Add saved entry to state
        setEntries((prev) => [savedEntry, ...prev]);
        return savedEntry;
      } else {
        // If no user, save locally only
        const localEntry = {
          ...entry,
          id: `local-${Date.now()}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setEntries((prev) => [localEntry, ...prev]);
        return localEntry;
      }
    } catch (err) {
      console.error('❌ Failed to save entry:', err);
      throw err;
    }
  };

  const updateEntry = async (id, updates) => {
    const previousEntry = entries.find((e) => e.id === id);
    if (!previousEntry) {
      throw new Error('Entry not found');
    }

    try {
      // Optimistically update UI
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, ...updates, updatedAt: new Date() } : entry
        )
      );

      // Save to backend
      if (user?._id || user?.id) {
        try {
          await journalAPI.update(id, updates);
        } catch (apiErr) {
          // Revert on API error
          console.error('Backend update failed, reverting:', apiErr);
          setEntries((prev) =>
            prev.map((entry) => (entry.id === id ? previousEntry : entry))
          );
          throw apiErr;
        }
      }
    } catch (err) {
      console.error('Failed to update entry:', err);
      throw err;
    }
  };

  const deleteEntry = async (id) => {
    const entryToDelete = entries.find((e) => e.id === id);
    if (!entryToDelete) {
      throw new Error('Entry not found');
    }

    try {
      // Optimistically remove from UI
      setEntries((prev) => prev.filter((entry) => entry.id !== id));

      // Delete from backend
      if (user?._id || user?.id) {
        try {
          await journalAPI.delete(id);
        } catch (apiErr) {
          // Restore entry on API error
          console.error('Backend delete failed, restoring:', apiErr);
          setEntries((prev) => [...prev, entryToDelete].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
          ));
          throw apiErr;
        }
      }
    } catch (err) {
      console.error('Failed to delete entry:', err);
      throw err;
    }
  };

  const archiveEntry = async (id) => {
    const entryToArchive = entries.find((e) => e.id === id);
    if (!entryToArchive) {
      throw new Error('Entry not found');
    }

    try {
      // Optimistically update UI
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, isArchived: true, updatedAt: new Date() } : entry
        )
      );

      // Save to backend
      if (user?._id || user?.id) {
        try {
          await journalAPI.archive(id, true);
        } catch (apiErr) {
          // Revert on API error
          console.error('Backend archive failed, reverting:', apiErr);
          setEntries((prev) =>
            prev.map((entry) => (entry.id === id ? entryToArchive : entry))
          );
          throw apiErr;
        }
      }
    } catch (err) {
      console.error('Failed to archive entry:', err);
      throw err;
    }
  };

  const restoreEntry = async (id) => {
    try {
      // Optimistically update UI
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, isArchived: false, updatedAt: new Date() } : entry
        )
      );

      // Save to backend
      if (user?._id || user?.id) {
        await journalAPI.archive(id, false);
      }
    } catch (err) {
      console.error('Failed to restore entry:', err);
      if (user?._id || user?.id) {
        loadEntries();
      }
      throw err;
    }
  };

  const permanentlyDeleteEntry = (id) => {
    setEntries((prev) => prev.filter((entry) => entry.id !== id));
  };

  const archiveMultiple = (ids) => {
    setEntries((prev) =>
      prev.map((entry) => (ids.includes(entry.id) ? { ...entry, isArchived: true, updatedAt: new Date() } : entry))
    );
  };

  const restoreMultiple = (ids) => {
    setEntries((prev) =>
      prev.map((entry) => (ids.includes(entry.id) ? { ...entry, isArchived: false, updatedAt: new Date() } : entry))
    );
  };

  const deleteMultiple = (ids) => {
    setEntries((prev) => prev.filter((entry) => !ids.includes(entry.id)));
  };

  const addCompletedActivity = (activity) => {
    setCompletedActivities((prev) => [...prev, { ...activity, completedAt: new Date() }]);
  };

  const completeMindfulness = (activityId) => {
    setMindfulnessCompletions((prev) => ({
      ...prev,
      [activityId]: (prev[activityId] || 0) + 1,
    }));
  };

  return (
    <JournalContext.Provider
      value={{
        entries,
        loading,
        error,
        loadEntries,
        addEntry,
        updateEntry,
        deleteEntry,
        archiveEntry,
        restoreEntry,
        permanentlyDeleteEntry,
        archiveMultiple,
        restoreMultiple,
        deleteMultiple,
        streakData,
        badges,
        completedActivities,
        addCompletedActivity,
        mindfulnessCompletions,
        completeMindfulness,
      }}
    >
      {children}
    </JournalContext.Provider>
  );
}

export function useJournal() {
  const context = useContext(JournalContext);
  if (!context) {
    throw new Error('useJournal must be used within a JournalProvider');
  }
  return context;
}


