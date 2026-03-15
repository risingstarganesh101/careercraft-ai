import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, AlignLeft, Mail, Send } from "lucide-react";

const tools = [
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
];

const ToolsGrid = () => (
  <section className="bg-section py-20">
    <div className="container">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold">AI-Powered Career Tools</h2>
        <p className="mt-3 text-body max-w-xl mx-auto">
          Four specialized tools to help you stand out in your job search.
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
      </div>
    </div>
  </section>
);

export default ToolsGrid;
