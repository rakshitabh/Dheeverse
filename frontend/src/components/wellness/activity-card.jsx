import { useNavigate } from "react-router-dom";
import { Clock, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ActivityCard({ activity, recommendation }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/wellness/activity/${activity.id}`, {
      state: { activity, recommendation },
    });
  };

  return (
    <Card className="group hover:shadow-lg transition-all cursor-pointer h-full flex flex-col">
      {activity.image && (
        <div className="w-full h-48 overflow-hidden rounded-t-lg">
          <img
            src={activity.image}
            alt={activity.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <CardHeader className="flex-1">
        <div className="flex items-start justify-between gap-2 mb-2">
          <CardTitle className="text-lg line-clamp-2">{activity.name}</CardTitle>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="mr-1 h-3 w-3" />
            {activity.duration}
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {activity.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {activity.benefits[0]}
        </p>
        <Button onClick={handleClick} className="w-full" variant="outline">
          Start Activity
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}



