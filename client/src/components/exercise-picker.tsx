import { useState } from "react";
import { useExercises, type Exercise } from "@/hooks/use-exercises";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ExercisePickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (exercise: Exercise) => void;
  selectedIds?: string[];
}

export function ExercisePicker({
  open,
  onOpenChange,
  onSelect,
  selectedIds = [],
}: ExercisePickerProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");

  const { data: exercises, isLoading } = useExercises({
    q: search,
    category: category !== "all" ? category : undefined,
    difficulty: difficulty !== "all" ? difficulty : undefined,
  });

  const handleSelect = (exercise: Exercise) => {
    onSelect(exercise);
    onOpenChange(false);
  };

  const getDifficultyVariant = (diff: string) => {
    switch (diff) {
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Exercise</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col sm:flex-row gap-3 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search exercises..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="push">Push</SelectItem>
              <SelectItem value="pull">Pull</SelectItem>
              <SelectItem value="legs">Legs</SelectItem>
              <SelectItem value="core">Core</SelectItem>
              <SelectItem value="skill">Skill</SelectItem>
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="flex-1 -mx-6 px-6">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : exercises && exercises.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No exercises found
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {exercises?.map((exercise) => {
                const isSelected = selectedIds.includes(exercise.id);
                return (
                  <Button
                    key={exercise.id}
                    variant={isSelected ? "secondary" : "ghost"}
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => handleSelect(exercise)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      {exercise.demo_image_url && (
                        <img
                          src={exercise.demo_image_url}
                          alt={exercise.name}
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 text-left">
                        <div className="font-medium">{exercise.name}</div>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs capitalize">
                            {exercise.category}
                          </Badge>
                          <Badge
                            variant={getDifficultyVariant(exercise.difficulty)}
                            className="text-xs capitalize"
                          >
                            {exercise.difficulty}
                          </Badge>
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
