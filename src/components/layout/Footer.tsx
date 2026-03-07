import { Link } from "react-router-dom";
import { Phone, Mail, MapPin, Facebook } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-ikon-navy-dark text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="bg-primary rounded-lg px-3 py-1.5 inline-block mb-4">
              <span className="text-primary-foreground font-bold text-xl">IKON</span>
            </div>
            <p className="text-sm text-primary-foreground/70 mb-4">
              Myanmar's trusted marketplace for kitchen, hotel, restaurant & commercial supplies. 23+ years of expertise.
            </p>
            <div className="space-y-2 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>No. 328-A, Pyay Rd., Sanchaung, Yangon</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 shrink-0" />
                <span>01-534216, 01-527705</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0" />
                <span>sales@ikonmart.com</span>
              </div>
            </div>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-base mb-4">Products</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/category/cooking-equipment" className="hover:text-primary-foreground transition">Kitchen Equipment</Link></li>
              <li><Link to="/category/tableware" className="hover:text-primary-foreground transition">Tableware & Display</Link></li>
              <li><Link to="/category/housekeeping" className="hover:text-primary-foreground transition">Housekeeping</Link></li>
              <li><Link to="/category/linen" className="hover:text-primary-foreground transition">Linen & Amenities</Link></li>
              <li><Link to="/category/food-beverage" className="hover:text-primary-foreground transition">Food & Beverage</Link></li>
              <li><Link to="/category/banquet" className="hover:text-primary-foreground transition">Banquet Equipment</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-base mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/support" className="hover:text-primary-foreground transition">Help Center</Link></li>
              <li><Link to="/support#faq" className="hover:text-primary-foreground transition">FAQ</Link></li>
              <li><Link to="/support#shipping" className="hover:text-primary-foreground transition">Shipping & Delivery</Link></li>
              <li><Link to="/support#returns" className="hover:text-primary-foreground transition">Returns & Refunds</Link></li>
              <li><Link to="/bulk-orders" className="hover:text-primary-foreground transition">Bulk Orders</Link></li>
              <li><Link to="/support#warranty" className="hover:text-primary-foreground transition">Warranty</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-base mb-4">Connect</h3>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="tel:01534216" className="hover:text-primary-foreground transition">📞 01-534216</a></li>
              <li><a href="https://wa.me/959XXXXXXXXX" className="hover:text-primary-foreground transition">💬 WhatsApp</a></li>
              <li><a href="mailto:sales@ikonmart.com" className="hover:text-primary-foreground transition">📧 Email Us</a></li>
              <li><a href="#" className="hover:text-primary-foreground transition flex items-center gap-1"><Facebook className="w-4 h-4" /> Facebook</a></li>
            </ul>
            <div className="mt-6 text-xs text-primary-foreground/50">
              <p>Mon–Sat: 8:30 AM – 5:30 PM</p>
              <p>CCI France Myanmar Member</p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-8 pt-6 text-center text-xs text-primary-foreground/50">
          © 2026 IKON Trading Co., Ltd. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
