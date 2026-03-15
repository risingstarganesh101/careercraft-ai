import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { FileText, AlignLeft, Mail, Send } from "lucide-react";

const tools = [
  { title: "Resume Bullet Point Generator", desc: "Turn simple job tasks into powerful, professional resume bullet points.", icon: FileText, href: "/tools/resume-bullet-generator" },
  { title: "Resume Summary Generator", desc: "Generate polished professional summary paragraphs in seconds.", icon: AlignLeft, href: "/tools/resume-summary-generator" },
  { title: "Cover Letter Generator", desc: "Create tailored cover letters matched to any job posting.", icon: Mail, href: "/tools/cover-letter-generator" },
  { title: "Cold Email / Outreach Generator", desc: "Write compelling outreach emails for jobs, freelance, or networking.", icon: Send, href: "/tools/cold-email-generator" },
];

const ToolsIndex = () => (
  <>
    <Navbar />
    <main className="py-16">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Free AI Career Tools</h1>
          <p className="mt-3 text-body">Pick a tool and start generating professional career content in seconds.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {tools.map(t => (
            <Link key={t.href} to={t.href} className="group rounded-xl border bg-card p-6 hover:border-primary/30 transition-colors">
              <t.icon className="h-8 w-8 text-primary mb-4" />
              <h2 className="font-display text-lg font-semibold group-hover:text-primary transition-colors">{t.title}</h2>
              <p className="mt-2 text-sm text-body">{t.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default ToolsIndex;
