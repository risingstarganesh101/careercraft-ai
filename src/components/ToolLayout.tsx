import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";
import { Copy, RefreshCw, Loader2, Check, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import UpgradeModal from "@/components/UpgradeModal";
import { canGenerate, getRemainingGenerations, recordGeneration, DAILY_GENERATION_LIMIT } from "@/hooks/useUsageLimit";

interface ToolLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  results: string[] | null;
  isLoading: boolean;
  onGenerate: () => void;
  onRegenerate: () => void;
  relatedTools: { title: string; href: string }[];
  faqs: { q: string; a: string }[];
}

const ToolLayout = ({ title, subtitle, children, results, isLoading, onGenerate, onRegenerate, relatedTools, faqs }: ToolLayoutProps) => {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [remaining, setRemaining] = useState(getRemainingGenerations);

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleGenerate = () => {
    if (!canGenerate()) {
      setShowUpgrade(true);
      return;
    }
    recordGeneration(); // optimistic client-side decrement
    setRemaining(getRemainingGenerations());
    onGenerate();
    // remaining will be corrected via syncRemaining() after server responds
    setTimeout(() => setRemaining(getRemainingGenerations()), 3000);
  };

  const handleRegenerate = () => {
    if (!canGenerate()) {
      setShowUpgrade(true);
      return;
    }
    recordGeneration();
    setRemaining(getRemainingGenerations());
    onRegenerate();
    setTimeout(() => setRemaining(getRemainingGenerations()), 3000);
  };

  return (
    <>
      <Navbar />
      <main className="py-12">
        <div className="container">
          <div className="max-w-3xl mx-auto mb-8">
            <h1 className="font-display text-3xl md:text-4xl font-bold">{title}</h1>
            <p className="mt-2 text-body">{subtitle}</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Input side */}
            <div className="rounded-xl border bg-card p-6">
              <div className="space-y-4">
                {children}
              </div>
              <button
                onClick={handleGenerate}
                disabled={isLoading}
                className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</> : "Generate"}
              </button>

              {/* Usage counter */}
              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                <span>
                  {remaining}/{DAILY_GENERATION_LIMIT} free generations remaining today
                </span>
              </div>
            </div>

            {/* Output side */}
            <div className="rounded-xl border bg-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-sm">Results</h3>
                {results && (
                  <button onClick={handleRegenerate} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                    <RefreshCw className="h-3 w-3" /> Regenerate
                  </button>
                )}
              </div>

              {isLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded-lg bg-secondary animate-pulse" />
                  ))}
                </div>
              )}

              {!isLoading && !results && (
                <p className="text-sm text-muted-foreground py-12 text-center">
                  Fill in the form and click Generate to see results.
                </p>
              )}

              {!isLoading && results && (
                <div className="space-y-3">
                  {results.map((r, i) => (
                    <div key={i} className="rounded-lg border p-4 text-sm leading-relaxed">
                      <p className="whitespace-pre-wrap">{r}</p>
                      <button
                        onClick={() => copyText(r, i)}
                        className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        {copiedIdx === i ? <><Check className="h-3 w-3" /> Copied</> : <><Copy className="h-3 w-3" /> Copy</>}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* FAQ */}
          {faqs.length > 0 && (
            <div className="max-w-3xl mx-auto mt-16">
              <h2 className="font-display text-2xl font-bold mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((f, i) => (
                  <div key={i} className="rounded-xl border p-5">
                    <h3 className="font-display font-semibold text-sm">{f.q}</h3>
                    <p className="mt-2 text-sm text-body">{f.a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related tools */}
          <div className="max-w-3xl mx-auto mt-12">
            <h3 className="font-display font-semibold text-lg mb-4">Related Tools</h3>
            <div className="flex flex-wrap gap-3">
              {relatedTools.map(t => (
                <Link
                  key={t.href}
                  to={t.href}
                  className="rounded-lg border px-4 py-2 text-sm font-medium hover:border-primary/30 hover:text-primary transition-colors"
                >
                  {t.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      <UpgradeModal open={showUpgrade} onClose={() => setShowUpgrade(false)} />
    </>
  );
};

export default ToolLayout;
