import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, AlignLeft, Mail, Send, Search, Bell } from "lucide-react";
import { FEATURE_ATS_ENABLED } from "@/config/featureFlags";
import { useState } from "react";
import { toast } from "sonner";

const allTools = [
  {
    title: "Resume Bullet Generator",
    description: "Turn simple job tasks into powerful, professional resume bullet points.",
    icon: FileText,
    href: "/tools/resume-bullet-generator",
    color: "text-primary",
  },
  {
    title: "Resume Summary Generator",
    description: "Generate polished professional summary paragraphs in seconds.",
    icon: AlignLeft,
    href: "/tools/resume-summary-generator",
    color: "text-accent",
  },
  {
    title: "Cover Letter Generator",
    description: "Create tailored cover letters matched to any job posting.",
    icon: Mail,
    href: "/tools/cover-letter-generator",
    color: "text-primary",
  },
  {
    title: "Cold Email Generator",
    description: "Write compelling outreach emails for jobs, freelance, or networking.",
    icon: Send,
    href: "/tools/cold-email-generator",
    color: "text-accent",
  },
  {
    title: "Resume ATS Analyzer",
    description: "Check how well your resume matches a job description and get your ATS score.",
    icon: Search,
    href: "/tools/ats-analyzer",
    color: "text-primary",
    flag: "ats" as const,
  },
];

const tools = allTools.filter((t) => !("flag" in t) || (t.flag === "ats" && FEATURE_ATS_ENABLED));

const WAITLIST_KEY = "ct_waitlist";
const WAITLIST_DAILY_LIMIT = 2;

function canSignUpWaitlist(): boolean {
  try {
    const raw = localStorage.getItem(WAITLIST_KEY);
    if (!raw) return true;
    const data = JSON.parse(raw);
    const today = new Date().toISOString().slice(0, 10);
    if (data.date !== today) return true;
    return data.count < WAITLIST_DAILY_LIMIT;
  } catch {
    return true;
  }
}

function recordWaitlistSignup() {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const raw = localStorage.getItem(WAITLIST_KEY);
    const data = raw ? JSON.parse(raw) : null;
    if (data && data.date === today) {
      data.count += 1;
      localStorage.setItem(WAITLIST_KEY, JSON.stringify(data));
    } else {
      localStorage.setItem(WAITLIST_KEY, JSON.stringify({ date: today, count: 1 }));
    }
  } catch {}
}

const ComingSoonCard = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleNotify = () => {
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!canSignUpWaitlist()) {
      toast.error("You've already signed up. We'll notify you!");
      return;
    }
    recordWaitlistSignup();
    setSubmitted(true);
    toast.success("You're on the list! We'll notify you when it launches.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: tools.length * 0.1, duration: 0.4 }}
    >
      <div className="relative rounded-xl border border-dashed border-primary/30 bg-card p-6 overflow-hidden">
        <div className="absolute top-3 right-3 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          Coming Soon
        </div>
        <Search className="h-8 w-8 text-primary/50 mb-4" />
        <h3 className="font-display text-lg font-semibold">ATS Resume Checker</h3>
        <p className="mt-2 text-sm text-body leading-relaxed">
          Launching soon — check your ATS score, find missing keywords, and get improvement suggestions.
        </p>

        {submitted ? (
          <p className="mt-4 text-sm text-primary font-medium flex items-center gap-1.5">
            <Bell className="h-4 w-4" /> We'll notify you!
          </p>
        ) : (
          <div className="mt-4 flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 min-w-0 rounded-lg border border-input bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleNotify}
              className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Notify me
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ToolsGrid = () => (
  <section className="bg-section py-20">
    <div className="container">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold">AI-Powered Career Tools</h2>
        <p className="mt-3 text-body max-w-xl mx-auto">
          Specialized tools to help you stand out in your job search.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {tools.map((tool, i) => (
          <motion.div
            key={tool.href}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1, duration: 0.4 }}
          >
            <Link
              to={tool.href}
              className="group block rounded-xl border bg-card p-6 hover:border-primary/30 transition-colors"
            >
              <tool.icon className={`h-8 w-8 ${tool.color} mb-4`} />
              <h3 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">
                {tool.title}
              </h3>
              <p className="mt-2 text-sm text-body leading-relaxed">{tool.description}</p>
            </Link>
          </motion.div>
        ))}

        {/* Show Coming Soon card only when ATS is hidden */}
        {!FEATURE_ATS_ENABLED && <ComingSoonCard />}
      </div>
    </div>
  </section>
);

export default ToolsGrid;
