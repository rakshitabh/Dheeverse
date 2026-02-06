import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is Dheeverse?",
      answer: "Dheeverse is a comprehensive mental wellness and journaling platform designed to help you track your emotions, reflect on your thoughts, and improve your overall well-being through guided journaling, mood tracking, and wellness activities."
    },
    {
      question: "Is my journal data private and secure?",
      answer: "Absolutely. Your privacy is our top priority. All journal entries are encrypted and stored securely. We never share your personal data with third parties, and only you have access to your entries."
    },
    {
      question: "How does mood tracking work?",
      answer: "Our mood tracking feature allows you to log your emotional state throughout the day. You can tag entries with specific emotions, and over time, our analytics will help you identify patterns and triggers in your emotional journey."
    },
    {
      question: "Can I access my journal from multiple devices?",
      answer: "Yes! Your journal is stored in the cloud, so you can access it from any device with an internet connection. Simply log in to your account, and all your entries will be synced and available."
    },
    {
      question: "What wellness activities are available?",
      answer: "Dheeverse offers a variety of wellness activities including guided meditation, breathing exercises, relaxing sounds, journaling prompts, and interactive games designed to help you relax and destress."
    },
    {
      question: "Is there a mobile app?",
      answer: "Currently, Dheeverse is available as a web application that works great on mobile browsers. We're working on dedicated mobile apps for iOS and Android, which will be available soon."
    },
    {
      question: "How much does Dheeverse cost?",
      answer: "Dheeverse offers a free tier with core journaling and mood tracking features. Premium features and advanced analytics are available through our subscription plans. Check our pricing page for more details."
    },
    {
      question: "Can I export my journal entries?",
      answer: "Yes, you can export your journal entries at any time. We believe your data belongs to you, and we make it easy to download your entries in various formats."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 px-4 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-base md:text-lg text-gray-600">
            Find answers to common questions about Dheeverse
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-all duration-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors duration-200"
              >
                <h3 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-emerald-600 flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <p className="px-6 pb-5 text-gray-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
