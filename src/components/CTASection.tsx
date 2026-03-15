import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const CTASection = () => (
  <section className="bg-primary py-16">
    <div className="container text-center">
      <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground">
        Ready to level up your job applications?
      </h2>
      <p className="mt-4 text-primary-foreground/80 max-w-xl mx-auto">
        Start using our free AI career tools today. No sign-up required.
      </p>
      <Link
        to="/tools"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-background px-6 py-3 text-sm font-semibold text-foreground hover:bg-background/90 transition-colors"
      >
        Get Started Free
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  </section>
);

export default CTASection;
