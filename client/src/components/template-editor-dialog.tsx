import { useState, useEffect } from "react";
import {
  useWorkoutTemplate,
  useCreateWorkoutTemplate,
  useUpdateWorkoutTemplate,
  type WorkoutTemplateListItem,
  type WorkoutTemplateExerciseInput,
  TEMPLATE_CATEGORIES,
} from "@/hooks/use-workout-templates";
import { type Exercise } from "@/hooks/use-exercises";
import { ExercisePicker } from "@/components/exercise-picker";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TemplateExerciseItem {
  id: string; // temporary id for UI
  exerciseId: string;
  exerciseName: string;
  exerciseCategory: string;
  defaultSets: number;
  defaultReps: number;
  defaultRestSeconds: number;
  notes: string;
}

interface TemplateEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template?: WorkoutTemplateListItem | null;
}

export function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
}: TemplateEditorDialogProps) {
  const { toast } = useToast();
  const isEditing = !!template;

  // Fetch full template details if editing
  const { data: templateDetails, isLoading: isLoadingDetails } = useWorkoutTemplate(
    template?.id || ""
  );

  const createTemplate = useCreateWorkoutTemplate();
  const updateTemplate = useUpdateWorkoutTemplate();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<string>("none");
  const [category, setCategory] = useState("");
  const [exercises, setExercises] = useState<TemplateExerciseItem[]>([]);

  // Exercise picker state
  const [isPickerOpen, setIsPickerOpen] = useState(false);

  // Reset form when dialog opens/closes or template changes
  useEffect(() => {
    if (open) {
      if (isEditing && templateDetails) {
        setName(templateDetails.name);
        setDescription(templateDetails.description || "");
        setDifficulty(templateDetails.difficulty || "none");
        setCategory(templateDetails.category || "");
        setExercises(
          templateDetails.exercises.map((ex, idx) => ({
            id: `${ex.exerciseId}-${idx}`,
            exerciseId: ex.exerciseId,
            exerciseName: ex.exercise.name,
            exerciseCategory: ex.exercise.category,
            defaultSets: ex.defaultSets || 3,
            defaultReps: ex.defaultReps || 10,
            defaultRestSeconds: ex.defaultRestSeconds || 60,
            notes: ex.notes || "",
          }))
        );
      } else if (!isEditing) {
        // Reset for new template
        setName("");
        setDescription("");
        setDifficulty("none");
        setCategory("");
        setExercises([]);
      }
    }
  }, [open, isEditing, templateDetails]);

  const handleAddExercise = (exercise: Exercise) => {
    const newExercise: TemplateExerciseItem = {
      id: `${exercise.id}-${Date.now()}`,
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      exerciseCategory: exercise.category,
      defaultSets: 3,
      defaultReps: 10,
      defaultRestSeconds: 60,
      notes: "",
    };
    setExercises([...exercises, newExercise]);
  };

  const handleRemoveExercise = (id: string) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  const handleMoveExercise = (index: number, direction: "up" | "down") => {
    const newExercises = [...exercises];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newExercises.length) return;

    [newExercises[index], newExercises[targetIndex]] = [
      newExercises[targetIndex],
      newExercises[index],
    ];

    setExercises(newExercises);
  };

  const handleUpdateExercise = (
    id: string,
    field: keyof TemplateExerciseItem,
    value: string | number
  ) => {
    setExercises(
      exercises.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex))
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast({
        title: "Validation Error",
        description: "Template name is required.",
        variant: "destructive",
      });
      return;
    }

    const exercisesPayload: WorkoutTemplateExerciseInput[] = exercises.map(
      (ex, index) => ({
        exerciseId: ex.exerciseId,
        orderIndex: index + 1,
        defaultSets: ex.defaultSets,
        defaultReps: ex.defaultReps,
        defaultRestSeconds: ex.defaultRestSeconds,
        notes: ex.notes || null,
      })
    );

    try {
      if (isEditing && template) {
        await updateTemplate.mutateAsync({
          id: template.id,
          name,
          description: description || null,
          difficulty: difficulty !== "none" ? difficulty : null,
          category: category || null,
          exercises: exercisesPayload,
        });
        toast({
          title: "Template updated",
          description: "Your workout template has been saved.",
        });
      } else {
        await createTemplate.mutateAsync({
          name,
          description: description || null,
          difficulty: difficulty !== "none" ? difficulty : null,
          category: category || null,
          exercises: exercisesPayload,
        });
        toast({
          title: "Template created",
          description: "Your new workout template has been created.",
        });
      }
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? "update" : "create"} template.`,
        variant: "destructive",
      });
    }
  };

  const isSaving = createTemplate.isPending || updateTemplate.isPending;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Template" : "Create Template"}
            </DialogTitle>
          </DialogHeader>

          {isEditing && isLoadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-6 pb-4">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Push Day, Full Body Strength"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger id="difficulty">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={category || "none"} onValueChange={(val) => setCategory(val === "none" ? "" : val)}>
                        <SelectTrigger id="category">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {TEMPLATE_CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Describe this workout template..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                {/* Exercises Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Exercises ({exercises.length})</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsPickerOpen(true)}
                      className="gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Exercise
                    </Button>
                  </div>

                  {exercises.length === 0 ? (
                    <Card className="border-dashed">
                      <CardContent className="py-8 text-center text-muted-foreground">
                        <p>No exercises added yet.</p>
                        <p className="text-sm">
                          Click "Add Exercise" to select from the library.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {exercises.map((exercise, index) => (
                        <Card key={exercise.id} className="overflow-hidden">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              {/* Move Buttons */}
                              <div className="flex flex-col gap-1">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  disabled={index === 0}
                                  onClick={() => handleMoveExercise(index, "up")}
                                >
                                  <ChevronUp className="w-4 h-4" />
                                </Button>
                                <GripVertical className="w-4 h-4 text-muted-foreground mx-auto" />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  disabled={index === exercises.length - 1}
                                  onClick={() => handleMoveExercise(index, "down")}
                                >
                                  <ChevronDown className="w-4 h-4" />
                                </Button>
                              </div>

                              {/* Exercise Details */}
                              <div className="flex-1 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-medium">
                                      {index + 1}. {exercise.exerciseName}
                                    </span>
                                    <span className="text-xs text-muted-foreground ml-2 capitalize">
                                      ({exercise.exerciseCategory})
                                    </span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => handleRemoveExercise(exercise.id)}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                  <div className="space-y-1">
                                    <Label className="text-xs">Sets</Label>
                                    <Input
                                      type="number"
                                      min={1}
                                      value={exercise.defaultSets}
                                      onChange={(e) =>
                                        handleUpdateExercise(
                                          exercise.id,
                                          "defaultSets",
                                          parseInt(e.target.value) || 1
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Reps</Label>
                                    <Input
                                      type="number"
                                      min={1}
                                      value={exercise.defaultReps}
                                      onChange={(e) =>
                                        handleUpdateExercise(
                                          exercise.id,
                                          "defaultReps",
                                          parseInt(e.target.value) || 1
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <Label className="text-xs">Rest (s)</Label>
                                    <Input
                                      type="number"
                                      min={0}
                                      value={exercise.defaultRestSeconds}
                                      onChange={(e) =>
                                        handleUpdateExercise(
                                          exercise.id,
                                          "defaultRestSeconds",
                                          parseInt(e.target.value) || 0
                                        )
                                      }
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <Label className="text-xs">Notes</Label>
                                  <Input
                                    placeholder="e.g., Focus on form, go slow..."
                                    value={exercise.notes}
                                    onChange={(e) =>
                                      handleUpdateExercise(
                                        exercise.id,
                                        "notes",
                                        e.target.value
                                      )
                                    }
                                  />
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Create Template"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exercise Picker */}
      <ExercisePicker
        open={isPickerOpen}
        onOpenChange={setIsPickerOpen}
        onSelect={handleAddExercise}
        selectedIds={exercises.map((ex) => ex.exerciseId)}
      />
    </>
  );
}
