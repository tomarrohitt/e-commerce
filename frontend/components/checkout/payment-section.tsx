import { Card, CardContent, CardHeader } from "../ui/card";

export function PaymentSection({
  paymentMethod,
  onPaymentMethodChange,
}: {
  paymentMethod: "stripe" | "cod";
  onPaymentMethodChange: (method: "stripe" | "cod") => void;
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <PaymentOption
            id="stripe"
            icon="💳"
            title="Credit/Debit Card"
            description="Pay securely with Stripe"
            isSelected={paymentMethod === "stripe"}
            onSelect={() => onPaymentMethodChange("stripe")}
          />
          <PaymentOption
            id="cod"
            icon="💵"
            title="Cash on Delivery"
            description="Pay when you receive your order"
            isSelected={paymentMethod === "cod"}
            onSelect={() => onPaymentMethodChange("cod")}
          />
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentOption({
  id,
  icon,
  title,
  description,
  isSelected,
  onSelect,
}: {
  id: string;
  icon: string;
  title: string;
  description: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? "border-purple-600 bg-purple-50"
          : "border-gray-200 hover:border-purple-300"
      }`}
    >
      <div className="flex items-center space-x-3">
        <input type="radio" checked={isSelected} onChange={onSelect} />
        <div>
          <p className="font-semibold text-gray-900">
            {icon} {title}
          </p>
          <p className="text-sm text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  );
}
