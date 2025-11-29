import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ============ Types ============

export type TemplateCategory = 'push' | 'pull' | 'legs' | 'core' | 'full_body';
export type TemplateDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface WorkoutTemplateExercise {
  id: string;
  exerciseId: string;
  orderIndex: number;
  defaultSets: number | null;
  defaultReps: number | null;
  defaultRestSeconds: number | null;
  notes: string | null;
  exercise: {
    id: string;
    name: string;
    slug: string;
    category: string;
    difficulty: string;
  };
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string | null;
  difficulty: TemplateDifficulty | null;
  category: TemplateCategory | null;
  createdAt: string;
  isPublic: boolean;
  isOwner: boolean;
  exercises: WorkoutTemplateExercise[];
}

export interface WorkoutTemplateListItem {
  id: string;
  name: string;
  description: string | null;
  difficulty: TemplateDifficulty | null;
  category: TemplateCategory | null;
  createdAt: string;
  isPublic: boolean;
  isOwner: boolean;
  exerciseCount: number;
}

export interface WorkoutTemplateExerciseInput {
  exerciseId: string;
  orderIndex: number;
  defaultSets?: number | null;
  defaultReps?: number | null;
  defaultRestSeconds?: number | null;
  notes?: string | null;
}

export interface CreateWorkoutTemplateInput {
  name: string;
  description?: string | null;
  difficulty?: TemplateDifficulty | null;
  category?: TemplateCategory | null;
  exercises?: WorkoutTemplateExerciseInput[];
}

export interface UpdateWorkoutTemplateInput extends CreateWorkoutTemplateInput {
  id: string;
}

export interface StartWorkoutResult {
  id: number;
  userId: string;
  name: string;
  date: string;
  duration: number | null;
  totalVolume: number;
  notes: string | null;
  exercises: Array<{
    id: number;
    workoutId: number;
    name: string;
    sets: Array<{ reps: number; weight?: number; rpe: number }>;
    order: number;
  }>;
}

// ============ Query Keys ============

export const workoutTemplateKeys = {
  all: ["workout-templates"] as const,
  lists: () => [...workoutTemplateKeys.all, "list"] as const,
  list: (filters: { difficulty?: string; category?: string }) =>
    [...workoutTemplateKeys.lists(), filters] as const,
  details: () => [...workoutTemplateKeys.all, "detail"] as const,
  detail: (id: string) => [...workoutTemplateKeys.details(), id] as const,
};

// ============ Fetch Functions ============

async function fetchWorkoutTemplates(params?: {
  difficulty?: string;
  category?: string;
}): Promise<WorkoutTemplateListItem[]> {
  const searchParams = new URLSearchParams();
  if (params?.difficulty) searchParams.append("difficulty", params.difficulty);
  if (params?.category) searchParams.append("category", params.category);

  const url = `/api/workout-templates${searchParams.toString() ? `?${searchParams}` : ""}`;
  const res = await fetch(url, { credentials: "include" });

  if (!res.ok) {
    throw new Error("Failed to fetch workout templates");
  }

  return res.json();
}

async function fetchWorkoutTemplate(id: string): Promise<WorkoutTemplate> {
  const res = await fetch(`/api/workout-templates/${id}`, {
    credentials: "include",
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error("Workout template not found");
    }
    throw new Error("Failed to fetch workout template");
  }

  return res.json();
}

async function createWorkoutTemplate(
  input: CreateWorkoutTemplateInput
): Promise<{ id: string }> {
  const res = await fetch("/api/workout-templates", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to create workout template");
  }

  return res.json();
}

async function updateWorkoutTemplate(
  input: UpdateWorkoutTemplateInput
): Promise<WorkoutTemplateListItem> {
  const { id, ...data } = input;
  const res = await fetch(`/api/workout-templates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to update workout template");
  }

  return res.json();
}

async function deleteWorkoutTemplate(id: string): Promise<void> {
  const res = await fetch(`/api/workout-templates/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete workout template");
  }
}

