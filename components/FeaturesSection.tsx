import { FeaturesSectionProps } from "@/types/homePage";

export default function FeaturesSection({
  title = "Why Join Us?",
  features,
  className = "",
}: FeaturesSectionProps) {
  return (
    <section className={`py-16 ${className}`}>
      <h2 className="text-3xl font-bold text-center text-secondary-foreground mb-12">
        {title}
      </h2>
      <div className="grid md:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          return (
            <div
              key={index}
              className="text-center p-6 bg-card text-card-foreground rounded-lg border border-border"
            >
              <IconComponent className="h-12 w-12 text-primary mx-auto mb-4" />
              <h3 className="text-xl text-card-foreground font-semibold mb-3">
                {feature.title}
              </h3>
              <p className="text-primary">{feature.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
