import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";

const ResumeBulletGenerator = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [task, setTask] = useState("");
  const [outcome, setOutcome] = useState("");
  const [tone, setTone] = useState("standard");
  const [results, setResults] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = () => {
    if (!jobTitle || !task) return;
    setIsLoading(true);
    // Mock output for now — will be replaced with AI
    setTimeout(() => {
      setResults([
        `Spearheaded ${task} as ${jobTitle}, resulting in ${outcome || "measurable improvements"} across key performance metrics.`,
        `Executed ${task} initiatives in a ${jobTitle} capacity, driving ${outcome || "significant operational gains"} and team efficiency.`,
        `Led ${task} efforts as ${jobTitle}, achieving ${outcome || "notable results"} that contributed to organizational growth.`,
      ]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <ToolLayout
      title="Resume Bullet Point Generator"
      subtitle="Turn simple job tasks into strong, professional resume bullet points."
      results={results}
      isLoading={isLoading}
      onGenerate={generate}
      onRegenerate={generate}
      relatedTools={[
        { title: "Resume Summary Generator", href: "/tools/resume-summary-generator" },
        { title: "Cover Letter Generator", href: "/tools/cover-letter-generator" },
        { title: "Cold Email Generator", href: "/tools/cold-email-generator" },
      ]}
      faqs={[
        { q: "How does the resume bullet generator work?", a: "Enter your job title, a task you performed, and the outcome. Our AI rewrites it into 3 professional bullet point options." },
        { q: "Is this tool free?", a: "Yes, 100% free. No sign-up or credit card required." },
        { q: "Can I use these on my real resume?", a: "Absolutely. The generated bullets are designed to be used directly on your resume." },
      ]}
    >
      <div>
        <label className="block text-sm font-medium mb-1.5">Job Title</label>
        <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., Marketing Manager" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Task Performed</label>
        <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., Managed social media campaigns" value={task} onChange={e => setTask(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Outcome / Result (optional)</label>
        <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., Increased engagement by 40%" value={outcome} onChange={e => setOutcome(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Tone</label>
        <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={tone} onChange={e => setTone(e.target.value)}>
          <option value="standard">Standard</option>
          <option value="strong">Strong</option>
          <option value="leadership">Leadership</option>
        </select>
      </div>
    </ToolLayout>
  );
};

export default ResumeBulletGenerator;
