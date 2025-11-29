import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import {
  useWorkoutTemplates,
  useDeleteWorkoutTemplate,
  useStartWorkoutFromTemplate,
  useDuplicateWorkoutTemplate,
  type WorkoutTemplateListItem,
  TEMPLATE_CATEGORIES,
  TEMPLATE_DIFFICULTIES,
  getCategoryLabel,
} from "@/hooks/use-workout-templates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TemplateEditorDialog } from "@/components/template-editor-dialog";
import {
  Plus,
  Play,
  MoreVertical,
  Pencil,
  Trash2,
  Dumbbell,
  Loader2,
  Copy,
  Sparkles,
  User,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Category filter options including "all"
const CATEGORY_FILTERS = [
  { value: "all", label: "All" },
  ...TEMPLATE_CATEGORIES,
];

// Difficulty filter options including "all"
const DIFFICULTY_FILTERS = [
  { value: "all", label: "All Levels" },
  ...TEMPLATE_DIFFICULTIES,
];

export default function TemplatesPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");

  // Fetch all templates (no server-side filtering, filter client-side for instant UX)
  const { data: templates, isLoading, error } = useWorkoutTemplates();
  const deleteTemplate = useDeleteWorkoutTemplate();
  const startWorkout = useStartWorkoutFromTemplate();
  const duplicateTemplate = useDuplicateWorkoutTemplate();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutTemplateListItem | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [startingTemplateId, setStartingTemplateId] = useState<string | null>(null);
  const [duplicatingTemplateId, setDuplicatingTemplateId] = useState<string | null>(null);

  // Filter and separate templates
  const { recommendedTemplates, myTemplates } = useMemo(() => {
    if (!templates) return { recommendedTemplates: [], myTemplates: [] };

    const filtered = templates.filter((t) => {
      const matchesCategory = selectedCategory === "all" || t.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === "all" || t.difficulty === selectedDifficulty;
      return matchesCategory && matchesDifficulty;
    });

    return {
      recommendedTemplates: filtered.filter((t) => t.isPublic && !t.isOwner),
      myTemplates: filtered.filter((t) => t.isOwner),
    };
  }, [templates, selectedCategory, selectedDifficulty]);

  const handleCreateNew = () => {
    setEditingTemplate(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (template: WorkoutTemplateListItem) => {
    setEditingTemplate(template);
    setIsEditorOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;

    try {
      await deleteTemplate.mutateAsync(deleteConfirmId);
      toast({
        title: "Template deleted",
        description: "The workout template has been deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete template.",
        variant: "destructive",
      });
    } finally {
      setDeleteConfirmId(null);
    }
  };

  const handleStartWorkout = async (templateId: string) => {
    setStartingTemplateId(templateId);
    try {
      const result = await startWorkout.mutateAsync(templateId);
      toast({
        title: "Workout started!",
        description: "Your workout has been created from the template.",
      });
      navigate(`/workout`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start workout from template.",
        variant: "destructive",
      });
    } finally {
      setStartingTemplateId(null);
    }
  };

  const handleDuplicate = async (template: WorkoutTemplateListItem) => {
    setDuplicatingTemplateId(template.id);
    try {
      const newTemplate = await duplicateTemplate.mutateAsync(template.id);
      toast({
        title: "Template duplicated!",
        description: `"${newTemplate.name}" has been added to your templates.`,
      });
      // Open editor for the new template
      setEditingTemplate(newTemplate);
      setIsEditorOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to duplicate template.",
        variant: "destructive",
      });
    } finally {
      setDuplicatingTemplateId(null);
    }
  };

  const getDifficultyVariant = (difficulty: string | null) => {
    switch (difficulty) {
      case "beginner":
        return "secondary";
      case "intermediate":
        return "default";
      case "advanced":
        return "destructive";
      default:
        return "outline";
    }
  };

  // Reusable template card component
  const TemplateCard = ({
    template,
    showOwnerActions,
  }: {
    template: WorkoutTemplateListItem;
    showOwnerActions: boolean;
  }) => (
    <Card className="overflow-hidden border-2 hover:border-primary/30 transition-colors h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex gap-2 flex-wrap">
            {template.difficulty && (
              <Badge
                variant={getDifficultyVariant(template.difficulty)}
                className="capitalize"
              >
                {template.difficulty}
              </Badge>
            )}
            {template.category && (
              <Badge variant="outline" className="capitalize">
                {getCategoryLabel(template.category)}
              </Badge>
            )}
          </div>
          {showOwnerActions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEdit(template)}>
                  <Pencil className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setDeleteConfirmId(template.id)}
                  className="text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <CardTitle className="mt-2 text-lg">{template.name}</CardTitle>
        {template.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {template.description}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-end">
        <div className="flex items-center text-sm text-muted-foreground mb-4">
          <Dumbbell className="w-4 h-4 mr-1" />
          {template.exerciseCount} exercise{template.exerciseCount !== 1 ? "s" : ""}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => handleStartWorkout(template.id)}
            disabled={startingTemplateId === template.id}
            className="flex-1 gap-2"
          >
            {startingTemplateId === template.id ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Starting...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start
              </>
            )}
          </Button>
          {!showOwnerActions && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleDuplicate(template)}
              disabled={duplicatingTemplateId === template.id}
              title="Duplicate to My Templates"
            >
              {duplicatingTemplateId === template.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Workout Splits
          </h1>
          <p className="text-muted-foreground mt-2">
            Choose a split or create your own workout plan
          </p>
        </div>
        <Button onClick={handleCreateNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="space-y-4 mb-8">
        {/* Category Chips */}
        <div className="flex flex-wrap gap-2">
          {CATEGORY_FILTERS.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                "capitalize",
                selectedCategory === cat.value && "bg-primary text-primary-foreground"
              )}
            >
              {cat.label}
            </Button>
          ))}
        </div>

        {/* Difficulty Filter */}
        <div className="flex flex-wrap gap-2">
          {DIFFICULTY_FILTERS.map((diff) => (
            <Button
              key={diff.value}
              variant={selectedDifficulty === diff.value ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setSelectedDifficulty(diff.value)}
              className="capitalize"
            >
              {diff.label}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-8">
          <div>
            <Skeleton className="h-8 w-48 mb-4" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[220px] w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Failed to load templates</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Recommended Splits Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold">Recommended Splits</h2>
            </div>
            {recommendedTemplates.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <p>No recommended templates match your filters.</p>
                  <p className="text-sm mt-1">Try adjusting your category or difficulty filters.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    showOwnerActions={false}
                  />
                ))}
              </div>
            )}
          </section>

          <Separator />

          {/* My Templates Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">My Templates</h2>
              </div>
            </div>
            {myTemplates.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center text-muted-foreground">
                  <Dumbbell className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>You haven't created any templates yet.</p>
                  <p className="text-sm mt-1 mb-4">
                    Create your own or duplicate a recommended split to get started.
                  </p>
                  <Button onClick={handleCreateNew} variant="outline" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Create Template
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myTemplates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    showOwnerActions={true}
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* Editor Dialog */}
      <TemplateEditorDialog
        open={isEditorOpen}
        onOpenChange={setIsEditorOpen}
        template={editingTemplate}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => !open && setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this template? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
