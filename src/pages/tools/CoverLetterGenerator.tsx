import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";

const CoverLetterGenerator = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [background, setBackground] = useState("");
  const [achievements, setAchievements] = useState("");
  const [interest, setInterest] = useState("");
  const [results, setResults] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = () => {
    if (!jobTitle || !company) return;
    setIsLoading(true);
    setTimeout(() => {
      setResults([
        `Dear Hiring Manager,\n\nI am writing to express my interest in the ${jobTitle} position at ${company}. ${background || "With my professional background"}, I am confident in my ability to contribute meaningfully to your team.\n\n${achievements ? `In my career, I have ${achievements}.` : ""} ${interest ? `I am particularly drawn to ${company} because ${interest}.` : ""}\n\nI would welcome the opportunity to discuss how my skills and experience align with your needs. Thank you for your consideration.\n\nSincerely,\n[Your Name]`,
      ]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <ToolLayout
      title="Cover Letter Generator"
      subtitle="Create tailored cover letters matched to any job posting."
      results={results}
      isLoading={isLoading}
      onGenerate={generate}
      onRegenerate={generate}
      relatedTools={[
        { title: "Resume Bullet Generator", href: "/tools/resume-bullet-generator" },
        { title: "Resume Summary Generator", href: "/tools/resume-summary-generator" },
        { title: "Cold Email Generator", href: "/tools/cold-email-generator" },
      ]}
      faqs={[
        { q: "Do I still need a cover letter?", a: "Yes. Many hiring managers still read cover letters, especially for competitive roles." },
        { q: "Should I customize each cover letter?", a: "Absolutely. Tailoring your cover letter to each job significantly increases your chances." },
      ]}
    >
      <div>
        <label className="block text-sm font-medium mb-1.5">Job Title</label>
        <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., Product Designer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Company Name</label>
        <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., Google" value={company} onChange={e => setCompany(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Your Background</label>
        <textarea className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="Brief summary of your experience..." value={background} onChange={e => setBackground(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Key Achievements</label>
        <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., Led a team of 10, increased revenue by 25%" value={achievements} onChange={e => setAchievements(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Why This Role?</label>
        <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., Passionate about the company mission..." value={interest} onChange={e => setInterest(e.target.value)} />
      </div>
    </ToolLayout>
  );
};

export default CoverLetterGenerator;
