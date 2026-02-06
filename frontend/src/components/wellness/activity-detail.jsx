import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useJournal } from "@/lib/journal-context";

export function ActivityDetail({ activity }) {
  const navigate = useNavigate();
  const { addCompletedActivity } = useJournal();
  const [completed, setCompleted] = useState(false);
  const [timer, setTimer] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  if (!activity) {
    return (
      <div className="container mx-auto p-6">
        <p>Activity not found</p>
      </div>
    );
  }

  const handleStart = () => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    setTimer(interval);
  };

  const handleComplete = () => {
    if (timer) {
      clearInterval(timer);
      setTimer(null);
    }
    setCompleted(true);
    addCompletedActivity({
      activityId: activity.id,
      activityName: activity.name,
      category: activity.category,
      duration: timeElapsed,
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate("/wellness")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Wellness
      </Button>

      <Card>
        {activity.image && (
          <div className="w-full h-64 md:h-96 overflow-hidden rounded-t-lg">
            <img
              src={activity.image}
              alt={activity.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-3xl mb-2">{activity.name}</CardTitle>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{activity.category}</Badge>
                <Badge variant="outline">
                  <Clock className="mr-1 h-3 w-3" />
                  {activity.duration}
                </Badge>
                <Badge variant="outline">{activity.difficulty}</Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Benefits */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Benefits</h3>
            <ul className="space-y-2">
              {activity.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* When to Use */}
          {activity.whenToUse && (
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
              <p className="text-sm font-medium text-primary mb-1">
                💡 When to Use
              </p>
              <p className="text-sm text-muted-foreground">
                {activity.whenToUse}
              </p>
            </div>
          )}

          {/* Instructions */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Instructions</h3>
            <ol className="space-y-3">
              {activity.instructions.map((instruction, index) => (
                <li key={index} className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-muted-foreground">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Timer and Actions */}
          <div className="pt-6 border-t">
            {timer && (
              <div className="mb-4 p-4 bg-accent/5 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Time Elapsed
                </p>
                <p className="text-3xl font-bold">{formatTime(timeElapsed)}</p>
              </div>
            )}

            <div className="flex gap-3">
              {!timer && !completed && (
                <Button onClick={handleStart} className="flex-1">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Start Activity
                </Button>
              )}

              {timer && !completed && (
                <Button onClick={handleComplete} className="flex-1">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Complete
                </Button>
              )}

              {completed && (
                <div className="flex-1 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-center">
                  <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-600">
                    Activity Completed!
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Great job taking care of yourself
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



