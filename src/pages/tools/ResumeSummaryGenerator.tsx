import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { callAI } from "@/lib/ai";
import { syncRemaining } from "@/hooks/useUsageLimit";

const ResumeSummaryGenerator = () => {
  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [skills, setSkills] = useState("");
  const [industry, setIndustry] = useState("");
  const [objective, setObjective] = useState("");
  const [results, setResults] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = async () => {
    if (!role && !skills) return;
    setIsLoading(true);
    try {
      const data = await callAI("generate-resume-summary", { role, experience, skills, industry, objective });
      setResults(data.results);
      syncRemaining(data.remaining);
    } catch { /* handled */ }
    setIsLoading(false);
  };

  return (
    <ToolLayout
      title="Resume Summary Generator"
      subtitle="Generate professional resume summary paragraphs in seconds."
      results={results}
      isLoading={isLoading}
      onGenerate={generate}
      onRegenerate={generate}
      relatedTools={[
        { title: "Resume Bullet Generator", href: "/tools/resume-bullet-generator" },
        { title: "Cover Letter Generator", href: "/tools/cover-letter-generator" },
        { title: "Cold Email Generator", href: "/tools/cold-email-generator" },
      ]}
      faqs={[
        { q: "What is a resume summary?", a: "A resume summary is a brief paragraph at the top of your resume highlighting your key qualifications and career goals." },
        { q: "How long should a resume summary be?", a: "Ideally 2-4 sentences, or about 50-100 words." },
      ]}
    >
      <div>
        <label className="block text-sm font-medium mb-1.5">Job Role</label>
        <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., Software Engineer" value={role} onChange={e => setRole(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Years of Experience</label>
        <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., 5" value={experience} onChange={e => setExperience(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Key Skills</label>
        <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., React, Node.js, AWS" value={skills} onChange={e => setSkills(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Industry</label>
        <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., FinTech" value={industry} onChange={e => setIndustry(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Career Objective (optional)</label>
        <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., Seeking a senior role..." value={objective} onChange={e => setObjective(e.target.value)} />
      </div>
    </ToolLayout>
  );
};

export default ResumeSummaryGenerator;
