import { Link } from 'react-router-dom';
import Navigation from '../components/landing/navigation';
import HeroSection from '../components/landing/hero-section';
import AboutSection from '../components/landing/about-section';
import FeaturesSection from '../components/landing/features-section';
import ReviewsSection from '../components/landing/reviews-section';
import FAQSection from '../components/landing/faq-section';
import Footer from '../components/landing/footer';

export default function LandingPage() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <AboutSection />
      <FeaturesSection />
      <ReviewsSection />
      <FAQSection />
      <Footer />
    </>
  );
}


