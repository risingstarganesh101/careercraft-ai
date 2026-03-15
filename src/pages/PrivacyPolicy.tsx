import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => (
  <>
    <Navbar />
    <main className="py-16">
      <div className="container max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold">Privacy Policy</h1>
        <div className="mt-6 space-y-4 text-body leading-relaxed text-sm">
          <p>Last updated: March 2026</p>
          <h2 className="text-lg font-semibold text-foreground pt-4">Information We Collect</h2>
          <p>CareerToolkit AI does not require user accounts. We do not store any personal data, resume content, or generated outputs. All tool inputs are processed in real-time and not saved.</p>
          <h2 className="text-lg font-semibold text-foreground pt-4">Analytics</h2>
          <p>We may use privacy-focused analytics tools to understand how visitors use our website. No personally identifiable information is collected.</p>
          <h2 className="text-lg font-semibold text-foreground pt-4">Contact</h2>
          <p>If you have questions about this policy, please contact us through our contact page.</p>
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default PrivacyPolicy;
