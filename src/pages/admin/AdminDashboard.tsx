import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Edit, Trash2, LogOut, Eye, EyeOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  status: string;
  updated_at: string;
}

const AdminDashboard = () => {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) { navigate("/admin/login"); return; }
    fetchPosts();
  }, [session]);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("id, title, slug, category, status, updated_at")
      .order("updated_at", { ascending: false });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setPosts(data || []);
    setLoading(false);
  };

  const deletePost = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"?`)) return;
    const { error } = await supabase.from("blog_posts").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Deleted", description: `"${title}" has been deleted.` });
    setPosts(posts.filter(p => p.id !== id));
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "published" ? "draft" : "published";
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === "published") updates.published_at = new Date().toISOString();
    const { error } = await supabase.from("blog_posts").update(updates).eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: newStatus === "published" ? "Published" : "Unpublished" });
    fetchPosts();
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><p>Loading...</p></div>;

  return (
    <div className="min-h-screen bg-section">
      <header className="border-b bg-card">
        <div className="container flex items-center justify-between py-4">
          <h1 className="font-display text-lg font-bold">Blog Admin</h1>
          <div className="flex items-center gap-3">
            <Link to="/" className="text-sm text-body hover:text-primary">← Back to site</Link>
            <button onClick={signOut} className="inline-flex items-center gap-1 text-sm text-body hover:text-destructive"><LogOut className="h-4 w-4" /> Logout</button>
          </div>
        </div>
      </header>
      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold">Posts ({posts.length})</h2>
          <Link to="/admin/posts/new" className="inline-flex items-center gap-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            <Plus className="h-4 w-4" /> New Post
          </Link>
        </div>
        {posts.length === 0 ? (
          <p className="text-body text-center py-12">No posts yet. Create your first one!</p>
        ) : (
          <div className="rounded-xl border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b bg-secondary/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">Title</th>
                  <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Category</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-right py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map(p => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <p className="font-medium">{p.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">/{p.slug}</p>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell text-muted-foreground">{p.category}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${p.status === "published" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleStatus(p.id, p.status)} className="p-1.5 rounded hover:bg-secondary" title={p.status === "published" ? "Unpublish" : "Publish"}>
                          {p.status === "published" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <Link to={`/admin/posts/${p.id}`} className="p-1.5 rounded hover:bg-secondary"><Edit className="h-4 w-4" /></Link>
                        <button onClick={() => deletePost(p.id, p.title)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
