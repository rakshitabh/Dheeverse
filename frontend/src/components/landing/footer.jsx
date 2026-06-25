// 
import { Link } from "react-router-dom";
import { Mail, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-white border-t border-gray-200 py-10 px-4"
    >
      <div className="max-w-6xl mx-auto">

        <div className="grid md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-emerald-600">
              DheeVerse
            </h3>

            <p className="mt-3 text-sm text-gray-600 leading-relaxed">
              An AI-powered wellness journaling platform that helps users
              understand their emotions, build healthier habits, and improve
              mental well-being through personalized insights.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              Quick Links
            </h4>

            <ul className="space-y-3 text-sm text-gray-600">
              <li>
                <a
                  href="#features"
                  className="hover:text-emerald-600 transition"
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="#reviews"
                  className="hover:text-emerald-600 transition"
                >
                  Reviews
                </a>
              </li>

              <li>
                <Link
                  to="/signup"
                  className="hover:text-emerald-600 transition"
                >
                  Get Started
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">
              Contact
            </h4>

            <div className="space-y-3">

              <a
                href="mailto:rakshitalbhat07@gmail.com"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-emerald-600 transition"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        <div className="border-t border-gray-200 mt-10 pt-6">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} DheeVerse. Built with ❤️
          </p>
        </div>

      </div>
    </footer>
  );
}