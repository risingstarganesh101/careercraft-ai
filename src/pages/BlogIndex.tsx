import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const categories = ["All", "Resume Writing", "Resume Summaries", "Cover Letters", "Cold Emails", "Job Search", "Career Growth"];

interface Post {
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
}

const BlogIndex = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const { data } = await supabase
        .from("blog_posts")
        .select("title, slug, category, excerpt")
        .eq("status", "published")
        .order("published_at", { ascending: false });
      setPosts(data || []);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const filtered = activeCategory === "All" ? posts : posts.filter(p => p.category === activeCategory);

  return (
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
              <button
                key={c}
                onClick={() => setActiveCategory(c)}
                className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${activeCategory === c ? "border-primary bg-primary text-primary-foreground" : "text-body cursor-pointer hover:border-primary/30 hover:text-primary"}`}
              >
                {c}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {[1,2,3].map(i => <div key={i} className="rounded-xl border bg-card p-5 h-32 animate-pulse" />)}
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-body py-12">No articles yet. Check back soon!</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {filtered.map(p => (
                <Link key={p.slug} to={`/blog/${p.slug}`} className="group rounded-xl border bg-card p-5 hover:border-primary/30 transition-colors">
                  <span className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground mb-3">{p.category}</span>
                  <h2 className="font-display font-semibold text-base group-hover:text-primary transition-colors leading-snug">{p.title}</h2>
                  {p.excerpt && <p className="mt-2 text-sm text-body line-clamp-2">{p.excerpt}</p>}
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BlogIndex;
