import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CreditCard, Check, ShieldCheck } from "lucide-react";

const paymentMethods = [
  {
    id: "card",
    icon: CreditCard,
    title: "Credit / Debit Card",
    description: "Visa, Mastercard, Amex",
  },
];

export function PaymentSection() {
  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardHeader className="border-b bg-muted/30 py-5">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
            2
          </div>
          <h2 className="text-lg font-semibold text-foreground">
            Payment Method
          </h2>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <PaymentOption
              key={method.id}
              icon={method.icon}
              title={method.title}
              description={method.description}
            />
          ))}
        </div>
        <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="w-4 h-4 text-accent" />
          <span>Your payment information is encrypted and secure</span>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentOption({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="relative p-4 rounded-xl cursor-pointer transition-all duration-200 bg-accent/5 ring-2 ring-accent shadow-sm">
      <div className="flex items-center gap-4">
        <div className="shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors border-accent bg-accent">
          <Check className="w-3 h-3 text-accent-foreground" />
        </div>
        <div className="bg-accent/10 w-10 h-10 rounded-lg flex items-center justify-center ">
          <Icon className="w-5 h-5 text-gray-500" />
        </div>
        <div>
          <p className="font-medium text-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}
