import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const categories = ["All", "Resume Writing", "Resume Summaries", "Cover Letters", "Cold Emails", "Job Search"];

const posts = [
  { title: "25 Resume Bullet Point Examples for Freshers", slug: "resume-bullet-point-examples-freshers", category: "Resume Writing" },
  { title: "Best Resume Action Verbs for Stronger Applications", slug: "resume-action-verbs", category: "Resume Writing" },
  { title: "How to Write Resume Achievements With Examples", slug: "resume-achievements-examples", category: "Resume Writing" },
  { title: "Resume Summary Examples for Freshers", slug: "resume-summary-examples-freshers", category: "Resume Summaries" },
  { title: "Professional Summary Examples by Job Role", slug: "professional-summary-examples", category: "Resume Summaries" },
  { title: "Cover Letter Examples for Job Applications", slug: "cover-letter-examples", category: "Cover Letters" },
  { title: "How to Write a Cover Letter With No Experience", slug: "cover-letter-no-experience", category: "Cover Letters" },
  { title: "Cold Email Templates for Job Seekers", slug: "cold-email-templates-job-seekers", category: "Cold Emails" },
  { title: "Best Job Outreach Email Examples", slug: "job-outreach-email-examples", category: "Cold Emails" },
  { title: "How to Apply for Jobs More Effectively", slug: "apply-jobs-effectively", category: "Job Search" },
];

const BlogIndex = () => (
  <>
    <Navbar />
    <main className="py-16">
      <div className="container">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold">Career Guides & Tips</h1>
          <p className="mt-3 text-body">Practical advice, templates, and examples to land your next role.</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map(c => (
            <span key={c} className="rounded-full border px-4 py-1.5 text-xs font-medium text-body cursor-pointer hover:border-primary/30 hover:text-primary transition-colors">
              {c}
            </span>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {posts.map(p => (
            <Link key={p.slug} to={`/blog/${p.slug}`} className="group rounded-xl border bg-card p-5 hover:border-primary/30 transition-colors">
              <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground mb-3">{p.category}</span>
              <h2 className="font-display font-semibold text-base group-hover:text-primary transition-colors leading-snug">{p.title}</h2>
            </Link>
          ))}
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default BlogIndex;
