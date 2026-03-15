import { motion } from "framer-motion";

const steps = [
  { step: "1", title: "Choose a Tool", desc: "Pick the career tool that fits your need." },
  { step: "2", title: "Fill in Details", desc: "Enter your job title, skills, and context." },
  { step: "3", title: "Get AI Results", desc: "Receive polished, professional text instantly." },
  { step: "4", title: "Copy & Use", desc: "Copy the output directly into your resume or email." },
];

const HowItWorks = () => (
  <section className="py-20">
    <div className="container">
      <div className="text-center mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-bold">How It Works</h2>
        <p className="mt-3 text-body">Four simple steps to better career documents.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-4xl mx-auto">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            className="text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-display font-bold text-lg mb-4">
              {s.step}
            </div>
            <h3 className="font-display font-semibold text-base">{s.title}</h3>
            <p className="mt-2 text-sm text-body">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
