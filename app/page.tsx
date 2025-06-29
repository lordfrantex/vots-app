import React from "react";
import HeroSection from "@/components/layouts/home/hero-section/hero";
import HowItWorksSection from "@/components/layouts/home/how-it-works-section/how-it-works";
import WhoIsItForSection from "@/components/layouts/home/who-is-it-for-section/who-is-it-for";
import WhyBlockchainSection from "@/components/layouts/home/why-blockchain-section/why-blockchain";
import DeveloperSection from "@/components/layouts/home/developer-section/developer";
import ElectionTestimonialsSection from "@/components/layouts/home/testimonials-section/testimonials";
import FinalCtaSection from "@/components/layouts/home/final-cta-section/final-cta";

const HomePage = () => {
  return (
    <div className="min-h-full overflow-x-hidden">
      <HeroSection />
      <HowItWorksSection />
      <WhoIsItForSection />
      <WhyBlockchainSection />
      <DeveloperSection />
      <ElectionTestimonialsSection />
      <FinalCtaSection />
    </div>
  );
};
export default HomePage;
