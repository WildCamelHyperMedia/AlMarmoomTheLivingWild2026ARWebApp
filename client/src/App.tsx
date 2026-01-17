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
import { LanguageProvider } from "@/lib/language";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/signup" component={SignUpPage} />
      <Route path="/intro" component={IntroPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/animal/:id" component={AnimalDetailPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
