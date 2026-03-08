const clients = [
  "Chatrium Hotel",
  "YKKO",
  "Novotel",
  "Sedona Hotel",
  "Sule Shangri-La",
  "Pan Pacific",
  "Lotte Hotel",
  "Strand Hotel",
  "Inya Lake Hotel",
  "Melia Yangon",
];

const ClientLogos = () => {
  return (
    <section className="py-10 bg-muted/50">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-6">
          Trusted by Leading Hotels & Restaurants
        </p>
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {clients.map((name) => (
            <div
              key={name}
              className="px-5 py-2.5 bg-card rounded-lg border border-border text-sm font-medium text-foreground/70 hover:text-primary hover:border-primary/30 transition-colors"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ClientLogos;
