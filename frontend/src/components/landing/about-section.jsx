import { Users, Target, Sparkles } from "lucide-react";

export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 bg-gradient-to-b from-emerald-50 to-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            About DheeVerse
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Empowering individuals to achieve mental wellness through mindful journaling and self-reflection
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                Our Mission
              </h3>
              <p className="text-gray-600 leading-relaxed">
                At DheeVerse, we believe that everyone deserves a safe space to explore their thoughts and emotions. 
                Our mission is to make mental wellness accessible, private, and transformative through the power of journaling.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We combine cutting-edge technology with evidence-based wellness practices to help you understand 
                your emotions, track your progress, and build lasting habits for a healthier mind.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <Target className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Purpose-Driven</h4>
                  <p className="text-sm text-gray-600">
                    Built with a focus on helping you achieve genuine personal growth and emotional well-being
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Community-Focused</h4>
                  <p className="text-sm text-gray-600">
                    Join thousands of users who are taking control of their mental wellness journey
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-100 p-3 rounded-xl">
                  <Sparkles className="w-6 h-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-2">Innovation</h4>
                  <p className="text-sm text-gray-600">
                    Leveraging AI and modern technology to provide personalized insights and recommendations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-emerald-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">
            Why Choose DheeVerse?
          </h3>
          <div className="grid md:grid-cols-3 gap-8 mt-8">
            <div>
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-emerald-100">Private & Secure</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">AI-Powered</div>
              <div className="text-emerald-100">Smart Insights</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-emerald-100">Always Available</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
