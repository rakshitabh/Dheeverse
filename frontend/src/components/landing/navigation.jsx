import { Link } from "react-router-dom";
import { Menu } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center gap-2 hover:opacity-90 transition"
            >
              <img 
                src="/dheverse-logo.jpg" 
                alt="DheeVerse Logo" 
                className="h-10 w-10 rounded-lg object-cover" 
              />
              <span className="text-xl font-bold text-emerald-600">
                DheeVerse
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#home"
              className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition"
            >
              Home
            </a>
            <a
              href="#about"
              className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition"
            >
              About
            </a>
            <a
              href="#features"
              className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition"
            >
              Features
            </a>
            <a
              href="#reviews"
              className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition"
            >
              Reviews
            </a>
            <a
              href="#contact"
              className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition"
            >
              Contact
            </a>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition px-4 py-2"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-emerald-600 text-white px-6 py-2 rounded-full text-sm font-semibold hover:bg-emerald-700 transition shadow-sm"
            >
              Sign Up
            </Link>
          </div>

          <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
            <Menu className="w-6 h-6 text-foreground" />
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden pb-4 space-y-3">
            <a
              href="#home"
              className="block text-foreground hover:text-primary"
            >
              Home
            </a>
            <a
              href="#about"
              className="block text-foreground hover:text-primary"
            >
              About
            </a>
            <a
              href="#features"
              className="block text-foreground hover:text-primary"
            >
              Features
            </a>
            <a
              href="#reviews"
              className="block text-foreground hover:text-primary"
            >
              Reviews
            </a>
            <a
              href="#contact"
              className="block text-foreground hover:text-primary"
            >
              Contact
            </a>
            <div className="pt-2 space-y-2">
              <Link
                to="/login"
                className="block text-foreground hover:text-primary"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="block bg-primary text-primary-foreground px-4 py-2 rounded-full text-center font-medium"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
