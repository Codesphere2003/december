import { useEffect, useState } from "react";

const stats = [
  { number: 44, label: "Total Cases" },
  { number: 22, label: "In Progress" },
  { number: 22, label: "In court" },
  { number: 0, label: "Completed" },
];

const CourtCases = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="bg-dark-section py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-display text-primary-foreground text-center mb-4">
          Court Cases
        </h2>
        <div className="w-24 h-1 bg-saffron mx-auto mb-12" />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div
                className={`text-5xl md:text-6xl font-display text-saffron mb-2 transition-all duration-1000 ${
                  animated ? "opacity-100 scale-100" : "opacity-0 scale-50"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {stat.number}
              </div>
              <p className="text-primary-foreground/70 text-sm uppercase tracking-wider">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CourtCases;
