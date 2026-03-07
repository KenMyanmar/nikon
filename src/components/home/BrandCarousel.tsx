const brands = [
  "ELECTROLUX", "CAMBRO", "HOBART", "SCOTSMAN", "HOSHIZAKI",
  "ALTO-SHAAM", "CONVOTHERM", "ROBOT COUPE", "ARCOS", "LACOR",
  "DE BUYER", "HAMILTON BEACH", "RIEDEL", "NACHTMANN", "KARCHER",
  "RUBBERMAID", "NESPRESSO", "SCHAERER", "SIMONELLI", "DIVERSEY",
];

const BrandCarousel = () => {
  return (
    <section className="py-12 md:py-16 bg-card">
      <div className="container mx-auto px-4 text-center mb-8">
        <h2 className="text-h2 text-foreground">Trusted by the World's Best Brands</h2>
        <p className="text-sm text-ikon-text-secondary mt-2">Authorized distributor of 160+ premium international brands</p>
      </div>
      <div className="overflow-hidden">
        <div className="flex animate-scroll-x">
          {[...brands, ...brands].map((brand, i) => (
            <div
              key={`${brand}-${i}`}
              className="flex-shrink-0 px-8 py-4 mx-2 bg-ikon-bg-secondary rounded-lg flex items-center justify-center min-w-[180px]"
            >
              <span className="text-sm font-bold text-primary tracking-wide whitespace-nowrap">{brand}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandCarousel;
