import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Flame, ChevronRight, Trophy, Activity, Calendar, Dumbbell } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import heroImage from "@assets/generated_images/calisthenics_athlete_pull_up_dark_lighting_neon_green.png";
import { Link } from "wouter";
import { useMe } from "@/hooks/useMe";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface ProfileStats {
  totalWorkouts: number;
  activeTime: string;
  activeMinutes: number;
  currentStreak: number;
  favoriteWorkout: string;
  pr: { exerciseName: string; weight: number } | null;
}

interface WeeklyDataPoint {
  day: string;
  volume: number;
}

export default function Home() {
  const { user } = useMe();
  
  // Fetch profile stats (includes streak and PR from database)
  const { data: profileStats } = useQuery<ProfileStats>({
    queryKey: ["/api/stats/profile"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/stats/profile");
      return res.json();
    },
    refetchOnMount: "always",
    staleTime: 0,
  });

  // Fetch weekly volume data
  const { data: weeklyData = [] } = useQuery<WeeklyDataPoint[]>({
    queryKey: ["/api/stats/weekly-volume"],
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Welcome Header */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-muted-foreground font-medium mb-1">Welcome back</h2>
          <h1 className="text-4xl md:text-5xl font-heading font-bold uppercase tracking-tight">
            {user?.firstName || user?.displayName || 'ATHLETE'} <span className="text-primary">!</span>
          </h1>
        </div>
        <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-full">
          <Flame className="text-orange-500 fill-orange-500 animate-pulse" size={20} />
          <span className="font-heading font-bold text-xl">{profileStats?.currentStreak || 0} DAYS</span>
        </div>
      </div>

      {/* Hero / Next Workout */}
      <div className="relative overflow-hidden rounded-3xl border border-border group cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
        <img 
          src={heroImage} 
          alt="Athlete" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
        />
        
        <div className="relative z-20 p-6 md:p-10 flex flex-col items-start gap-4">
          <div className="bg-primary/20 backdrop-blur-sm text-primary px-3 py-1 rounded text-xs font-bold uppercase tracking-wider border border-primary/30">
            Today's Session
          </div>
          <div>
            <h3 className="text-3xl md:text-4xl font-heading font-bold uppercase mb-2 text-white">
              Pull & Skills B
            </h3>
            <p className="text-muted-foreground max-w-md">
              Focus on explosive pull-ups and front-lever tuck holds. 
              Your last session was 4 days ago.
            </p>
          </div>
          
          <Link href="/workout">
            <Button size="lg" className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-wide px-8 h-12 rounded-xl shadow-[0_0_20px_rgba(133,255,0,0.3)] transition-all hover:shadow-[0_0_30px_rgba(133,255,0,0.5)] hover:-translate-y-1">
              Start Workout <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Level</CardTitle>
            <Trophy className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-heading mb-2">
              {user?.currentLevel === 0 && 'FOUNDATION'}
              {user?.currentLevel === 1 && 'BEGINNER'}
              {user?.currentLevel === 2 && 'INTERMEDIATE'}
              {user?.currentLevel === 3 && 'ADVANCED'}
              {user?.currentLevel === 4 && 'GOD TIER'}
            </div>
            <Progress value={user?.levelProgress || 0} className="h-2 bg-muted" />
            <p className="text-xs text-muted-foreground mt-2">{user?.levelProgress || 0}% to next level</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Weekly Volume</CardTitle>
            <Activity className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="h-[60px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                    cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="volume" 
                    stroke="hsl(var(--primary))" 
                    fillOpacity={1} 
                    fill="url(#colorVolume)" 
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:border-primary/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Personal Record</CardTitle>
            <Dumbbell className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {profileStats?.pr && profileStats.pr.weight > 0 ? (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-foreground">{profileStats.pr.exerciseName}</span>
                  <span className="text-primary font-bold font-mono">{profileStats.pr.weight} kg</span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No PRs yet. Start tracking!</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-heading font-bold uppercase mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" /> Quick Actions
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/coach">
            <Button 
              variant="outline" 
              className="h-auto py-4 w-full flex flex-col gap-2 bg-card hover:bg-accent hover:text-accent-foreground border-border"
            >
              <span className="font-heading font-medium tracking-wide">Check Form</span>
            </Button>
          </Link>
          <Link href="/journal">
            <Button 
              variant="outline" 
              className="h-auto py-4 w-full flex flex-col gap-2 bg-card hover:bg-accent hover:text-accent-foreground border-border"
            >
              <span className="font-heading font-medium tracking-wide">Log Journal</span>
            </Button>
          </Link>
          <Link href="/templates">
            <Button 
              variant="outline" 
              className="h-auto py-4 w-full flex flex-col gap-2 bg-card hover:bg-accent hover:text-accent-foreground border-border"
            >
              <span className="font-heading font-medium tracking-wide">Edit Routine</span>
            </Button>
          </Link>
          <Link href="/workout">
            <Button 
              variant="outline" 
              className="h-auto py-4 w-full flex flex-col gap-2 bg-card hover:bg-accent hover:text-accent-foreground border-border"
            >
              <span className="font-heading font-medium tracking-wide">Warm Up</span>
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
