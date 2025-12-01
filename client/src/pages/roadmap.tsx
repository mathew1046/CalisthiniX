import { cn } from "@/lib/utils";
import { CheckCircle2, Lock, PlayCircle } from "lucide-react";
import { useTheme } from "@/components/theme";

const levels = [
  {
    id: 0,
    title: "Level 0: Foundation",
    desc: "Build basic joint strength and mobility.",
    status: "completed",
    skills: ["Wall Pushups", "Dead Hangs", "Knee Raises"],
  },
  {
    id: 1,
    title: "Level 1: Beginner",
    desc: "Mastering bodyweight basics.",
    status: "completed",
    skills: ["Pushups", "Dips", "Leg Raises"],
  },
  {
    id: 2,
    title: "Level 2: Intermediate",
    desc: "Introduction to explosive power.",
    status: "current",
    skills: ["Pull-ups", "L-Sit", "Pistol Squat"],
  },
  {
    id: 3,
    title: "Level 3: Advanced",
    desc: "Elite strength moves.",
    status: "locked",
    skills: ["Muscle Up", "Front Lever Tuck", "Handstand"],
  },
  {
    id: 4,
    title: "Level 4: God Tier",
    desc: "Defying gravity.",
    status: "locked",
    skills: ["Planche", "One Arm Pull-up", "Human Flag"],
  },
];

export default function Roadmap() {
  const { theme } = useTheme();
  
  const bgImage = theme === "dark" 
    ? "/images/theme-dark.png" 
    : "/images/theme-light.png";

  return (
    <div className="relative min-h-screen pb-20">
       {/* Background Texture */}
       <div 
        className="fixed inset-0 z-0 opacity-20 dark:opacity-10 pointer-events-none transition-opacity duration-300" 
        style={{ 
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} 
      />

      <div className="relative z-10 space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-tight mb-2">
            The <span className="text-primary">Path</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Master the fundamentals before attempting the impossible. 
            Your journey from zero to hero starts here.
          </p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6 relative">
          {/* Vertical Line */}
          <div className="absolute left-[27px] top-8 bottom-8 w-0.5 bg-border z-0 md:left-1/2 md:-ml-[1px]" />

          {levels.map((level, index) => {
            const isLeft = index % 2 === 0;
            return (
              <div key={level.id} className={cn(
                "relative flex items-center gap-6 md:gap-12",
                "flex-row md:flex-row", // Always row on mobile, zigzag on desktop
                // For desktop zigzag logic:
                // Actually let's keep it simple vertical for now to ensure responsiveness is easy
              )}>
                
                {/* Status Icon */}
                <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-full bg-background border-4 border-border flex items-center justify-center shadow-xl">
                   {level.status === "completed" && <CheckCircle2 className="text-primary w-6 h-6" />}
                   {level.status === "current" && <div className="w-4 h-4 bg-primary rounded-full animate-pulse shadow-[0_0_10px_hsl(var(--primary))]" />}
                   {level.status === "locked" && <Lock className="text-muted-foreground w-5 h-5" />}
                </div>

                {/* Content Card */}
                <div className={cn(
                  "flex-1 bg-card/50 backdrop-blur-md border rounded-xl p-5 transition-all duration-300 hover:-translate-y-1",
                  level.status === "current" ? "border-primary ring-1 ring-primary/20 shadow-[0_0_30px_-10px_rgba(133,255,0,0.15)]" : "border-border",
                  level.status === "locked" ? "opacity-60 grayscale" : "opacity-100"
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className={cn(
                      "text-xl font-heading font-bold uppercase",
                      level.status === "current" ? "text-primary" : "text-foreground"
                    )}>
                      {level.title}
                    </h3>
                    {level.status !== "locked" && (
                      <span className="text-xs font-mono text-muted-foreground border border-border px-2 py-0.5 rounded">
                        {level.status === "completed" ? "100%" : "45%"}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4">{level.desc}</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {level.skills.map(skill => (
                      <span key={skill} className="text-xs font-bold px-2 py-1 bg-secondary rounded text-secondary-foreground">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
