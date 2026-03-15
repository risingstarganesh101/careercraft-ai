import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const BlogPost = () => {
  const { slug } = useParams();

  return (
    <>
      <Navbar />
      <main className="py-16">
        <article className="container max-w-3xl mx-auto">
          <Link to="/blog" className="text-sm text-primary hover:underline mb-6 inline-block">← Back to Blog</Link>
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">
            {slug?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
          </h1>
          <p className="mt-4 text-body leading-relaxed">
            This article is coming soon. We're working on creating comprehensive, actionable content to help you in your career journey.
          </p>

          {/* CTA Block */}
          <div className="mt-12 rounded-xl border-2 border-primary/20 bg-primary/5 p-6 text-center">
            <h3 className="font-display font-bold text-lg">Try our AI career tools</h3>
            <p className="mt-2 text-sm text-body">Generate professional resume bullets, summaries, and more — for free.</p>
            <Link to="/tools" className="mt-4 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              Try Free Tools
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
};

export default BlogPost;
