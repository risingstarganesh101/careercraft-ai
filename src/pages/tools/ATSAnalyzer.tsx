import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { callAI } from "@/lib/ai";
import { syncRemaining } from "@/hooks/useUsageLimit";

const ATSAnalyzer = () => {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [results, setResults] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) return;
    setIsLoading(true);
    try {
      const data = await callAI("ats-analyzer", { resumeText, jobDescription });
      setResults(data.results);
      syncRemaining(data.remaining);
    } catch { /* handled in callAI */ }
    setIsLoading(false);
  };

  return (
    <ToolLayout
      title="Resume ATS Analyzer"
      subtitle="Check how well your resume matches a job description. Get your ATS score, missing keywords, and improvement suggestions."
      results={results}
      isLoading={isLoading}
      onGenerate={generate}
      onRegenerate={generate}
      relatedTools={[
        { title: "Resume Bullet Generator", href: "/tools/resume-bullet-generator" },
        { title: "Resume Summary Generator", href: "/tools/resume-summary-generator" },
        { title: "Cover Letter Generator", href: "/tools/cover-letter-generator" },
      ]}
      faqs={[
        { q: "What is an ATS score?", a: "An ATS (Applicant Tracking System) score estimates how well your resume matches a job description based on keyword overlap, formatting, and relevance." },
        { q: "How does this tool work?", a: "Paste your resume text and the job description. Our AI analyzes keyword matches, identifies gaps, and provides actionable improvement suggestions." },
        { q: "Will this guarantee I pass ATS?", a: "No tool can guarantee passing ATS, but optimizing for keyword alignment significantly improves your chances of getting past automated filters." },
        { q: "Is this tool free?", a: "Yes, 100% free. No sign-up or credit card required." },
      ]}
    >
      <div>
        <label className="block text-sm font-medium mb-1.5">Resume Text</label>
        <textarea
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[140px] resize-y"
          placeholder="Paste your full resume text here..."
          value={resumeText}
          onChange={(e) => setResumeText(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Job Description</label>
        <textarea
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[140px] resize-y"
          placeholder="Paste the job description you're targeting..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
        />
      </div>
    </ToolLayout>
  );
};

export default ATSAnalyzer;
