import { Link } from "react-router-dom";
import Countdown from "@/components/Countdown";

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-20">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="wedding-title mb-6">Ivana & Nikola</h1>
          <p className="wedding-subtitle mb-4">
            Pozivamo vas da podelite sa nama najlepši dan našeg života
          </p>
          <div
            className="text-xl md:text-2xl font-medium"
            style={{ color: "hsl(var(--wedding-text-muted))" }}>
            <span className="inline-block mx-2">2</span>
            <span className="inline-block mx-2">·</span>
            <span className="inline-block mx-2">novembar</span>
            <span className="inline-block mx-2">·</span>
            <span className="inline-block mx-2">2025</span>
          </div>
        </div>

        <Countdown />
      </div>
    </div>
  );
};

export default Index;
