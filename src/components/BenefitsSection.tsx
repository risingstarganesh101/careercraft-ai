import { Zap, Target, Clock, Shield } from "lucide-react";

const benefits = [
  { icon: Zap, title: "AI-Powered Quality", desc: "Professional-grade output trained on thousands of successful resumes and emails." },
  { icon: Target, title: "ATS-Optimized", desc: "Generated text uses the right keywords to pass applicant tracking systems." },
  { icon: Clock, title: "Save Hours", desc: "Create polished career documents in minutes instead of hours." },
  { icon: Shield, title: "100% Free", desc: "No sign-up, no credit card. Just open a tool and start generating." },
];

const BenefitsSection = () => (
  <section className="bg-section py-20">
    <div className="container">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold">Why Use CareerToolkit AI?</h2>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {benefits.map((b, i) => (
          <div key={i} className="rounded-xl border bg-card p-6">
            <b.icon className="h-6 w-6 text-primary mb-3" />
            <h3 className="font-display font-semibold text-base">{b.title}</h3>
            <p className="mt-2 text-sm text-body leading-relaxed">{b.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default BenefitsSection;
