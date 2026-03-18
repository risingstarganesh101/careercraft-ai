import { DAILY_GENERATION_LIMIT } from "@/hooks/useUsageLimit";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
}

const UpgradeModal = ({ open, onClose }: UpgradeModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-xl mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <span className="text-2xl">⚡</span>
          </div>
          <h2 className="font-display text-xl font-bold">Daily Limit Reached</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            You've used all {DAILY_GENERATION_LIMIT} free generations for today. Come back tomorrow or upgrade for unlimited access.
          </p>
        </div>

        <div className="mt-6 rounded-xl border-2 border-primary/20 bg-primary/5 p-5">
          <h3 className="font-display font-semibold text-sm">Pro Plan — Coming Soon</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Unlimited generations
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Priority AI processing
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Save & export history
            </li>
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            disabled
            className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground opacity-60 cursor-not-allowed"
          >
            Upgrade — Coming Soon
          </button>
          <button
            onClick={onClose}
            className="w-full rounded-lg border px-4 py-2.5 text-sm font-medium hover:bg-secondary transition-colors"
          >
            Try Again Tomorrow
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
