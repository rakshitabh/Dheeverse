import { cn } from '@/lib/utils';

const moods = [
  { score: 1, emoji: '😢', label: 'Very Bad' },
  { score: 2, emoji: '😔', label: 'Bad' },
  { score: 3, emoji: '😐', label: 'Okay' },
  { score: 4, emoji: '🙂', label: 'Good' },
  { score: 5, emoji: '😊', label: 'Great' },
];

export function MoodSelector({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      {moods.map((mood) => (
        <button
          key={mood.score}
          type="button"
          onClick={() => onChange(mood.score)}
          className={cn(
            'flex flex-col items-center gap-1 rounded-xl p-3 transition-all',
            value === mood.score ? 'bg-primary/10 ring-2 ring-primary scale-110' : 'hover:bg-muted'
          )}
        >
          <span className="text-2xl">{mood.emoji}</span>
          <span className="text-xs text-muted-foreground">{mood.label}</span>
        </button>
      ))}
    </div>
  );
}


