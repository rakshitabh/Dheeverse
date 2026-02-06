import { Star } from "lucide-react";

export default function ReviewsSection() {
  const reviews = [
    {
      name: "Sarah",
      role: "Mindfulness Enthusiast",
      review:
        "DheeVerse transformed how I approach my mental health. The prompts are thoughtful and the experience is calming.",
      rating: 5,
    },
    {
      name: "Michael",
      role: "Wellness Coach",
      review:
        "I recommend DheeVerse to all my clients. It's the perfect tool for daily reflection and emotional awareness.",
      rating: 5,
    },
    {
      name: "Emma",
      role: "Therapist",
      review:
        "A beautiful app that supports mindful living. My patients love the simplicity and elegance of the design.",
      rating: 5,
    },
  ];

  return (
    <section id="reviews" className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            What People Say
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Join thousands of people on their wellness journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-0.5">
                {[...Array(review.rating)].map((_, j) => (
                  <Star
                    key={j}
                    className="w-5 h-5 fill-emerald-500 text-emerald-500"
                  />
                ))}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed italic">
                "{review.review}"
              </p>
              <div className="pt-2">
                <p className="font-semibold text-gray-900">{review.name}</p>
                <p className="text-xs text-gray-500">{review.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
