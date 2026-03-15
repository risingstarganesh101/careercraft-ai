import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Contact = () => (
  <>
    <Navbar />
    <main className="py-16">
      <div className="container max-w-xl mx-auto">
        <h1 className="font-display text-3xl md:text-4xl font-bold">Contact Us</h1>
        <p className="mt-3 text-body">Have a question or suggestion? We'd love to hear from you.</p>
        <form className="mt-8 space-y-4" onSubmit={e => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium mb-1.5">Name</label>
            <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input className="w-full rounded-lg border bg-background px-3 py-2 text-sm" placeholder="you@example.com" type="email" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Message</label>
            <textarea className="w-full rounded-lg border bg-background px-3 py-2 text-sm min-h-[120px]" placeholder="Your message..." />
          </div>
          <button className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
            Send Message
          </button>
        </form>
      </div>
    </main>
    <Footer />
  </>
);

export default Contact;
