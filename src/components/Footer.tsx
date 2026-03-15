import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t bg-section">
    <div className="container py-12">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-display text-lg font-bold text-foreground">
            CareerToolkit <span className="text-primary">AI</span>
          </Link>
          <p className="mt-3 text-sm text-body leading-relaxed">
            AI-powered career tools to help you land your next opportunity faster.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Tools</h4>
          <ul className="space-y-2 text-sm text-body">
            <li><Link to="/tools/resume-bullet-generator" className="hover:text-foreground transition-colors">Resume Bullets</Link></li>
            <li><Link to="/tools/resume-summary-generator" className="hover:text-foreground transition-colors">Resume Summary</Link></li>
            <li><Link to="/tools/cover-letter-generator" className="hover:text-foreground transition-colors">Cover Letter</Link></li>
            <li><Link to="/tools/cold-email-generator" className="hover:text-foreground transition-colors">Cold Email</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Resources</h4>
          <ul className="space-y-2 text-sm text-body">
            <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
            <li><Link to="/about" className="hover:text-foreground transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm text-body">
            <li><Link to="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
          </ul>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t text-center text-sm text-body">
        © {new Date().getFullYear()} CareerToolkit AI. All rights reserved.
      </div>
    </div>
  </footer>
);

export default Footer;
