import { MapPin, Phone, User } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Address } from "@/types";
import { entranceAnim } from "@/lib/constants/enter-animation";

export const OrderShippingCard = ({
  label,
  address,
}: {
  label: string;
  address: Address;
}) => {
  return (
    <Card className="shadow-md pt-0">
      <CardHeader
        className={`bg-gray-50 border-b pt-6 ${entranceAnim}`}
        style={{
          animationDelay: "140ms",
        }}
      >
        <h2 className="text-lg font-bold text-gray-900">{label}</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div
            className={`flex items-center gap-2 ${entranceAnim}`}
            style={{
              animationDelay: "160ms",
            }}
          >
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900">{address.name}</span>
          </div>
          <div
            className={`flex items-start gap-2 ${entranceAnim}`}
            style={{
              animationDelay: "180ms",
            }}
          >
            <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
            <span className="text-sm text-gray-500">
              {address.street}, {address.city}, {address.state}{" "}
              {address.zipCode}, {address.country}
            </span>
          </div>
          {address.phoneNumber && (
            <div
              className={`flex items-center gap-2 ${entranceAnim}`}
              style={{
                animationDelay: "200ms",
              }}
            >
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-500">
                {address.phoneNumber}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
