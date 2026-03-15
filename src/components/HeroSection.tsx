import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen } from "lucide-react";

const HeroSection = () => (
  <section className="relative overflow-hidden bg-background py-20 md:py-28">
    <div className="container relative z-10">
      <motion.div
        className="mx-auto max-w-3xl text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <span className="inline-block rounded-full border px-4 py-1.5 text-xs font-medium text-body mb-6">
          Free AI Career Tools — No Sign-Up Required
        </span>
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
          Build better resumes, emails, and applications{" "}
          <span className="text-primary">in minutes</span>
        </h1>
        <p className="mt-6 text-lg text-body leading-relaxed max-w-2xl mx-auto">
          Use AI-powered career tools to write stronger resume bullets, summaries, cover letters, and outreach emails.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/tools"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Try Free Tools
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 rounded-lg border px-6 py-3 text-sm font-semibold text-foreground hover:bg-secondary transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Read Career Guides
          </Link>
        </div>
      </motion.div>
    </div>
    {/* Subtle grid background */}
    <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40" />
  </section>
);

export default HeroSection;