async function duplicateWorkoutTemplate(id: string): Promise<WorkoutTemplateListItem> {
  const res = await fetch(`/api/workout-templates/${id}/duplicate`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to duplicate workout template");
  }

  return res.json();
}

async function startWorkoutFromTemplate(
  templateId: string
): Promise<StartWorkoutResult> {
  const res = await fetch(`/api/workout-templates/${templateId}/start`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Failed to start workout from template");
  }

  return res.json();
}

// ============ Hooks ============

export function useWorkoutTemplates(params?: {
  difficulty?: string;
  category?: string;
}) {
  return useQuery({
    queryKey: workoutTemplateKeys.list(params || {}),
    queryFn: () => fetchWorkoutTemplates(params),
  });
}

export function useWorkoutTemplate(id: string) {
  return useQuery({
    queryKey: workoutTemplateKeys.detail(id),
    queryFn: () => fetchWorkoutTemplate(id),
    enabled: !!id,
  });
}

export function useCreateWorkoutTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkoutTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutTemplateKeys.lists() });
    },
  });
}

export function useUpdateWorkoutTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateWorkoutTemplate,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: workoutTemplateKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: workoutTemplateKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteWorkoutTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkoutTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutTemplateKeys.lists() });
    },
  });
}

export function useDuplicateWorkoutTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: duplicateWorkoutTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: workoutTemplateKeys.lists() });
    },
  });
}

export function useStartWorkoutFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startWorkoutFromTemplate,
    onSuccess: () => {
      // Invalidate workouts list since we created a new workout
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });
}

// ============ Helper: Save Workout as Template ============

export interface SaveWorkoutAsTemplateInput {
  workoutName: string;
  description?: string;
  difficulty?: TemplateDifficulty;
  category?: TemplateCategory;
  exercises: Array<{
    exerciseId: string;
    sets: number;
    reps: number;
    restSeconds?: number;
    notes?: string;
  }>;
}

/**
 * Helper function to build a template payload from workout data
 * Use with useCreateWorkoutTemplate().mutate() to save
 */
export function buildTemplateFromWorkout(
  input: SaveWorkoutAsTemplateInput
): CreateWorkoutTemplateInput {
  return {
    name: input.workoutName,
    description: input.description || null,
    difficulty: input.difficulty || null,
    category: input.category || null,
    exercises: input.exercises.map((ex, index) => ({
      exerciseId: ex.exerciseId,
      orderIndex: index + 1,
      defaultSets: ex.sets,
      defaultReps: ex.reps,
      defaultRestSeconds: ex.restSeconds || 60,
      notes: ex.notes || null,
    })),
  };
}

/**
 * Hook to save a workout as a template
 * Returns a mutation that accepts SaveWorkoutAsTemplateInput
 */
export function useSaveWorkoutAsTemplate() {
  const createTemplate = useCreateWorkoutTemplate();

  return {
    ...createTemplate,
    mutate: (input: SaveWorkoutAsTemplateInput) => {
      const payload = buildTemplateFromWorkout(input);
      createTemplate.mutate(payload);
    },
    mutateAsync: async (input: SaveWorkoutAsTemplateInput) => {
      const payload = buildTemplateFromWorkout(input);
      return createTemplate.mutateAsync(payload);
    },
  };
}

// ============ Category/Difficulty Helpers ============

export const TEMPLATE_CATEGORIES: { value: TemplateCategory; label: string }[] = [
  { value: 'push', label: 'Push' },
  { value: 'pull', label: 'Pull' },
  { value: 'legs', label: 'Legs' },
  { value: 'core', label: 'Core' },
  { value: 'full_body', label: 'Full Body' },
];

export const TEMPLATE_DIFFICULTIES: { value: TemplateDifficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
];

export function getCategoryLabel(category: string | null): string {
  if (!category) return 'General';
  const found = TEMPLATE_CATEGORIES.find(c => c.value === category);
  return found?.label || category;
}

export function getDifficultyLabel(difficulty: string | null): string {
  if (!difficulty) return 'Any Level';
  const found = TEMPLATE_DIFFICULTIES.find(d => d.value === difficulty);
  return found?.label || difficulty;
}
