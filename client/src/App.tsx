import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider, ThemeToggle } from "@/components/theme";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Roadmap from "@/pages/roadmap";
import Workout from "@/pages/workout";
import Coach from "@/pages/coach";
import Profile from "@/pages/profile";
import Journal from "@/pages/journal";
import Landing from "@/pages/landing";
import ExercisesPage from "@/pages/exercises-page";
import ExerciseDetailPage from "@/pages/exercise-detail-page";
import TemplatesPage from "@/pages/templates-page";
import Layout from "@/components/layout";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/roadmap" component={Roadmap} />
        <Route path="/workout" component={Workout} />
        <Route path="/workout/:id" component={Workout} />
        <Route path="/coach" component={Coach} />
        <Route path="/profile" component={Profile} />
        <Route path="/templates" component={TemplatesPage} />
        <Route path="/journal" component={Journal} />
        <Route path="/exercises" component={ExercisesPage} />
        <Route path="/exercises/:slug" component={ExerciseDetailPage} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <Router />
        <ThemeToggle />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
