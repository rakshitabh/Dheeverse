import { Link } from "react-router-dom";

export default function HeroSection() {
  return (
    <section id="home" className="py-16 md:py-24 px-4 bg-white">
      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Build a Healthier Mind{" "}
              <span className="text-emerald-600">Every Day</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-lg leading-relaxed">
              DheeVerse is your personal wellness companion. Journey through
              mindful journaling, emotional reflection, and growth.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/login"
              className="bg-emerald-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-emerald-700 transition text-center shadow-md"
            >
              Start Your Journey
            </Link>
            <Link
              to="/signup"
              className="border-2 border-gray-300 text-gray-700 px-8 py-3.5 rounded-full font-semibold hover:border-emerald-600 hover:text-emerald-600 transition text-center"
            >
              Create Account
            </Link>
          </div>

          <div className="pt-4 space-y-1 text-sm text-gray-600">
            <p className="flex items-center gap-2">
              <span className="text-emerald-600">✓</span> Completely private &
              secure
            </p>
            <p className="flex items-center gap-2">
              <span className="text-emerald-600">✓</span> No ads or distractions
            </p>
            <p className="flex items-center gap-2">
              <span className="text-emerald-600">✓</span> Available on all
              devices
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl">
            <img
              src="/meditation.jpg"
              alt="Woman meditating in peaceful nature setting"
              className="w-full h-full object-cover aspect-square"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
