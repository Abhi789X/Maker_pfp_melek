import React from "react";
import { CloudUpload, Shirt, CloudDownload } from "lucide-react";

interface FeaturesSectionProps {}

const FeaturesSection: React.FC<FeaturesSectionProps> = () => {
  return (
    <section className="mt-16 mb-12" id="features">
      <h2 className="section-title">How It Works</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="feature-card">
          <div className="feature-icon">
            <CloudUpload className="text-2xl text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">1. Upload Your Photo</h3>
          <p className="text-neutral-400">
            Upload any photo with a clear pose. Our AI works best with frontal or 3/4 view poses.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <Shirt className="text-2xl text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">2. Choose Clothing</h3>
          <p className="text-neutral-400">
            Select from our collection of virtual clothes. AI automatically fits them to your pose.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">
            <CloudDownload className="text-2xl text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">3. Download Result</h3>
          <p className="text-neutral-400">
            Fine-tune the position if needed, then download your image with the virtual clothing overlay.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
