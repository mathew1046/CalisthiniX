import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      className="
        fixed
        z-[60]
        top-[4.5rem] right-4
        md:top-auto md:right-auto
        md:bottom-4 md:left-4
      "
    >
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="
          h-10 w-10 
          rounded-full 
          bg-background/80 
          backdrop-blur-sm 
          border-border
          shadow-lg
          hover:bg-accent
          hover:text-accent-foreground
          transition-all
          duration-200
        "
      >
        {theme === "dark" ? (
          <Sun className="h-5 w-5 text-yellow-400 transition-transform hover:rotate-12" />
        ) : (
          <Moon className="h-5 w-5 text-slate-700 transition-transform hover:-rotate-12" />
        )}
      </Button>
    </div>
  );
}
