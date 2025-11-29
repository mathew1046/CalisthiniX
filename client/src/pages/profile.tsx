import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Camera, Settings, Share2 } from "lucide-react";
import { useMe } from "@/hooks/useMe";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";

interface Workout {
  id: number;
  name: string;
  date: string;
  duration: number;
  totalVolume: number;
}

export default function Profile() {
  const { user, isLoading, error } = useMe();

  const { data: workouts, isLoading: isLoadingWorkouts } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/workouts?limit=5");
      return res.json();
    }
  });

  // Get initials for avatar
  const getInitials = () => {
    if (!user) return "UA";
    if (user.firstName && user.lastName) {
      return (user.firstName[0] + user.lastName[0]).toUpperCase();
    }
    return (user.displayName?.slice(0, 2) || "UA").toUpperCase();
  };

  // Get level name
  const getLevelName = (level: number) => {
    const levels = ["FOUNDATION", "BEGINNER", "INTERMEDIATE", "ADVANCED", "GOD TIER"];
    return levels[level] || "UNKNOWN";
  };

  // Convert weight to lbs if needed (assuming database stores in kg)
  const weightInLbs = user?.weight ? Math.round(user.weight * 2.20462) : 0;

  const formatDuration = (seconds: number) => {
    if (!seconds && seconds !== 0) return "0 min";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    return `${hours}h ${remainingMins}m`;
  };

  if (error) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-20">
        <div className="bg-red-500/10 border border-red-500 text-red-700 p-4 rounded-lg">
          <p>Error loading profile: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* Profile Header */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
        {isLoading ? (
          <>
            <Skeleton className="w-32 h-32 rounded-full" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
              <div className="flex gap-3 pt-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-20" />
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-primary/20 p-1">
              <Avatar className="w-full h-full">
                <AvatarImage src={user?.profileImageUrl} alt={user?.displayName} />
                <AvatarFallback className="bg-muted text-2xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-3xl font-heading font-bold uppercase">
                {user?.displayName || "Athlete"}
              </h1>
              <p className="text-muted-foreground mb-4">
                Calisthenics Enthusiast • Level {user?.currentLevel} {getLevelName(user?.currentLevel || 0)}
              </p>
              <div className="flex gap-3 justify-center md:justify-start">
                <div className="text-center px-4 py-2 bg-card border border-border rounded-lg">
                  <div className="text-xl font-bold text-primary font-mono">{user?.streak || 0}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Streak</div>
                </div>
                <div className="text-center px-4 py-2 bg-card border border-border rounded-lg">
                  <div className="text-xl font-bold text-foreground font-mono">{user?.workoutCount || 0}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Workouts</div>
                </div>
                <div className="text-center px-4 py-2 bg-card border border-border rounded-lg">
                  <div className="text-xl font-bold text-foreground font-mono">{weightInLbs}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Lbs</div>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon">
                <Share2 className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Daily Journal */}
        <div className="space-y-6">
          <h2 className="text-xl font-heading font-bold uppercase flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" /> Daily Journal
          </h2>

          <Card className="bg-card border-border">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Energy Level</span>
                  <span className="text-primary font-bold">High</span>
                </div>
                <Slider
                  defaultValue={[75]}
                  max={100}
                  step={1}
                  className="[&>.relative>.absolute]:bg-primary"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mood</span>
                  <span className="text-primary font-bold">Focused</span>
                </div>
                <Slider
                  defaultValue={[85]}
                  max={100}
                  step={1}
                  className="[&>.relative>.absolute]:bg-primary"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Notes</label>
                <Textarea
                  placeholder="How did you feel today?"
                  className="bg-background border-border min-h-[100px] resize-none focus:border-primary"
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 border-dashed">
                  <Camera className="w-4 h-4 mr-2" /> Add Photo
                </Button>
                <Button className="flex-1 bg-primary text-primary-foreground font-bold uppercase">
                  Save Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent History */}
        <div className="space-y-6">
          <h2 className="text-xl font-heading font-bold uppercase">Recent History</h2>
          {isLoadingWorkouts ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-20 w-full rounded-xl" />
              ))}
            </div>
          ) : workouts && workouts.length > 0 ? (
            <div className="space-y-4">
              {workouts.map((workout) => (
                <div
                  key={workout.id}
                  className="bg-card border border-border p-4 rounded-xl flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer"
                >
                  <div className="w-12 h-12 rounded bg-secondary flex items-col flex-col items-center justify-center text-center">
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {format(new Date(workout.date), "MMM")}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {format(new Date(workout.date), "d")}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground">{workout.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDuration(workout.duration)} • {workout.totalVolume} kg Volume
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground">No workouts yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
