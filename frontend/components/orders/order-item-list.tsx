interface OrderItemsListProps {
  orderItems: Array<{
    productId: string;
    name: string;
    thumbnail: string;
    quantity: number;
    price: string;
  }>;
}

// "id": "cmj441rl4000befi5m1rjiu72",
//            "productId": "cmj2igay400015wi5l8f80ixd",
//            "name": "Modern Web Architecture",
//            "sku": "SKU123TEST987",
//            "price": "1499",
//            "thumbnail": "",
//            "quantity": 1

export function OrderItemsList({ orderItems }: OrderItemsListProps) {
  return (
    <div className="space-y-4 mb-4">
      {orderItems.map((item) => (
        <div
          key={item.productId}
          className="flex items-center space-x-4 py-3 border-b border-gray-100 last:border-0"
        >
          <div className="w-16 h-16 bg-linear-to-br from-purple-400 to-indigo-600 rounded-lg flex items-center justify-center">
            {item.thumbnail ? (
              <img
                src={item.thumbnail}
                alt={item.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <span className="text-white text-2xl">📦</span>
            )}
          </div>

          <div className="flex-1">
            <p className="font-semibold text-gray-900">{item.name}</p>
            <p className="text-sm text-gray-600">
              Quantity: {item.quantity} × ${item.price}
            </p>
          </div>

          <div className="text-right">
            <p className="font-semibold text-gray-900">
              ${(item.quantity * Number(item.price)).toFixed(2)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
