import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";

const categories = ["Resume Writing", "Resume Summaries", "Cover Letters", "Cold Emails", "Job Search", "Career Growth"];

const PostEditor = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isNew = id === "new";

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [featuredImageUrl, setFeaturedImageUrl] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState("draft");
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (!session) { navigate("/admin/login"); return; }
    if (!isNew && id) loadPost(id);
  }, [session, id]);

  const loadPost = async (postId: string) => {
    const { data, error } = await supabase.from("blog_posts").select("*").eq("id", postId).single();
    if (error || !data) { toast({ title: "Error", description: "Post not found", variant: "destructive" }); navigate("/admin"); return; }
    setTitle(data.title);
    setSlug(data.slug);
    setMetaTitle(data.meta_title || "");
    setMetaDescription(data.meta_description || "");
    setCategory(data.category);
    setFeaturedImageUrl(data.featured_image_url || "");
    setExcerpt(data.excerpt || "");
    setContent(data.content);
    setStatus(data.status);
  };

  const generateSlug = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (isNew) setSlug(generateSlug(val));
  };

  const save = async (newStatus?: string) => {
    if (!title || !slug) { toast({ title: "Error", description: "Title and slug are required", variant: "destructive" }); return; }
    setSaving(true);
    const finalStatus = newStatus || status;
    const postData = {
      title, slug, meta_title: metaTitle || title, meta_description: metaDescription, category,
      featured_image_url: featuredImageUrl, excerpt, content, status: finalStatus,
      ...(finalStatus === "published" && status !== "published" ? { published_at: new Date().toISOString() } : {}),
    };

    let error;
    if (isNew) {
      ({ error } = await supabase.from("blog_posts").insert(postData));
    } else {
      ({ error } = await supabase.from("blog_posts").update(postData).eq("id", id));
    }

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved!", description: finalStatus === "published" ? "Post published." : "Draft saved." });
      navigate("/admin");
    }
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-section">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container flex items-center justify-between py-3">
          <button onClick={() => navigate("/admin")} className="text-sm text-body hover:text-primary">← Back</button>
          <div className="flex items-center gap-2">
            <button onClick={() => setPreview(!preview)} className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-secondary">
              {preview ? "Edit" : "Preview"}
            </button>
            <button onClick={() => save("draft")} disabled={saving} className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-secondary disabled:opacity-50">
              Save Draft
            </button>
            <button onClick={() => save("published")} disabled={saving} className="rounded-lg bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Saving..." : "Publish"}
            </button>
          </div>
        </div>
      </header>

      <main className="container py-6">
        {preview ? (
          <article className="max-w-3xl mx-auto prose prose-sm">
            <h1>{title}</h1>
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={title} onChange={e => handleTitleChange(e.target.value)} placeholder="Post title" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={slug} onChange={e => setSlug(e.target.value)} placeholder="post-url-slug" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Content (Markdown)</label>
                <textarea
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm font-mono min-h-[400px]"
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="Write your blog post in Markdown..."
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta Title</label>
                <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder="SEO title (defaults to post title)" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[80px]" value={metaDescription} onChange={e => setMetaDescription(e.target.value)} placeholder="SEO description (max 160 chars)" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Excerpt</label>
                <textarea className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm min-h-[60px]" value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Short preview text for blog listing" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Featured Image URL</label>
                <input className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={featuredImageUrl} onChange={e => setFeaturedImageUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={status} onChange={e => setStatus(e.target.value)}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default PostEditor;
