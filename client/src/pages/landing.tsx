import { Button } from "@/components/ui/button";
import { Dumbbell, Flame, Trophy, Target } from "lucide-react";
import { useTheme } from "@/components/theme";

export default function Landing() {
  const { theme } = useTheme();
  
  const bgImage = theme === "dark" 
    ? "/images/theme-dark.png" 
    : "/images/theme-light.png";

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden transition-colors duration-300">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 opacity-20 dark:opacity-10 transition-opacity duration-300" 
        style={{ 
          backgroundImage: `url(${bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }} 
      />

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-4 pt-20 pb-32 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center">
              <Dumbbell className="w-7 h-7 text-primary-foreground" />
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight">
              CALYX<span className="text-primary">PERT</span>
            </h1>
          </div>

          <p className="text-2xl md:text-3xl text-muted-foreground max-w-2xl mx-auto font-light">
            Master your body. Track your progress. Build strength with AI-powered calisthenics coaching.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
            <a href="/api/login">
              <Button 
                size="lg" 
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wide px-12 h-14 rounded-xl text-lg shadow-[0_0_30px_rgba(133,255,0,0.3)] transition-all hover:shadow-[0_0_40px_rgba(133,255,0,0.5)] hover:-translate-y-1"
                data-testid="button-login"
              >
                Get Started
              </Button>
            </a>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 text-left">
            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">Structured Roadmap</h3>
              <p className="text-muted-foreground">
                Follow a clear progression path from beginner basics to advanced skills like muscle-ups and handstands.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Flame className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">Streak System</h3>
              <p className="text-muted-foreground">
                Stay motivated with daily workout streaks. Track consistency and build lasting habits.
              </p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-all duration-300">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-heading font-bold mb-2">Track Progress</h3>
              <p className="text-muted-foreground">
                Log workouts, monitor volume, and celebrate PRs. See your strength gains over time.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-border py-8 text-center text-muted-foreground text-sm">
        Built with dedication for calisthenics athletes worldwide • Calyxpert
      </div>
    </div>
  );
}
