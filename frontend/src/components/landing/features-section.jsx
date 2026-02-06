import { Heart, BookOpen, TrendingUp, Lock } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: BookOpen,
      title: "Guided Journaling",
      description:
        "Thoughtfully crafted prompts to help you reflect deeply and grow.",
    },
    {
      icon: Heart,
      title: "Emotional Tracking",
      description:
        "Track your moods and discover patterns in your emotional journey.",
    },
    {
      icon: TrendingUp,
      title: "Progress Insights",
      description:
        "Visualize your growth with beautiful charts and meaningful analytics.",
    },
    {
      icon: Lock,
      title: "Complete Privacy",
      description:
        "Your entries are encrypted and stored securely, always private.",
    },
  ];

  return (
    <section id="features" className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Features
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Everything you need for a transformative wellness journey
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div
                key={i}
                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg hover:border-emerald-200 transition-all duration-300 space-y-3"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
