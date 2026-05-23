import { ChefHat, Shirt, Snowflake, Utensils, ArrowRight } from "lucide-react";

const WIZARDS = [
  {
    icon: ChefHat,
    title: "Kitchen Design Wizard",
    description: "Plan your commercial kitchen end-to-end.",
    href: "#",
  },
  {
    icon: Shirt,
    title: "Laundry Design Wizard",
    description: "Spec a full hotel or hospital laundry room.",
    href: "#",
  },
  {
    icon: Snowflake,
    title: "Cold Room Planner",
    description: "Size walk-in chillers and freezers correctly.",
    href: "#",
  },
  {
    icon: Utensils,
    title: "Dishwashing Area Wizard",
    description: "Layout a pass-through or rack-conveyor zone.",
    href: "#",
  },
];

const ProjectWizardGrid = () => {
  return (
    <section className="mt-12">
      <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
        Designing a full project?
      </h2>
      <p className="text-sm text-muted-foreground mb-6">
        Use our wizards to plan your kitchen, laundry, cold room, or dishwashing
        area end-to-end.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {WIZARDS.map(({ icon: Icon, title, description, href }) => (
          <a
            key={title}
            href={href}
            className="border border-border rounded-lg p-5 bg-card hover:border-primary hover:shadow-sm transition group"
          >
            <Icon className="w-7 h-7 text-primary mb-3" />
            <h3 className="text-sm font-semibold text-foreground mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {description}
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-primary font-semibold mt-3 group-hover:gap-2 transition-all">
              Start <ArrowRight className="w-3 h-3" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
};

export default ProjectWizardGrid;
