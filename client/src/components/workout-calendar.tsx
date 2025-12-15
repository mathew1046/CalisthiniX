import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { 
  ChevronLeft, 
  ChevronRight, 
  Dumbbell
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isToday
} from "date-fns";

interface WorkoutCalendarProps {
  workouts: any[];
  selectedDate: Date | undefined;
  onDateSelect: (date: Date) => void;
  className?: string;
}

export function WorkoutCalendar({ 
  workouts = [], 
  selectedDate, 
  onDateSelect,
  className 
}: WorkoutCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Group workouts by date
  const workoutsByDate = useMemo(() => {
    const map = new Map<string, any[]>();
    workouts.forEach(w => {
      const dateKey = format(new Date(w.date), 'yyyy-MM-dd');
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(w);
    });
    return map;
  }, [workouts]);

  // Get all days to display in the calendar grid
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const getWorkoutsForDay = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return workoutsByDate.get(dateKey) || [];
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6 px-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full hover:bg-primary/10 hover:text-primary"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
        
        <div className="flex items-center gap-3">
          <h3 className="text-xl sm:text-2xl md:text-3xl font-heading font-bold uppercase tracking-wide">
            {format(currentMonth, "MMMM yyyy")}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="hidden sm:flex text-xs uppercase tracking-wider border-primary/30 hover:bg-primary/10 hover:text-primary"
          >
            Today
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="h-10 w-10 sm:h-12 sm:w-12 rounded-full hover:bg-primary/10 hover:text-primary"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center py-2 sm:py-3 text-xs sm:text-sm font-semibold text-muted-foreground uppercase tracking-wider"
          >
            <span className="hidden sm:inline">{day}</span>
            <span className="sm:hidden">{day.charAt(0)}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((day, index) => {
          const dayWorkouts = getWorkoutsForDay(day);
          const hasWorkout = dayWorkouts.length > 0;
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isDayToday = isToday(day);
          const workoutCount = dayWorkouts.length;

          return (
            <button
              key={index}
              onClick={() => onDateSelect(day)}
              disabled={!isCurrentMonth}
              className={cn(
                "relative aspect-square flex flex-col items-center justify-center rounded-lg sm:rounded-xl transition-all duration-200",
                "min-h-[48px] sm:min-h-[64px] md:min-h-[80px] lg:min-h-[90px]",
                "text-base sm:text-lg md:text-xl font-medium",
                "hover:scale-105 active:scale-95",
                // Base states
                !isCurrentMonth && "opacity-30 cursor-not-allowed hover:scale-100",
                isCurrentMonth && !hasWorkout && !isSelected && "hover:bg-secondary/50",
                // Today
                isDayToday && !isSelected && "ring-2 ring-primary/50 bg-primary/5",
                // Has workout
                hasWorkout && !isSelected && "bg-primary/20 hover:bg-primary/30 text-primary font-bold",
                // Selected
                isSelected && "bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-2 ring-primary",
              )}
            >
              {/* Day Number */}
              <span className={cn(
                "z-10",
                hasWorkout && !isSelected && "text-primary",
                isSelected && "text-primary-foreground"
              )}>
                {format(day, "d")}
              </span>

              {/* Workout Indicator - Show single indicator per day regardless of workout count */}
              {hasWorkout && isCurrentMonth && (
                <div className={cn(
                  "flex items-center gap-0.5 mt-0.5 sm:mt-1",
                  isSelected ? "text-primary-foreground" : "text-primary"
                )}>
                  <Dumbbell className="h-3 w-3 sm:h-4 sm:w-4" />
                </div>
              )}

              {/* Today Badge */}
              {isDayToday && !isSelected && (
                <div className="absolute -top-1 -right-1 sm:-top-1.5 sm:-right-1.5">
                  <div className="h-2 w-2 sm:h-3 sm:w-3 rounded-full bg-primary animate-pulse" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 sm:gap-6 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-primary/20 flex items-center justify-center">
            <Dumbbell className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary" />
          </div>
          <span className="text-xs sm:text-sm text-muted-foreground">Workout</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 sm:h-5 sm:w-5 rounded ring-2 ring-primary/50 bg-primary/5" />
          <span className="text-xs sm:text-sm text-muted-foreground">Today</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 sm:h-5 sm:w-5 rounded bg-primary shadow-sm" />
          <span className="text-xs sm:text-sm text-muted-foreground">Selected</span>
        </div>
      </div>

      {/* Mobile Today Button */}
      <div className="sm:hidden mt-4 flex justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={goToToday}
          className="text-xs uppercase tracking-wider border-primary/30 hover:bg-primary/10 hover:text-primary"
        >
          Go to Today
        </Button>
      </div>
    </div>
  );
}
