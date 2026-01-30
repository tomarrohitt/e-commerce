import { entranceAnim } from "@/lib/constants/enter-animation";
import { Truck, RefreshCw, Shield } from "lucide-react";

const trustBadges = [
  { icon: Truck, label: "Free Shipping" },
  { icon: RefreshCw, label: "Easy Returns" },
  { icon: Shield, label: "Secure Payment" },
];

export function ProductTrustBadges() {
  return (
    <div className="grid grid-cols-3 gap-3 pt-6 border-t">
      {trustBadges.map((badge, index) => (
        <TrustBadge
          key={badge.label}
          icon={badge.icon}
          label={badge.label}
          index={index}
        />
      ))}
    </div>
  );
}

function TrustBadge({
  icon: Icon,
  label,
  index,
}: {
  icon: React.ElementType;
  label: string;
  index: number;
}) {
  return (
    <div
      className={`bg-gray-50 rounded-xl p-4 text-center transition-transform hover:scale-105  ${entranceAnim}`}
      style={{ animationDelay: `${300 + index * 100}ms` }}
    >
      <Icon className="w-6 h-6 text-gray-600 mx-auto mb-2" />
      <p className="text-xs font-semibold text-gray-600">{label}</p>
    </div>
  );
}
