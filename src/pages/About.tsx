import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const About = () => (
  <>
    <Navbar />
    <main className="py-16">
      <div className="container max-w-3xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold">About CareerToolkit AI</h1>
        <div className="mt-6 space-y-4 text-body leading-relaxed">
          <p>CareerToolkit AI is a free suite of AI-powered tools designed to help job seekers, freshers, and professionals create better career documents in minutes.</p>
          <p>We believe everyone deserves access to professional-quality resume writing and job application tools — regardless of their background or budget.</p>
          <p>Our tools use advanced AI to generate polished resume bullet points, professional summaries, tailored cover letters, and compelling outreach emails. All for free, with no sign-up required.</p>
        </div>
      </div>
    </main>
    <Footer />
  </>
);

export default About;
