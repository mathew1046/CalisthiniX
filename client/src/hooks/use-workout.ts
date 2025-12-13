import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

// Types
export interface WorkoutSet {
  reps: number;
  weight?: number;
  rpe?: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: number;
  workoutId: number;
  name: string;
  sets: WorkoutSet[];
  order: number;
}

export interface Workout {
  id: number;
  userId: string;
  name: string;
  date: string;
  startedAt?: string;
  completedAt?: string;
  duration?: number;
  durationSeconds?: number;
  totalVolume: number;
  status?: "in_progress" | "completed";
  notes?: string;
  createdAt: string;
  exercises?: WorkoutExercise[];
}

// ============================================
// QUERIES
// ============================================

/**
 * Fetch a single workout with its exercises
 */
export function useWorkout(workoutId: string | number | null) {
  return useQuery<Workout>({
    queryKey: ["workout", workoutId],
    queryFn: async () => {
      if (!workoutId) throw new Error("No workout ID");
      const res = await apiRequest("GET", `/api/workouts/${workoutId}`);
      return res.json();
    },
    enabled: !!workoutId,
    refetchOnMount: true,
    staleTime: 0,
  });
}

/**
 * Fetch all workouts for history
 */
export function useWorkouts(limit: number = 100) {
  return useQuery<Workout[]>({
    queryKey: ["workouts", limit],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/workouts?limit=${limit}`);
      return res.json();
    },
    staleTime: 30000,
  });
}

// ============================================
// MUTATIONS
// ============================================

interface CreateWorkoutInput {
  name: string;
  notes?: string;
}

/**
 * Create a new workout
 */
export function useCreateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateWorkoutInput): Promise<Workout> => {
      const res = await apiRequest("POST", "/api/workouts", {
        name: input.name,
        notes: input.notes,
        status: "in_progress",
        // startedAt is set by database DEFAULT NOW()
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts/history"] });
    },
  });
}

interface UpdateWorkoutInput {
  id: number;
  name?: string;
  durationSeconds?: number;
  totalVolume?: number;
  completedAt?: string;
  status?: "in_progress" | "completed";
  notes?: string;
}

/**
 * Update a workout (name, duration, volume, completion)
 */
export function useUpdateWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateWorkoutInput): Promise<Workout> => {
      const { id, ...updates } = input;
      const res = await apiRequest("PATCH", `/api/workouts/${id}`, updates);
      return res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workout", variables.id] });
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/profile"] });
    },
  });
}

/**
 * Delete/cancel a workout
 */
export function useDeleteWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (workoutId: number): Promise<void> => {
      await apiRequest("DELETE", `/api/workouts/${workoutId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/workouts/history"] });
    },
  });
}

interface AddExerciseInput {
  workoutId: number;
  name: string;
  sets: WorkoutSet[];
  order?: number;
}

/**
 * Add an exercise to a workout
 */
export function useAddWorkoutExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddExerciseInput): Promise<WorkoutExercise> => {
      const { workoutId, ...exerciseData } = input;
      const res = await apiRequest("POST", `/api/workouts/${workoutId}/exercises`, {
        ...exerciseData,
        order: exerciseData.order ?? 0,
      });
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workout", variables.workoutId] });
    },
  });
}

interface UpdateExerciseInput {
  workoutId: number;
  exerciseId: number;
  sets?: WorkoutSet[];
  name?: string;
  order?: number;
}

/**
 * Update an exercise's sets
 */
export function useUpdateWorkoutExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateExerciseInput): Promise<WorkoutExercise> => {
      const { workoutId, exerciseId, ...updates } = input;
      const res = await apiRequest("PUT", `/api/workouts/${workoutId}/exercises/${exerciseId}`, updates);
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workout", variables.workoutId] });
    },
  });
}

interface DeleteExerciseInput {
  workoutId: number;
  exerciseId: number;
}

/**
 * Delete an exercise from a workout
 */
export function useDeleteWorkoutExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: DeleteExerciseInput): Promise<void> => {
      await apiRequest("DELETE", `/api/workouts/${input.workoutId}/exercises/${input.exerciseId}`);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["workout", variables.workoutId] });
    },
  });
}

interface StartFromTemplateInput {
  templateId: string;
}

/**
 * Start a workout from a template
 */
export function useStartWorkoutFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: StartFromTemplateInput): Promise<Workout> => {
      const res = await apiRequest("POST", `/api/workout-templates/${input.templateId}/start`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

// ============================================
// HELPERS
// ============================================

/**
 * Calculate total volume from exercises
 * Volume = sum of all (reps * weight) for completed sets
 */
export function calculateTotalVolume(exercises: WorkoutExercise[]): number {
  return exercises.reduce((total, exercise) => {
    const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
      if (set.completed) {
        // Volume = reps * weight (if no weight, count just reps)
        return setTotal + (set.reps * (set.weight || 1));
      }
      return setTotal;
    }, 0);
    return total + exerciseVolume;
  }, 0);
}

/**
 * Calculate total reps from exercises
 */
export function calculateTotalReps(exercises: WorkoutExercise[]): number {
  return exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((setTotal, set) => {
      return setTotal + (set.completed ? set.reps : 0);
    }, 0);
  }, 0);
}

/**
 * Format seconds to mm:ss or hh:mm:ss
 */
export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
