import { Clock, Truck, ShieldCheck, Headphones } from "lucide-react";

interface Props {
  specifications?: Record<string, any> | null;
}

/**
 * B2B trust strip for equipment PDPs. Replaces the consumer-retail badges
 * (free shipping / 30-day returns / secure payment) which don't apply to
 * quote-only capital goods.
 */
const EquipmentBadgesRow = ({ specifications }: Props) => {
  const leadTime =
    (specifications && (specifications.lead_time as string)) ||
    "Contact us for lead time";
  const warranty =
    (specifications && (specifications.warranty as string)) ||
    "Standard manufacturer warranty";

  const items = [
    { icon: Clock, label: "Lead time", value: leadTime },
    { icon: Truck, label: "Delivery & installation", value: "Included" },
    { icon: ShieldCheck, label: "Warranty", value: warranty },
    { icon: Headphones, label: "After-sales support", value: "Training included" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border border-border rounded-lg p-4 bg-card">
      {items.map(({ icon: Icon, label, value }) => (
        <div key={label} className="flex items-start gap-2.5">
          <Icon className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-foreground uppercase tracking-wide">
              {label}
            </p>
            <p className="text-xs text-muted-foreground leading-snug">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EquipmentBadgesRow;
