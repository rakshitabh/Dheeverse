import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Sparkles, Search, Heart } from "lucide-react";
import { useJournal } from "@/lib/journal-context";
import {
  getActivitiesForRecommendation,
  wellnessActivities,
} from "@/lib/wellness-activities";
import { ActivityCard } from "@/components/wellness/activity-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const RECOMMENDATION_TYPES = [
  "Yoga",
  "Mudras",
  "Breathing exercises",
  "Mindfulness practices",
  "Quick games for mood uplift",
  "Motivation / positivity prompts",
];

export default function WellnessPage() {
  const { entries, completedActivities } = useJournal();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "all"
  );

  // ✨ AI recommended wellness activities harvested from journal entries
  const aiRecommendedWellnessActivities = useMemo(() => {
    const recommendedSet = new Set();
    entries.forEach((entry) => {
      if (entry.recommendedActivities?.wellness) {
        entry.recommendedActivities.wellness.forEach((activity) => {
          recommendedSet.add(activity);
        });
      }
    });
    console.log(
      "🎯 AI Recommended Wellness Categories:",
      Array.from(recommendedSet)
    );
    return Array.from(recommendedSet);
  }, [entries]);

  // Deterministic picker to select a specific activity for a given entry and category
  const pickActivityForEntry = (categoryName, entryId) => {
    const categoryActivities = wellnessActivities[categoryName];
    if (!categoryActivities || categoryActivities.length === 0) return null;

    const hashString = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // Convert to 32bit integer
      }
      return Math.abs(hash);
    };

    const seed = hashString(String(entryId || "temp"));
    const index = seed % categoryActivities.length;
    return categoryActivities[index];
  };

  // Get all activities based on selected category
  const displayedActivities = useMemo(() => {
    let activities = [];

    if (selectedCategory === "all") {
      // First surface AI recommended wellness categories from entries
      aiRecommendedWellnessActivities.forEach((rec) => {
        const recActivities = getActivitiesForRecommendation(rec);
        activities.push(
          ...recActivities.map((a) => ({ ...a, recommendation: rec }))
        );
      });

      // If no recommendations, show all activities
      if (activities.length === 0) {
        Object.entries(wellnessActivities).forEach(([category, acts]) => {
          activities.push(
            ...acts.map((a) => ({ ...a, recommendation: category }))
          );
        });
      }
    } else if (selectedCategory === "recommended") {
      // ✨ For each entry, pick exactly one activity per AI-recommended category
      const seen = new Set();
      entries.forEach((entry) => {
        const categories = entry.recommendedActivities?.wellness || [];
        categories.forEach((categoryName) => {
          const picked = pickActivityForEntry(categoryName, entry.id);
          if (picked) {
            const key = `${categoryName}-${picked.id || picked.name}`;
            if (seen.has(key)) return;
            seen.add(key);
            activities.push({
              ...picked,
              recommendation: categoryName,
              entryId: entry.id,
            });
          }
        });
      });
    } else {
      // Show activities from specific category
      const recActivities = getActivitiesForRecommendation(selectedCategory);
      activities = recActivities.map((a) => ({
        ...a,
        recommendation: selectedCategory,
      }));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      activities = activities.filter(
        (activity) =>
          activity.name.toLowerCase().includes(query) ||
          activity.benefits.some((b) => b.toLowerCase().includes(query)) ||
          activity.category.toLowerCase().includes(query)
      );
    }

    return activities;
  }, [selectedCategory, entries, aiRecommendedWellnessActivities, searchQuery]);

  const completedActivityIds = new Set(
    completedActivities.map((a) => a.activityId)
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Wellness Activities</h1>
        </div>
        <p className="text-muted-foreground">
          Explore activities recommended by AI based on your journal entries
        </p>
      </div>

      {/* Recommendations Summary */}
      {aiRecommendedWellnessActivities.length > 0 && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg">
          <p className="text-sm font-medium mb-2 text-emerald-900 dark:text-emerald-100">
            🎯 Based on your journal entries, AI recommends these wellness
            activities:
          </p>
          <div className="flex flex-wrap gap-2">
            {aiRecommendedWellnessActivities.map((activity) => (
              <Badge
                key={activity}
                variant="secondary"
                className="bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100"
              >
                {activity}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 space-y-3">
        <div className="flex flex-wrap gap-2">
          {[
            { value: "all", label: "All" },
            { value: "recommended", label: "AI Recommended" },
            ...RECOMMENDATION_TYPES.map((type) => ({
              value: type,
              label: type,
            })),
          ].map((item) => (
            <Button
              key={item.value}
              size="sm"
              variant={selectedCategory === item.value ? "default" : "outline"}
              className="rounded-full"
              onClick={() => {
                setSelectedCategory(item.value);
                setSearchParams({ category: item.value });
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      {/* Activities Grid */}
      {displayedActivities.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedActivities.map((activity) => (
            <div
              key={`${activity.id}-${activity.recommendation}`}
              className="relative"
            >
              {completedActivityIds.has(activity.id) && (
                <div className="absolute top-2 right-2 z-10">
                  <Badge className="bg-green-500">
                    <Heart className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                </div>
              )}
              <ActivityCard
                activity={activity}
                recommendation={activity.recommendation}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">No activities found</p>
          <p className="text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search"
              : "Create a journal entry to get AI recommendations"}
          </p>
        </div>
      )}

      {/* Stats */}
      {completedActivities.length > 0 && (
        <div className="mt-8 p-4 bg-accent/5 rounded-lg">
          <p className="text-sm font-medium mb-1">
            🎉 You've completed {completedActivities.length} wellness
            {completedActivities.length === 1 ? " activity" : " activities"}!
          </p>
          <p className="text-xs text-muted-foreground">
            Keep up the great work on your wellness journey
          </p>
        </div>
      )}
    </div>
  );
}
