import React, { useState } from "react";

export default function Stocks() {
  const [items, setItems] = useState([
    { id: 1, product: "Chicken Adobo", price: 120, stocks: 10 },
    { id: 2, product: "Pancit Canton", price: 80, stocks: 0 },
    { id: 3, product: "Beef Steak", price: 150, stocks: 5 },
  ]);

  const handleStockChange = (id, value) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, stocks: Number(value) } : item
    );
    setItems(newItems);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Stocks Management</h2>

      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">

        {/* HEADER with #F6ADAD */}
        <div
          className="grid grid-cols-12 p-3 text-sm font-semibold border-b"
          style={{ backgroundColor: "#F6ADAD" }}
        >
          <div className="col-span-4">Product</div>
          <div className="col-span-2">Price</div>
          <div className="col-span-3">Stocks</div>
          <div className="col-span-3 text-center">Status</div>
        </div>

        {/* ITEMS */}
        {items.map((item) => (
          <div
            key={item.id}
            className="grid grid-cols-12 p-3 text-sm border-b items-center"
          >
            <div className="col-span-4">{item.product}</div>
            <div className="col-span-2">₱{item.price}</div>

            <div className="col-span-3">
              <input
                type="number"
                value={item.stocks}
                min="0"
                onChange={(e) => handleStockChange(item.id, e.target.value)}
                className="w-20 px-2 py-1 border rounded"
              />
            </div>

            <div
              className={`col-span-3 font-semibold text-center ${
                item.stocks <= 0 ? "text-red-500" : "text-green-600"
              }`}
            >
              {item.stocks <= 0 ? "Sold Out" : "Available"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
