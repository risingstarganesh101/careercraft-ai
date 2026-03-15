import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import ReactMarkdown from "react-markdown";

interface Post {
  title: string;
  content: string;
  category: string;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  featured_image_url: string | null;
}

const toolCTAs: Record<string, { label: string; href: string }> = {
  "Resume Writing": { label: "Try Resume Bullet Generator", href: "/tools/resume-bullet-generator" },
  "Resume Summaries": { label: "Try Resume Summary Generator", href: "/tools/resume-summary-generator" },
  "Cover Letters": { label: "Try Cover Letter Generator", href: "/tools/cover-letter-generator" },
  "Cold Emails": { label: "Try Cold Email Generator", href: "/tools/cold-email-generator" },
};

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("title, content, category, meta_title, meta_description, published_at, featured_image_url")
        .eq("slug", slug)
        .eq("status", "published")
        .single();
      if (error || !data) { setNotFound(true); }
      else { setPost(data); }
      setLoading(false);
    };
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post) {
      document.title = post.meta_title || post.title;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && post.meta_description) metaDesc.setAttribute("content", post.meta_description);
    }
  }, [post]);

  if (loading) return <><Navbar /><main className="py-16 container max-w-3xl mx-auto"><div className="h-8 w-2/3 bg-secondary animate-pulse rounded mb-4" /><div className="space-y-2">{[1,2,3].map(i => <div key={i} className="h-4 bg-secondary animate-pulse rounded" />)}</div></main><Footer /></>;
  if (notFound) return <><Navbar /><main className="py-16 container max-w-3xl mx-auto text-center"><h1 className="font-display text-2xl font-bold">Article Not Found</h1><p className="mt-2 text-body">This article doesn't exist or hasn't been published yet.</p><Link to="/blog" className="mt-4 inline-block text-primary hover:underline">← Back to Blog</Link></main><Footer /></>;

  const cta = toolCTAs[post!.category] || toolCTAs["Resume Writing"];

  return (
    <>
      <Navbar />
      <main className="py-16">
        <article className="container max-w-3xl mx-auto">
          <Link to="/blog" className="text-sm text-primary hover:underline mb-6 inline-block">← Back to Blog</Link>
          <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground mb-4">{post!.category}</span>
          <h1 className="font-display text-3xl md:text-4xl font-bold leading-tight">{post!.title}</h1>
          {post!.published_at && (
            <p className="mt-2 text-sm text-muted-foreground">{new Date(post!.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
          )}
          {post!.featured_image_url && (
            <img src={post!.featured_image_url} alt={post!.title} className="mt-6 rounded-xl w-full object-cover max-h-96" />
          )}
          <div className="mt-8 prose prose-sm max-w-none prose-headings:font-display prose-headings:text-heading prose-p:text-body prose-a:text-primary">
            <ReactMarkdown>{post!.content}</ReactMarkdown>
          </div>

          <div className="mt-12 rounded-xl border-2 border-primary/20 bg-primary/5 p-6 text-center">
            <h3 className="font-display font-bold text-lg">Try our AI career tools</h3>
            <p className="mt-2 text-sm text-body">Generate professional content in seconds — completely free.</p>
            <Link to={cta.href} className="mt-4 inline-flex items-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              {cta.label}
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
};

export default BlogPost;
