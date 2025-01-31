import React from "react";
import { DollarSign, Star } from "lucide-react"; // Icons from Lucide

const PriceRating = ({ value = 0, max = 5, onChange, type = "price" }) => {
  // Determine which icon to use (DollarSign or Star)
  const Icon = type === "rating" ? Star : DollarSign;

  const handleSelect = (rating) => {
    if (onChange) {
      onChange(rating); // Update parent component's state
    }
  };

  return (
    <div className="field-container">
      <label>{type === "rating" ? "Rating:" : "Price:"}</label>
      <div className="flex items-center space-x-2">
        {Array.from({ length: max }, (_, index) => {
          const rating = index + 1; // Icons start from 1
          return (
            <Icon
              key={rating}
              className={`w-8 h-8 cursor-pointer transition-colors duration-200 ${
                rating <= value ? "text-yellow-500" : "text-gray-300"
              }`}
              onClick={() => handleSelect(rating)} // Update value on click
            />
          );
        })}
      </div>
    </div>
  );
};

export default PriceRating;
