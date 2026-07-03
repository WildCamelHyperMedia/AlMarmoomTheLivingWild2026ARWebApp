import { Switch, Route, Router as WouterRouter } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/LandingPage";
import GalleryPage from "@/pages/GalleryPage";
import AuthPage from "@/pages/AuthPage";
import IntroPage from "@/pages/IntroPage";
import AnimalDetailPage from "@/pages/AnimalDetailPage";
import AdminPage from "@/pages/AdminPage";
import QRScannerPage from "@/pages/QRScannerPage";
import LeadFormPage from "@/pages/LeadFormPage";
import { LanguageProvider } from "@/lib/language";
import { UserProvider } from "@/lib/user";
import { ProgressProvider } from "@/lib/progress";

// "" at domain root; "/AlMarmoom..." when served from a Pages project subpath
const routerBase = import.meta.env.BASE_URL.replace(/\/$/, "");

function Router() {
  return (
    <WouterRouter base={routerBase}>
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/intro" component={IntroPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/animal/:id" component={AnimalDetailPage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/scan" component={QRScannerPage} />
      <Route path="/parkers" component={LeadFormPage} />
      <Route component={NotFound} />
    </Switch>
    </WouterRouter>
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
