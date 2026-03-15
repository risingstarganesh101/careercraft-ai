import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const posts = [
  { title: "25 Resume Bullet Point Examples for Freshers", slug: "resume-bullet-point-examples-freshers", category: "Resume Writing" },
  { title: "How to Write a Cover Letter With No Experience", slug: "cover-letter-no-experience", category: "Cover Letters" },
  { title: "Cold Email Templates for Job Seekers", slug: "cold-email-templates-job-seekers", category: "Cold Emails" },
];

const BlogPreview = () => (
  <section className="py-20">
    <div className="container">
      <div className="flex items-end justify-between mb-10">
        <div>
          <h2 className="font-display text-3xl md:text-4xl font-bold">Career Guides</h2>
          <p className="mt-2 text-body">Practical tips and examples to accelerate your job search.</p>
        </div>
        <Link to="/blog" className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          View all <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        {posts.map((p) => (
          <Link
            key={p.slug}
            to={`/blog/${p.slug}`}
            className="group rounded-xl border bg-card p-6 hover:border-primary/30 transition-colors"
          >
            <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground mb-3">
              {p.category}
            </span>
            <h3 className="font-display font-semibold text-base group-hover:text-primary transition-colors leading-snug">
              {p.title}
            </h3>
          </Link>
        ))}
      </div>

      <div className="mt-6 text-center sm:hidden">
        <Link to="/blog" className="text-sm font-medium text-primary hover:underline">View all guides →</Link>
      </div>
    </div>
  </section>
);

export default BlogPreview;
