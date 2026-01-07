import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CallerDeskProvider } from "@/contexts/CallerDeskContext";
import Dashboard from "./pages/Dashboard";
import CallLogs from "./pages/CallLogs";
import LiveCalls from "./pages/LiveCalls";
import ClickToCall from "./pages/ClickToCall";
import Members from "./pages/Members";
import CallGroups from "./pages/CallGroups";
import Contacts from "./pages/Contacts";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CallerDeskProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calls" element={<CallLogs />} />
            <Route path="/live" element={<LiveCalls />} />
            <Route path="/dial" element={<ClickToCall />} />
            <Route path="/members" element={<Members />} />
            <Route path="/groups" element={<CallGroups />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CallerDeskProvider>
  </QueryClientProvider>
);

export default App;
