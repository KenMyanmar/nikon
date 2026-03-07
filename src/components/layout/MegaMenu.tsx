import { Link } from "react-router-dom";

const MegaMenu = () => {
  return (
    <div className="absolute left-0 w-full bg-card shadow-xl border-t-2 border-primary z-50">
      <div className="container mx-auto px-4 py-8 grid grid-cols-4 gap-8">
        <div>
          <h3 className="font-bold text-primary mb-3 text-xs uppercase tracking-wider">Kitchen Services</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/category/cooking-equipment" className="text-ikon-text-secondary hover:text-accent transition">Cooking Equipment</Link></li>
            <li><Link to="/category/ovens" className="text-ikon-text-secondary hover:text-accent transition">Ovens</Link></li>
            <li><Link to="/category/refrigeration" className="text-ikon-text-secondary hover:text-accent transition">Refrigeration</Link></li>
            <li><Link to="/category/dishwashing" className="text-ikon-text-secondary hover:text-accent transition">Dishwashing</Link></li>
            <li><Link to="/category/food-preparation" className="text-ikon-text-secondary hover:text-accent transition">Food Preparation</Link></li>
            <li><Link to="/category/ventilation" className="text-ikon-text-secondary hover:text-accent transition">Ventilation</Link></li>
            <li><Link to="/category/cold-room" className="text-ikon-text-secondary hover:text-accent transition">Cold Room</Link></li>
            <li><Link to="/category/ss-fabrication" className="text-ikon-text-secondary hover:text-accent transition">SS Fabrication</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-primary mb-3 text-xs uppercase tracking-wider">Tableware & Display</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/category/chinaware" className="text-ikon-text-secondary hover:text-accent transition">Chinaware</Link></li>
            <li><Link to="/category/glassware" className="text-ikon-text-secondary hover:text-accent transition">Glassware</Link></li>
            <li><Link to="/category/cutlery" className="text-ikon-text-secondary hover:text-accent transition">Cutlery</Link></li>
            <li><Link to="/category/buffet-ware" className="text-ikon-text-secondary hover:text-accent transition">Buffet Ware</Link></li>
            <li><Link to="/category/wine-glass" className="text-ikon-text-secondary hover:text-accent transition">Wine Glass</Link></li>
            <li><Link to="/category/serving-tools" className="text-ikon-text-secondary hover:text-accent transition">Serving Tools</Link></li>
          </ul>
          <h3 className="font-bold text-primary mb-3 mt-5 text-xs uppercase tracking-wider">Kitchen Utensils</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/category/kitchen-tools" className="text-ikon-text-secondary hover:text-accent transition">Kitchen Tools</Link></li>
            <li><Link to="/category/knives" className="text-ikon-text-secondary hover:text-accent transition">Professional Knives</Link></li>
            <li><Link to="/category/pots-and-pans" className="text-ikon-text-secondary hover:text-accent transition">Pots & Pans</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-bold text-primary mb-3 text-xs uppercase tracking-wider">Housekeeping</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/category/hk-equipment" className="text-ikon-text-secondary hover:text-accent transition">HK Equipment</Link></li>
            <li><Link to="/category/cleaning-chemicals" className="text-ikon-text-secondary hover:text-accent transition">Cleaning Chemicals</Link></li>
            <li><Link to="/category/waste-disposal" className="text-ikon-text-secondary hover:text-accent transition">Waste Disposal</Link></li>
          </ul>
          <h3 className="font-bold text-primary mb-3 mt-5 text-xs uppercase tracking-wider">Linen & Amenities</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/category/bedroom-amenities" className="text-ikon-text-secondary hover:text-accent transition">Bedroom Amenities</Link></li>
            <li><Link to="/category/bathroom-amenities" className="text-ikon-text-secondary hover:text-accent transition">Bathroom Amenities</Link></li>
            <li><Link to="/category/linen" className="text-ikon-text-secondary hover:text-accent transition">Linen</Link></li>
            <li><Link to="/category/laundry-equipment" className="text-ikon-text-secondary hover:text-accent transition">Laundry Equipment</Link></li>
          </ul>
        </div>
        <div className="bg-ikon-navy-50 rounded-lg p-6">
          <h3 className="font-bold text-primary mb-2">New Arrivals</h3>
          <p className="text-sm text-ikon-text-secondary mb-4">Check out the latest additions to our catalog</p>
          <Link to="/new-arrivals" className="text-sm font-semibold text-accent hover:underline">
            Shop New Arrivals →
          </Link>
          <div className="mt-6">
            <h3 className="font-bold text-primary mb-2">Need Help?</h3>
            <p className="text-sm text-ikon-text-secondary">Call us at <strong>01-534216</strong></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MegaMenu;
