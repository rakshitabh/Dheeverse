import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import {
  MoreHorizontal,
  Archive,
  Trash2,
  Edit,
  Type,
  Mic,
  Palette,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useJournal } from "@/lib/journal-context";
import { wellnessActivities } from "@/lib/wellness-activities";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

/* ✅ Support BOTH numeric + AI string moods */
const moodEmoji = {
  1: "😢",
  2: "😔",
  3: "😐",
  4: "🙂",
  5: "😊",

  Happy: "😊",
  Calm: "😌",
  Neutral: "😐",
  Sad: "😢",
  Stressed: "😣",
  Angry: "😠",
  Anxious: "😟",
  Tired: "😴",
  Confused: "😕",
  Overwhelmed: "😵‍💫",
};

const typeIcons = {
  text: <Type className="h-3 w-3" />,
  voice: <Mic className="h-3 w-3" />,
  doodle: <Palette className="h-3 w-3" />,
};

export function EntryCard({ entry, onEdit }) {
  const { deleteEntry, archiveEntry } = useJournal();
  const entryType = entry.entryType || "text";

  // Deterministic picker to select a specific activity for a given entry and category
  const pickActivityForEntry = (categoryName, entryId) => {
    const categoryActivities = wellnessActivities[categoryName];
    if (!categoryActivities || categoryActivities.length === 0) return null;

    const hashString = (str) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0; // force 32-bit int
      }
      return Math.abs(hash);
    };

    const seed = hashString(String(entryId || "temp"));
    const index = seed % categoryActivities.length;
    return categoryActivities[index];
  };

  const handleArchive = async () => {
    try {
      await archiveEntry(entry.id);
      toast.success("Entry archived", {
        description: "Your entry has been moved to archive.",
      });
    } catch (err) {
      toast.error("Failed to archive entry", {
        description: err.message || "Please try again.",
      });
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this entry? This action cannot be undone."
      )
    ) {
      return;
    }
    try {
      await deleteEntry(entry.id);
      toast.success("Entry deleted", {
        description: "Your entry has been permanently deleted.",
      });
    } catch (err) {
      toast.error("Failed to delete entry", {
        description: err.message || "Please try again.",
      });
    }
  };

  return (
    <Card className="group transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{moodEmoji[entry.mood] || "🙂"}</span>

          <div className="flex flex-col">
            <span className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(entry.createdAt), {
                addSuffix: true,
              })}
            </span>

            <Badge variant="outline" className="w-fit mt-1 gap-1 text-xs">
              {typeIcons[entryType]}
              {entryType}
            </Badge>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            {onEdit && (
              <DropdownMenuItem onClick={() => onEdit(entry)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleArchive}>
              <Archive className="mr-2 h-4 w-4" />
              Archive
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {entry.content}
        </p>

        {/* ✅ Emotion tags (optional) */}
        {entry.emotions?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.emotions.map((emotion) => (
              <Badge
                key={emotion}
                variant="secondary"
                className="text-xs capitalize"
              >
                {emotion}
              </Badge>
            ))}
          </div>
        )}

        {/* ✅ User tags */}
        {entry.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {entry.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* ✅ AI INSIGHT */}
        {entry.aiInsight && (
          <div className="mt-3 p-3 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
            <p className="text-xs font-medium text-primary mb-1">
              💡 AI Reflection
            </p>
            <p className="text-xs text-muted-foreground whitespace-pre-line">
              {entry.aiInsight}
            </p>
            {entry.recommendation && (
              <p className="text-xs text-muted-foreground whitespace-pre-line">
                {entry.recommendation}
              </p>
            )}
            {entry.question && (
              <p className="text-xs text-muted-foreground whitespace-pre-line">
                {entry.question}
              </p>
            )}
          </div>
        )}

        {/* ✅ AI RECOMMENDED WELLNESS ACTIVITIES */}
        {entry.recommendedActivities && (
          <div className="mt-3 p-3 bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg space-y-2">
            <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-2">
              🎯 AI Recommended Activities
            </p>
            <div className="space-y-2">
              {/* Wellness Activities */}
              {entry.recommendedActivities.wellness &&
                entry.recommendedActivities.wellness.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 mb-1">
                      Wellness:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {entry.recommendedActivities.wellness.map(
                        (categoryName) => {
                          const picked = pickActivityForEntry(
                            categoryName,
                            entry.id
                          );
                          const label = picked
                            ? `${categoryName} — ${picked.name}`
                            : categoryName;
                          return (
                            <Link
                              key={`wellness-${categoryName}`}
                              to={`/wellness?category=${encodeURIComponent(
                                categoryName
                              )}`}
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-200 rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-800 transition cursor-pointer"
                            >
                              {label} →
                            </Link>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

              {/* Nature Sounds */}
              {entry.recommendedActivities.natureSounds &&
                entry.recommendedActivities.natureSounds.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 mb-1">
                      Nature Sounds:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {entry.recommendedActivities.natureSounds.map((sound) => (
                        <Link
                          key={`sound-${sound}`}
                          to="/sounds"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition cursor-pointer"
                        >
                          🎵 {sound} →
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              {/* Games */}
              {entry.recommendedActivities.games &&
                entry.recommendedActivities.games.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 mb-1">
                      Games:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {entry.recommendedActivities.games.map((game) => (
                        <Link
                          key={`game-${game}`}
                          to="/games"
                          className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-200 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800 transition cursor-pointer"
                        >
                          🎮 {game} →
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
