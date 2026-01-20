import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import GalleryPage from "@/pages/GalleryPage";
import SignUpPage from "@/pages/SignUpPage";
import IntroPage from "@/pages/IntroPage";
import AnimalDetailPage from "@/pages/AnimalDetailPage";
import World3DPage from "@/pages/World3DPage";
import { LanguageProvider } from "@/lib/language";
import { UserProvider } from "@/lib/user";
import { ProgressProvider } from "@/lib/progress";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/signup" component={SignUpPage} />
      <Route path="/intro" component={IntroPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/animal/:id" component={AnimalDetailPage} />
      <Route path="/world3d" component={World3DPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <LanguageProvider>
          <ProgressProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ProgressProvider>
        </LanguageProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}

export default App;
