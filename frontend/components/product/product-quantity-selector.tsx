import { Button } from "@/components/ui/button";

interface ProductQuantitySelectorProps {
  quantity: number;
  maxQuantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onChange: (value: number) => void;
}

export function ProductQuantitySelector({
  quantity,
  maxQuantity,
  onIncrement,
  onDecrement,
  onChange,
}: ProductQuantitySelectorProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= maxQuantity) {
      onChange(val);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Quantity
      </label>
      <div className="flex items-center space-x-4">
        <button
          onClick={onDecrement}
          disabled={quantity <= 1}
          className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          −
        </button>
        <input
          type="number"
          min="1"
          max={maxQuantity}
          value={quantity}
          onChange={handleInputChange}
          className="w-20 h-10 text-center border-2 border-gray-300 rounded-lg font-semibold focus:border-purple-600 focus:outline-none"
        />
        <button
          onClick={onIncrement}
          disabled={quantity >= maxQuantity}
          className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-purple-600 hover:bg-purple-50 transition-colors flex items-center justify-center font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>
        <span className="text-sm text-gray-500">(Max: {maxQuantity})</span>
      </div>
    </div>
  );
}
