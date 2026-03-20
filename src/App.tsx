import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { FEATURE_ATS_ENABLED } from "@/config/featureFlags";
import Index from "./pages/Index";
import ToolsIndex from "./pages/ToolsIndex";
import ResumeBulletGenerator from "./pages/tools/ResumeBulletGenerator";
import ResumeSummaryGenerator from "./pages/tools/ResumeSummaryGenerator";
import CoverLetterGenerator from "./pages/tools/CoverLetterGenerator";
import ColdEmailGenerator from "./pages/tools/ColdEmailGenerator";
import ATSAnalyzer from "./pages/tools/ATSAnalyzer";
import BlogIndex from "./pages/BlogIndex";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PostEditor from "./pages/admin/PostEditor";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tools" element={<ToolsIndex />} />
            <Route path="/tools/resume-bullet-generator" element={<ResumeBulletGenerator />} />
            <Route path="/tools/resume-summary-generator" element={<ResumeSummaryGenerator />} />
            <Route path="/tools/cover-letter-generator" element={<CoverLetterGenerator />} />
            <Route path="/tools/cold-email-generator" element={<ColdEmailGenerator />} />
            <Route path="/tools/ats-analyzer" element={FEATURE_ATS_ENABLED ? <ATSAnalyzer /> : <NotFound />} />
            <Route path="/blog" element={<BlogIndex />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/posts/:id" element={<PostEditor />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
