import { useState } from "react";
import ToolLayout from "@/components/ToolLayout";

const ColdEmailGenerator = () => {
  const [outreachType, setOutreachType] = useState("job");
  const [role, setRole] = useState("");
  const [target, setTarget] = useState("");
  const [message, setMessage] = useState("");
  const [cta, setCta] = useState("");
  const [results, setResults] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generate = () => {
    if (!role || !target) return;
    setIsLoading(true);
    setTimeout(() => {
      const type = outreachType === "freelance" ? "freelance services" : outreachType === "networking" ? "networking" : "job opportunity";
      setResults([
        `Subject: ${role} — Quick Introduction\n\nHi ${target},\n\nI'm reaching out regarding ${type}. ${message || `I believe my experience in ${role} could be valuable to your team.`}\n\n${cta || "Would you be open to a quick 15-minute call this week?"}\n\nBest regards,\n[Your Name]`,
        `Subject: Interested in ${role} Opportunities\n\nDear ${target},\n\n${message || `I've been following your work and I'm impressed by what you're building.`} As someone with experience in ${role}, I'd love to explore how I can contribute.\n\n${cta || "I'd appreciate 10 minutes of your time to discuss further."}\n\nThanks,\n[Your Name]`,
        `Subject: ${role} — Let's Connect\n\nHi ${target},\n\nHope this finds you well. ${message || `I'm a ${role} professional looking to connect regarding ${type}.`}\n\n${cta || "Could we schedule a brief chat?"}\n\nWarm regards,\n[Your Name]`,
      ]);
      setIsLoading(false);
    }, 1500);
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
        <select className="w-full rounded-lg border bg-background px-3 py-2 text-sm" value={outreachType} onChange={e => setOutreachType(e.target.value)}>
          <option value="job">Job Application</option>
          <option value="freelance">Freelance Pitch</option>
          <option value="networking">Networking</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Your Role / Service</label>
        <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., Full-Stack Developer" value={role} onChange={e => setRole(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Target Company or Person</label>
        <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., Sarah at Acme Corp" value={target} onChange={e => setTarget(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">Main Message (optional)</label>
        <textarea className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[80px]" placeholder="What do you want to say?" value={message} onChange={e => setMessage(e.target.value)} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1.5">CTA Preference (optional)</label>
        <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="e.g., Can we hop on a call?" value={cta} onChange={e => setCta(e.target.value)} />
      </div>
    </ToolLayout>
  );
};

export default ColdEmailGenerator;
