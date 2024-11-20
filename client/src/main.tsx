import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Switch, Route, useLocation } from "wouter";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Loader2 } from "lucide-react";
import ContactForm from "./pages/ContactForm";
import AdminLogin from "./pages/AdminLogin";
import AdminContacts from "./pages/AdminContacts";
import { useUser } from "./hooks/use-user";

function AdminRoute() {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (!user) {
    return <AdminLogin />;
  }

  return <AdminContacts />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={ContactForm} />
      <Route path="/admin" component={AdminRoute} />
      <Route>404 ページが見つかりません</Route>
    </Switch>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  </StrictMode>,
);
