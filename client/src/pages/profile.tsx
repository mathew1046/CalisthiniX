import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarDays, Settings, Share2, Dumbbell, Clock, Flame, Star, X } from "lucide-react";
import { useMe } from "@/hooks/useMe";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Workout {
  id: number;
  name: string;
  date: string;
  duration: number;
  totalVolume: number;
}

interface WorkoutDetails extends Workout {
  exercises?: Array<{
    name: string;
    sets: Array<{
      reps: number;
      weight?: number;
      rpe: number;
      completed: boolean;
    }>;
  }>;
  notes?: string;
}

export default function Profile() {
  const { user, isLoading, error } = useMe();
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const handleWorkoutClick = async (workoutId: number) => {
    setIsLoadingDetails(true);
    try {
      const res = await apiRequest("GET", `/api/workouts/${workoutId}`);
      const details = await res.json();
      setSelectedWorkout(details);
    } catch (error) {
      console.error("Failed to fetch workout details:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const { data: workouts, isLoading: isLoadingWorkouts } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/workouts?limit=5");
      return res.json();
    }
  });

  // Fetch profile stats
  interface ProfileStats {
    totalWorkouts: number;
    activeTime: string;
    activeMinutes: number;
    currentStreak: number;
    favoriteWorkout: string;
    pr: {
      exercise: string;
      weight: number;
    } | null;
  }

  const { data: profileStats, isLoading: isLoadingStats } = useQuery<ProfileStats>({
    queryKey: ["/api/stats/profile"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/stats/profile");
      return res.json();
    },
    refetchOnMount: "always",
    staleTime: 0,
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
                  <div className="text-xl font-bold text-primary font-mono">{profileStats?.currentStreak || 0}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Streak</div>
                </div>
                <div className="text-center px-4 py-2 bg-card border border-border rounded-lg">
                  <div className="text-xl font-bold text-foreground font-mono">{profileStats?.totalWorkouts || 0}</div>
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

      {/* Monthly Stats Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-heading font-bold uppercase flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-primary" /> {format(new Date(), "MMMM yyyy")}
        </h2>
        
        {isLoadingStats ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {/* Total Workouts */}
            <div className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Total Workouts</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {profileStats?.totalWorkouts || 0}
              </p>
            </div>

            {/* Active Minutes */}
            <div className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Active Minutes</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {profileStats?.activeTime || "0m"}
              </p>
            </div>

            {/* Current Streak */}
            <div className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Current Streak</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {profileStats?.currentStreak || 0} <span className="text-lg font-normal text-muted-foreground">days</span>
              </p>
            </div>

            {/* Favorite Workout */}
            <div className="bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Favorite Workout</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-foreground truncate">
                {profileStats?.favoriteWorkout || "None yet"}
              </p>
            </div>
          </div>
        )}
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
                onClick={() => handleWorkoutClick(workout.id)}
                className="bg-card border border-border p-4 rounded-xl flex items-center gap-4 hover:border-primary/30 transition-colors cursor-pointer"
              >
                <div className="w-12 h-12 rounded bg-secondary flex flex-col items-center justify-center text-center">
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

      {/* Workout Details Dialog */}
      <Dialog open={!!selectedWorkout} onOpenChange={(open) => !open && setSelectedWorkout(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : selectedWorkout && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-heading uppercase flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  {selectedWorkout.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Workout Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-secondary/30 p-3 rounded-lg text-center">
                    <p className="text-xl font-bold text-primary">
                      {Math.floor((selectedWorkout.duration || 0) / 60)}:{String((selectedWorkout.duration || 0) % 60).padStart(2, '0')}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">Duration</p>
                  </div>
                  <div className="bg-secondary/30 p-3 rounded-lg text-center">
                    <p className="text-xl font-bold text-primary">
                      {selectedWorkout.totalVolume || 0} kg
                    </p>
                    <p className="text-xs text-muted-foreground uppercase">Volume</p>
                  </div>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <CalendarDays className="w-4 h-4 inline mr-2" />
                  {format(new Date(selectedWorkout.date), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                </div>

                {/* Exercises */}
                {selectedWorkout.exercises && selectedWorkout.exercises.length > 0 ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                      Exercises ({selectedWorkout.exercises.length})
                    </h3>
                    {selectedWorkout.exercises.map((exercise, idx) => (
                      <div key={idx} className="bg-secondary/30 p-4 rounded-lg border border-border/50">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-foreground">{exercise.name}</h4>
                          <span className="text-xs text-muted-foreground">
                            {exercise.sets?.length || 0} sets
                          </span>
                        </div>
                        
                        {exercise.sets && exercise.sets.length > 0 && (
                          <div className="space-y-1.5">
                            <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground font-medium px-2">
                              <span>Set</span>
                              <span>Reps</span>
                              <span>Weight</span>
                              <span>RPE</span>
                            </div>
                            {exercise.sets.map((set, setIdx) => (
                              <div 
                                key={setIdx}
                                className={cn(
                                  "grid grid-cols-4 gap-2 text-sm px-2 py-1.5 rounded-md",
                                  set.completed 
                                    ? "bg-primary/10 border border-primary/30" 
                                    : "bg-background/50"
                                )}
                              >
                                <span className="text-muted-foreground">{setIdx + 1}</span>
                                <span className="font-medium">{set.reps || 0}</span>
                                <span>{set.weight ? `${set.weight}kg` : "-"}</span>
                                <span className={cn(
                                  "font-medium",
                                  (set.rpe || 0) >= 9 ? "text-red-500" :
                                  (set.rpe || 0) >= 7 ? "text-yellow-500" : "text-green-500"
                                )}>
                                  {set.rpe || "-"}
                                </span>
                              </div>
                            ))}
                            
                            {/* Exercise Summary */}
                            <div className="flex justify-between items-center pt-2 mt-2 border-t border-border/50 text-xs">
                              <span className="text-muted-foreground">
                                Total: {exercise.sets.reduce((acc, s) => acc + (s.reps || 0), 0)} reps
                              </span>
                              <span className="text-primary font-medium">
                                Volume: {exercise.sets.reduce((acc, s) => 
                                  acc + ((s.reps || 0) * (s.weight || 0)), 0
                                )} kg
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No exercises recorded for this workout.</p>
                  </div>
                )}

                {/* Notes */}
                {selectedWorkout.notes && (
                  <div className="bg-secondary/20 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      Notes
                    </h3>
                    <p className="text-sm text-foreground">{selectedWorkout.notes}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
