import React from "react";

interface HeroSectionProps {}

const HeroSection: React.FC<HeroSectionProps> = () => {
  return (
    <section className="text-center mb-12">
      <h2 className="text-3xl md:text-4xl font-bold mb-4">
        Create Amazing Profile Pictures
      </h2>
      <p className="text-neutral-300 max-w-2xl mx-auto mb-2">
        Upload your photo and create your Succinctlab PFP with one click GPROVE
      </p>
      <p className="text-neutral-400 max-w-2xl mx-auto text-sm">
        Try on our stylish clothing collection with our AI-powered virtual fitting tool. Perfect for social media profiles and avatars.
      </p>
    </section>
  );
};

export default HeroSection;
