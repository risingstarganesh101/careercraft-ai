import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="font-display text-xl font-bold text-foreground">
          CareerToolkit <span className="text-primary">AI</span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          <Link to="/tools" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Tools</Link>
          <Link to="/blog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Blog</Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</Link>
          <Link to="/contact" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
          <Link to="/tools" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
            Try Free Tools
          </Link>
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t bg-background px-6 py-4 space-y-3">
          <Link to="/tools" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Tools</Link>
          <Link to="/blog" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Blog</Link>
          <Link to="/about" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>About</Link>
          <Link to="/contact" className="block text-sm font-medium text-muted-foreground" onClick={() => setOpen(false)}>Contact</Link>
          <Link to="/tools" className="block rounded-lg bg-primary px-4 py-2 text-center text-sm font-medium text-primary-foreground" onClick={() => setOpen(false)}>Try Free Tools</Link>
        </div>
      )}
    </header>
  );
};

export default Navbar;
