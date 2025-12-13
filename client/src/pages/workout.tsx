import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { WorkoutCalendar } from "@/components/workout-calendar";
import { 
  ArrowLeft, 
  Clock, 
  Plus, 
  CheckCircle2, 
  Play, 
  Square, 
  Dumbbell, 
  Trash2, 
  Trophy, 
  Sparkles,
  FileText,
  AlertCircle,
  RotateCcw,
  CalendarDays,
  X
} from "lucide-react";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Link, useLocation, useParams, useRoute } from "wouter";
import { ExercisePicker } from "@/components/exercise-picker";
import { TemplatePreviewDialog } from "@/components/template-preview-dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import {
  useWorkout,
  useWorkouts,
  useCreateWorkout,
  useUpdateWorkout,
  useDeleteWorkout,
  useAddWorkoutExercise,
  useUpdateWorkoutExercise,
  useDeleteWorkoutExercise,
  useStartWorkoutFromTemplate,
  calculateTotalVolume,
  formatDuration,
  type WorkoutSet,
  type WorkoutExercise,
  type Workout,
} from "@/hooks/use-workout";

// ============================================
// MAIN COMPONENT
// ============================================

export default function WorkoutPage() {
  const [, params] = useRoute("/workout/:id");
  const workoutId = params?.id;

  if (workoutId) {
    return <WorkoutSession workoutId={workoutId} />;
  }

  return <WorkoutStartPanel />;
}

// ============================================
// START PANEL (/workout)
// ============================================

