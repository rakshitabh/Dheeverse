import { Link } from "react-router-dom";
import { Mail, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer
      id="contact"
      className="bg-white border-t border-gray-200 py-12 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-emerald-600">DheeVerse</h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Build a healthier mind every day.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">
              Product
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
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

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">
              Resources
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>
                <a href="#" className="hover:text-emerald-600 transition">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-600 transition">
                  Privacy
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-600 transition">
                  Terms
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">
              Contact
            </h4>
            <div className="flex gap-4">
              <a
                href="mailto:support@wellness.app"
                className="text-gray-600 hover:text-emerald-600 transition"
              >
                <Mail className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-emerald-600 transition"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-600 hover:text-emerald-600 transition"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} DheeVerse. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
