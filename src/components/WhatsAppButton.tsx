import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  return (
    <a
      href="https://wa.me/959XXXXXXXXX?text=Hi%20IKON%20Mart"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-4 md:bottom-6 md:right-6 z-40 bg-[#25D366] hover:bg-[#1FB855] text-primary-foreground p-4 rounded-full shadow-lg hover:shadow-xl transition-all group"
    >
      <MessageCircle className="w-6 h-6" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-card text-foreground px-3 py-1.5 rounded-lg shadow-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
        Chat with Sales
      </span>
    </a>
  );
};

export default WhatsAppButton;