function WorkoutStartPanel() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isTemplatePickerOpen, setIsTemplatePickerOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedDayWorkouts, setSelectedDayWorkouts] = useState<any[]>([]);

  const createWorkout = useCreateWorkout();
  const startFromTemplate = useStartWorkoutFromTemplate();

  // Fetch all workouts for calendar
  const { data: allWorkouts, isLoading: workoutsLoading, refetch: refetchWorkouts } = useWorkouts(100);

  // Fetch templates for picker
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["workout-templates"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/workout-templates");
      return res.json();
    },
  });

  // Group workouts by date - only completed workouts for calendar display
  const workoutsByDate = useMemo(() => {
    if (!allWorkouts) return new Map<string, any[]>();
    const map = new Map<string, any[]>();
    // Filter to only show completed workouts on calendar
    const completedWorkouts = allWorkouts.filter(w => w.status === "completed" || w.completedAt);
    completedWorkouts.forEach(w => {
      const dateKey = format(new Date(w.date), 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(w);
    });
    return map;
  }, [allWorkouts]);

  // Completed workouts for calendar component
  const completedWorkouts = useMemo(() => {
    if (!allWorkouts) return [];
    return allWorkouts.filter(w => w.status === "completed" || w.completedAt);
  }, [allWorkouts]);

  // Handle date selection
  const handleDateSelect = async (date: Date) => {
    setSelectedDate(date);
    const dateKey = format(date, 'yyyy-MM-dd');
    const dayWorkouts = workoutsByDate.get(dateKey) || [];
    
    if (dayWorkouts.length > 0) {
      // Fetch full workout details with exercises
      const fullWorkouts = await Promise.all(
        dayWorkouts.map(async (workout) => {
          try {
            const res = await apiRequest("GET", `/api/workouts/${workout.id}`);
            return await res.json();
          } catch (error) {
            return workout;
          }
        })
      );
      setSelectedDayWorkouts(fullWorkouts);
    } else {
      setSelectedDayWorkouts([]);
    }
  };

  const handleStartEmpty = () => {
    createWorkout.mutate(
      { name: "Untitled Workout" },
      {
        onSuccess: (workout) => {
          setLocation(`/workout/${workout.id}`);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleStartFromTemplate = () => {
    if (!selectedTemplateId) return;
    
    startFromTemplate.mutate(
      { templateId: selectedTemplateId },
      {
        onSuccess: (workout) => {
          setIsPreviewOpen(false);
          setLocation(`/workout/${workout.id}`);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setIsTemplatePickerOpen(false);
    setIsPreviewOpen(true);
  };

  const handleQuickStart = (templateId: string) => {
    startFromTemplate.mutate(
      { templateId },
      {
        onSuccess: (workout) => {
          setLocation(`/workout/${workout.id}`);
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-4 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold uppercase tracking-tight">
            Start Workout
          </h1>
          <p className="text-sm text-muted-foreground">
            Begin a new training session
          </p>
        </div>
      </div>

      {/* Main Actions */}
      <div className="grid gap-4 mb-8">
        {/* Empty Workout Card */}
        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors group"
          onClick={handleStartEmpty}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Plus className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-bold text-lg uppercase">Start Empty Workout</h3>
              <p className="text-sm text-muted-foreground">
                Create a blank workout and add exercises as you go
              </p>
            </div>
            {createWorkout.isPending && (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
            )}
          </CardContent>
        </Card>

        {/* From Template Card */}
        <Card 
          className="cursor-pointer hover:border-primary/50 transition-colors group"
          onClick={() => setIsTemplatePickerOpen(true)}
        >
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center group-hover:bg-secondary/80 transition-colors">
              <FileText className="w-7 h-7 text-foreground" />
            </div>
            <div className="flex-1">
              <h3 className="font-heading font-bold text-lg uppercase">Start from Template</h3>
              <p className="text-sm text-muted-foreground">
                Use a pre-built workout template
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Templates */}
      {templates && templates.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-heading font-bold uppercase mb-4">Quick Start</h2>
          <div className="grid gap-3">
            {templates.slice(0, 4).map((template: any) => (
              <Card 
                key={template.id}
                className="cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => handleQuickStart(template.id)}
              >
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{template.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {template.difficulty && (
                        <Badge variant="outline" className="text-xs capitalize">
                          {template.difficulty}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {template.exerciseCount || 0} exercises
                      </span>
                    </div>
                  </div>
                  <Play className="w-5 h-5 text-primary" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Workout History Calendar Section */}
      <div className="border-t border-border pt-8">
        <h2 className="text-xl sm:text-2xl font-heading font-bold uppercase flex items-center gap-2 mb-6">
          <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-primary" /> Workout History
        </h2>
        
        <div className="space-y-6">
          {/* Calendar */}
          <Card className="bg-card border-border">
            <CardContent className="p-4 sm:p-6 md:p-8">
              {workoutsLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-48 mx-auto" />
                  <Skeleton className="h-64 w-full" />
                </div>
              ) : (
                <WorkoutCalendar
                  workouts={completedWorkouts}
                  selectedDate={selectedDate}
                  onDateSelect={handleDateSelect}
                />
              )}
            </CardContent>
          </Card>

          {/* Selected Day Details */}
          {selectedDate && (
            <Card className="bg-card border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg sm:text-xl font-heading uppercase flex items-center gap-2">
                  <Dumbbell className="w-5 h-5 text-primary" />
                  {format(selectedDate, "EEEE, MMMM d, yyyy")}
                </CardTitle>
                {selectedDayWorkouts.length > 1 && (
                  <p className="text-sm text-primary font-semibold mt-1">
                    🔥 {selectedDayWorkouts.length} workouts on this day!
                  </p>
                )}
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {selectedDayWorkouts.length > 0 ? (
                  <div className="space-y-6">
                    {selectedDayWorkouts.map((workout, workoutIdx) => (
                      <div key={workout.id || workoutIdx} className={cn(
                        "space-y-4",
                        workoutIdx > 0 && "pt-4 border-t border-border"
                      )}>
                        {/* Workout Header */}
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-bold text-foreground text-base">{workout.name}</h4>
                            <p className="text-xs text-muted-foreground mt-1">
                              {workout.durationSeconds 
                                ? `Duration: ${formatDuration(workout.durationSeconds)}`
                                : workout.duration 
                                  ? `Duration: ${Math.floor(workout.duration / 60)}min ${workout.duration % 60}s` 
                                  : "Duration: N/A"}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-semibold text-primary">
                              {workout.totalVolume || 0}
                            </span>
                            <p className="text-xs text-muted-foreground">Total Volume</p>
                          </div>
                        </div>
                        
                        {/* Exercises with detailed sets */}
                        {workout.exercises && workout.exercises.length > 0 ? (
                          <div className="space-y-3">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                              Exercises ({workout.exercises.length})
                            </p>
                            {workout.exercises.map((ex: any, idx: number) => (
                              <div key={idx} className="bg-secondary/30 p-3 rounded-lg border border-border/50">
                                <div className="flex items-center justify-between mb-2">
                                  <p className="font-semibold text-sm text-foreground">{ex.name}</p>
                                  <span className="text-xs text-muted-foreground">
                                    {Array.isArray(ex.sets) ? ex.sets.length : 0} sets
                                  </span>
                                </div>
                                
                                {/* Detailed set info */}
                                {Array.isArray(ex.sets) && ex.sets.length > 0 && (
                                  <div className="space-y-1.5">
                                    <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground font-medium px-2">
                                      <span>Set</span>
                                      <span>Reps</span>
                                      <span>Weight</span>
                                      <span>RPE</span>
                                    </div>
                                    {ex.sets.map((set: any, setIdx: number) => (
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
                                          set.rpe >= 9 ? "text-red-500" :
                                          set.rpe >= 7 ? "text-yellow-500" : "text-green-500"
                                        )}>
                                          {set.rpe || "-"}
                                        </span>
                                      </div>
                                    ))}
                                    
                                    {/* Exercise Summary */}
                                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-border/50 text-xs">
                                      <span className="text-muted-foreground">
                                        Total: {ex.sets.reduce((acc: number, s: any) => acc + (s.reps || 0), 0)} reps
                                      </span>
                                      <span className="text-primary font-medium">
                                        Volume: {ex.sets.reduce((acc: number, s: any) => 
                                          acc + ((s.reps || 0) * (s.weight || 0)), 0
                                        )}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground italic">No exercises recorded</p>
                        )}

                        {workout.notes && (
                          <div className="bg-secondary/20 p-3 rounded-lg">
                            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-semibold">Notes</p>
                            <p className="text-sm">{workout.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <X className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                    <p className="text-muted-foreground text-sm">No workout recorded on this day</p>
                    <p className="text-xs text-muted-foreground mt-1">Start a new workout to log your progress!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Template Picker Modal */}
      {isTemplatePickerOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-x-4 top-[50%] translate-y-[-50%] z-50 max-w-lg mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Choose a Template</CardTitle>
                <CardDescription>Select a workout template to start</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[60vh] overflow-y-auto">
                {templatesLoading ? (
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : templates && templates.length > 0 ? (
                  <div className="space-y-2">
                    {templates.map((template: any) => (
                      <div
                        key={template.id}
                        className="p-4 rounded-lg border hover:border-primary/50 cursor-pointer transition-colors"
                        onClick={() => handleTemplateSelect(template.id)}
                      >
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {template.description || `${template.exerciseCount || 0} exercises`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No templates found. Create one first!
                  </p>
                )}
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => setIsTemplatePickerOpen(false)}
                >
                  Cancel
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Template Preview Dialog */}
      <TemplatePreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        templateId={selectedTemplateId}
        onStart={handleStartFromTemplate}
        isStarting={startFromTemplate.isPending}
      />
    </div>
  );
}

// ============================================
// WORKOUT SESSION (/workout/:id)
// ============================================

function WorkoutSession({ workoutId }: { workoutId: string }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch workout data
  const { data: workout, isLoading, error, refetch } = useWorkout(workoutId);

  // Local state
  const [workoutName, setWorkoutName] = useState("");
  const [localExercises, setLocalExercises] = useState<WorkoutExercise[]>([]);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const [completedStats, setCompletedStats] = useState<{ name: string; duration: number; volume: number } | null>(null);
  
  // Countdown state
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showCountdown, setShowCountdown] = useState(true);
  
  // Cancel confirmation
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Mutations
  const updateWorkout = useUpdateWorkout();
  const deleteWorkout = useDeleteWorkout();
  const addExercise = useAddWorkoutExercise();
  const updateExercise = useUpdateWorkoutExercise();
  const deleteExercise = useDeleteWorkoutExercise();

  // Initialize from fetched workout
  useEffect(() => {
    if (workout) {
      setWorkoutName(workout.name);
      setLocalExercises(workout.exercises || []);
      
      // Calculate elapsed time from startedAt
      if (workout.startedAt) {
        const startTime = new Date(workout.startedAt);
        startTimeRef.current = startTime;
        const elapsed = Math.floor((Date.now() - startTime.getTime()) / 1000);
        // Only show countdown for new workouts (less than 15 seconds elapsed)
        if (elapsed < 15) {
          setShowCountdown(true);
          setCountdown(10);
        } else {
          // Workout was already in progress, skip countdown
          setShowCountdown(false);
          setTimer(elapsed);
          setIsRunning(true);
        }
      }
    }
  }, [workout]);

  // Countdown logic
  useEffect(() => {
    if (countdown !== null && countdown > 0) {
      countdownRef.current = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Countdown finished, start the workout
      setShowCountdown(false);
      setIsRunning(true);
    }
    
    return () => {
      if (countdownRef.current) clearTimeout(countdownRef.current);
    };
  }, [countdown]);

  // Skip countdown and start immediately
  const skipCountdown = () => {
    if (countdownRef.current) clearTimeout(countdownRef.current);
    setCountdown(null);
    setShowCountdown(false);
    setIsRunning(true);
  };

  // Timer logic
  useEffect(() => {
    if (isRunning && !showCountdown) {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, showCountdown]);

  // Toggle timer
  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  // Cancel workout (delete without saving)
  const handleCancelWorkout = () => {
    deleteWorkout.mutate(parseInt(workoutId), {
      onSuccess: () => {
        toast({
          title: "Workout cancelled",
          description: "Your workout was discarded.",
        });
        setLocation("/workout");
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  // Add exercise from picker
  const handleAddExercise = (exercise: any) => {
    const newExercise: Partial<WorkoutExercise> = {
      name: exercise.name,
      sets: [{ reps: 10, weight: 0, rpe: 7, completed: false }],
      order: localExercises.length,
    };

    addExercise.mutate(
      {
        workoutId: parseInt(workoutId),
        name: exercise.name,
        sets: newExercise.sets!,
        order: newExercise.order,
      },
      {
        onSuccess: (newEx) => {
          setLocalExercises((prev) => [...prev, newEx]);
        },
        onError: (error) => {
          toast({
            title: "Error adding exercise",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  // Add set to exercise
  const handleAddSet = (exerciseIndex: number) => {
    const exercise = localExercises[exerciseIndex];
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: WorkoutSet = {
      reps: lastSet?.reps || 10,
      weight: lastSet?.weight || 0,
      rpe: lastSet?.rpe || 7,
      completed: false,
    };

    const updatedSets = [...exercise.sets, newSet];
    
    // Update local state immediately
    setLocalExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIndex] = { ...exercise, sets: updatedSets };
      return updated;
    });

    // Persist to server
    updateExercise.mutate({
      workoutId: parseInt(workoutId),
      exerciseId: exercise.id,
      sets: updatedSets,
    });
  };

  // Update set value
  const handleUpdateSet = (exerciseIndex: number, setIndex: number, field: keyof WorkoutSet, value: any) => {
    const exercise = localExercises[exerciseIndex];
    const updatedSets = [...exercise.sets];
    updatedSets[setIndex] = { ...updatedSets[setIndex], [field]: value };

    // Update local state immediately
    setLocalExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIndex] = { ...exercise, sets: updatedSets };
      return updated;
    });

    // Debounce server update (will be handled by the blur/complete action)
  };

  // Persist set changes on blur or completion toggle
  const persistSetChanges = useCallback((exerciseIndex: number) => {
    const exercise = localExercises[exerciseIndex];
    updateExercise.mutate({
      workoutId: parseInt(workoutId),
      exerciseId: exercise.id,
      sets: exercise.sets,
    });
  }, [localExercises, workoutId, updateExercise]);

  // Toggle set completion
  const handleToggleSetComplete = (exerciseIndex: number, setIndex: number) => {
    const exercise = localExercises[exerciseIndex];
    const updatedSets = [...exercise.sets];
    updatedSets[setIndex] = {
      ...updatedSets[setIndex],
      completed: !updatedSets[setIndex].completed,
    };

    // Update local state
    setLocalExercises((prev) => {
      const updated = [...prev];
      updated[exerciseIndex] = { ...exercise, sets: updatedSets };
      return updated;
    });

    // Persist to server
    updateExercise.mutate({
      workoutId: parseInt(workoutId),
      exerciseId: exercise.id,
      sets: updatedSets,
    });
  };

  // Delete exercise
  const handleDeleteExercise = (exerciseIndex: number) => {
    const exercise = localExercises[exerciseIndex];
    
    deleteExercise.mutate(
      {
        workoutId: parseInt(workoutId),
        exerciseId: exercise.id,
      },
      {
        onSuccess: () => {
          setLocalExercises((prev) => prev.filter((_, i) => i !== exerciseIndex));
        },
      }
    );
  };

  // Finish workout
  const handleFinish = () => {
    setIsRunning(false);
    
    const totalVolume = calculateTotalVolume(localExercises);
    
    updateWorkout.mutate(
      {
        id: parseInt(workoutId),
        name: workoutName,
        durationSeconds: timer,
        totalVolume,
        completedAt: new Date().toISOString(),
        status: "completed",
      },
      {
        onSuccess: () => {
          setCompletedStats({
            name: workoutName,
            duration: timer,
            volume: totalVolume,
          });
          setShowCompletionBanner(true);
        },
        onError: (error) => {
          toast({
            title: "Error finishing workout",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  // Handle completion banner dismiss
  const handleContinue = () => {
    setShowCompletionBanner(false);
    queryClient.invalidateQueries({ queryKey: ["workouts"] });
    setLocation("/");
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading workout...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-4">
        <Card className="border-destructive">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Error Loading Workout</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => refetch()}>
                <RotateCcw className="w-4 h-4 mr-2" /> Retry
              </Button>
              <Link href="/workout">
                <Button>Back to Start</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Countdown overlay
  if (showCountdown && countdown !== null) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-heading font-bold uppercase text-muted-foreground mb-4">
            Get Ready!
          </h2>
          <div className="relative">
            <div className="w-40 h-40 sm:w-52 sm:h-52 mx-auto rounded-full border-4 border-primary/30 flex items-center justify-center">
              <span className="text-7xl sm:text-9xl font-heading font-bold text-primary animate-pulse">
                {countdown}
              </span>
            </div>
            {/* Progress ring */}
            <svg className="absolute inset-0 w-40 h-40 sm:w-52 sm:h-52 -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-primary"
                strokeDasharray={`${(countdown / 10) * 289} 289`}
                strokeLinecap="round"
              />
            </svg>
          </div>
          <p className="text-lg text-muted-foreground mt-6 mb-4">{workoutName}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setShowCancelDialog(true)}>
              <X className="w-4 h-4 mr-2" /> Cancel
            </Button>
            <Button onClick={skipCountdown}>
              <Play className="w-4 h-4 mr-2 fill-current" /> Start Now
            </Button>
          </div>
        </div>

        {/* Cancel Dialog during countdown */}
        {showCancelDialog && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <Card className="w-full max-w-sm">
              <CardHeader>
                <CardTitle>Cancel Workout?</CardTitle>
                <CardDescription>
                  This workout will not be saved.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCancelDialog(false)}
                >
                  Keep Going
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={handleCancelWorkout}
                  disabled={deleteWorkout.isPending}
                >
                  {deleteWorkout.isPending ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                  ) : (
                    "Discard"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-20 p-4">
      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-sm animate-in zoom-in-95 duration-200">
            <CardHeader>
              <CardTitle className="text-destructive">Cancel Workout?</CardTitle>
              <CardDescription>
                Are you sure you want to cancel? This workout will not be saved.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelDialog(false)}
              >
                Keep Going
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancelWorkout}
                disabled={deleteWorkout.isPending}
              >
                {deleteWorkout.isPending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                ) : (
                  "Discard Workout"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Completion Banner */}
      {showCompletionBanner && completedStats && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md border-primary/50 shadow-2xl shadow-primary/20 animate-in zoom-in-95 duration-300">
            <CardContent className="pt-8 pb-6 text-center">
              <div className="relative mb-6">
                <div className="w-20 h-20 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
                <Sparkles className="w-6 h-6 text-yellow-500 absolute top-0 right-1/4 animate-pulse" />
                <Sparkles className="w-4 h-4 text-yellow-500 absolute bottom-2 left-1/4 animate-pulse delay-150" />
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-heading font-bold uppercase mb-2">
                Workout Complete!
              </h2>
              <p className="text-muted-foreground mb-6">
                Great job crushing <span className="text-primary font-semibold">{completedStats.name}</span>!
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-primary">
                    {formatDuration(completedStats.duration)}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Duration</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-4">
                  <p className="text-2xl font-bold text-primary">
                    {completedStats.volume.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Volume</p>
                </div>
              </div>
              
              <Button onClick={handleContinue} className="w-full" size="lg">
                <CheckCircle2 className="w-5 h-5 mr-2" />
                Continue
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background/60 backdrop-blur-md py-4 -mx-4 px-4 z-40 border-b border-border mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={() => setShowCancelDialog(true)}
          >
            <X className="w-5 h-5" />
          </Button>
          <div>
            <Input
              value={workoutName}
              onChange={(e) => setWorkoutName(e.target.value)}
              onBlur={() => {
                if (workoutName !== workout?.name) {
                  updateWorkout.mutate({
                    id: parseInt(workoutId),
                    name: workoutName,
                  });
                }
              }}
              className="text-xl sm:text-2xl font-heading font-bold uppercase bg-transparent border-none h-auto p-0 focus-visible:ring-0 w-full"
            />
            <div className={cn(
              "flex items-center gap-2 text-xs font-mono transition-colors",
              isRunning ? "text-green-500" : "text-muted-foreground"
            )}>
              <Clock className="w-3 h-3" />
              <span>{formatDuration(timer)}</span>
              {isRunning && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant={isRunning ? "destructive" : "default"}
            onClick={toggleTimer}
            className="rounded-full"
          >
            {isRunning ? (
              <Square className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current" />
            )}
          </Button>
          <Button
            onClick={handleFinish}
            disabled={updateWorkout.isPending}
            className="bg-primary text-primary-foreground font-bold font-heading uppercase"
          >
            {updateWorkout.isPending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
            ) : (
              "Finish"
            )}
          </Button>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-4">
        {localExercises.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-xl">
            <Dumbbell className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">No exercises added yet</p>
            <Button onClick={() => setIsPickerOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Exercise
            </Button>
          </div>
        )}

        {localExercises.map((exercise, exerciseIndex) => (
          <Card key={exercise.id} className="overflow-hidden">
            <CardHeader className="bg-secondary/30 py-3 px-4 flex-row justify-between items-center space-y-0">
              <h3 className="font-heading font-bold text-lg uppercase">{exercise.name}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => handleDeleteExercise(exerciseIndex)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </CardHeader>
            
            <CardContent className="p-4">
              {/* Set Headers */}
              <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-bold uppercase tracking-wider text-center mb-3">
                <div className="col-span-1">Set</div>
                <div className="col-span-3">Weight</div>
                <div className="col-span-3">Reps</div>
                <div className="col-span-3">RPE</div>
                <div className="col-span-2">Done</div>
              </div>

              {/* Sets */}
              <div className="space-y-2">
                {exercise.sets.map((set, setIndex) => (
                  <div
                    key={setIndex}
                    className={cn(
                      "grid grid-cols-12 gap-2 items-center transition-all",
                      set.completed && "opacity-50"
                    )}
                  >
                    <div className="col-span-1 flex justify-center">
                      <div className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold",
                        set.completed 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary text-muted-foreground"
                      )}>
                        {setIndex + 1}
                      </div>
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={set.weight || 0}
                        onChange={(e) => handleUpdateSet(exerciseIndex, setIndex, "weight", parseFloat(e.target.value) || 0)}
                        onBlur={() => persistSetChanges(exerciseIndex)}
                        className="h-9 text-center font-mono bg-background"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={set.reps || 0}
                        onChange={(e) => handleUpdateSet(exerciseIndex, setIndex, "reps", parseInt(e.target.value) || 0)}
                        onBlur={() => persistSetChanges(exerciseIndex)}
                        className="h-9 text-center font-mono bg-background"
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        value={set.rpe || 0}
                        onChange={(e) => handleUpdateSet(exerciseIndex, setIndex, "rpe", parseFloat(e.target.value) || 0)}
                        onBlur={() => persistSetChanges(exerciseIndex)}
                        className="h-9 text-center font-mono bg-background"
                        min={0}
                        max={10}
                        step={0.5}
                        placeholder="7"
                      />
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <button
                        onClick={() => handleToggleSetComplete(exerciseIndex, setIndex)}
                        className={cn(
                          "w-9 h-9 rounded-lg border-2 flex items-center justify-center transition-all",
                          set.completed
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-transparent border-border hover:border-primary/50 hover:bg-primary/10"
                        )}
                      >
                        <CheckCircle2 className={cn(
                          "w-5 h-5",
                          set.completed ? "fill-current" : "text-muted-foreground"
                        )} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Set Button */}
              <Button
                variant="ghost"
                onClick={() => handleAddSet(exerciseIndex)}
                className="w-full mt-3 text-xs uppercase tracking-wider text-muted-foreground hover:text-primary hover:bg-primary/10 border border-dashed border-border hover:border-primary/50"
              >
                <Plus className="w-3 h-3 mr-2" /> Add Set
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Add Exercise Button */}
        {localExercises.length > 0 && (
          <Button
            variant="outline"
            className="w-full py-8 border-dashed text-muted-foreground hover:text-primary"
            onClick={() => setIsPickerOpen(true)}
          >
            <Plus className="w-5 h-5 mr-2" /> Add Exercise
          </Button>
        )}
      </div>

      {/* Exercise Picker */}
      <ExercisePicker
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={handleAddExercise}
      />
    </div>
  );
}
