import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";
import { callAI } from "@/lib/ai";

const ColdEmailGenerator = () => {
  const [outreachType, setOutreachType] = useState("job");
  const [role, setRole] = useState("");
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("");
  const [cta, setCta] = useState("");
  const [results, setResults] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = async () => {
    if (!role && !target) return;
    setIsLoading(true);
    try {
      const data = await callAI("generate-cold-email", { outreachType, role, target, message, cta });
      setResults(data);
    } catch { /* handled */ }
    setIsLoading(false);
  };

  return (
    <ToolLayout
      title="Cold Email / Job Outreach Generator"
      subtitle="Write compelling outreach emails for jobs, freelance, or networking."
      results={results}
      isLoading={isLoading}
      onGenerate={generate}
      onRegenerate={generate}
      relatedTools={[
        { title: "Cover Letter Generator", href: "/tools/cover-letter-generator" },
        { title: "Resume Bullet Generator", href: "/tools/resume-bullet-generator" },
        { title: "Resume Summary Generator", href: "/tools/resume-summary-generator" },
      ]}
      faqs={[
        { q: "What makes a good cold email?", a: "Keep it short, personalized, and include a clear call-to-action. Show you've done research on the recipient." },
        { q: "How long should a cold email be?", a: "Aim for 3-5 short paragraphs, under 200 words total." },
      ]}
    >
      <div>
        <label className="block text-sm font-medium mb-1.5">Outreach Type</label>
        <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={outreachType} onChange={e => setOutreachType(e.target.value)}>
          <option value="job">Job Application</option>
          <option value="freelance">Freelance Pitch</option>
          <option value="networking">Networking</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Your Role / Service</label>
        <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., Full-Stack Developer" value={role} onChange={e => setRole(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Target Company or Person</label>
        <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., Sarah at Acme Corp" value={target} onChange={e => setTarget(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Main Message (optional)</label>
        <textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="What do you want to say?" value={message} onChange={e => setMessage(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">CTA Preference (optional)</label>
        <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" placeholder="e.g., Can we hop on a call?" value={cta} onChange={e => setCta(e.target.value)} />
      </div>
    </ToolLayout>
  );
};

export default ColdEmailGenerator;
