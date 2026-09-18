import React from 'react';

// Adjusted padding and font sizes for compactness
// Removed default bgColor and textColor as they'll be applied externally or be consistent
const BookingStatsCard = ({ title, count, icon }) => { // Removed bgColor and textColor props
  return (
    // Applied consistent white background and dark text for all cards
    <div className="flex flex-col items-center justify-center p-5 rounded-xl shadow-lg bg-white text-gray-800 transform hover:scale-105 transition-transform duration-200 ease-in-out cursor-pointer border border-blue-100">
      <div className="text-4xl mb-2 opacity-80 text-blue-600"> {/* Icon color set to blue */}
        {icon}
      </div>
      <p className="text-3xl font-bold">{count}</p>
      <h3 className="text-sm font-medium mt-1 text-center">{title}</h3>
    </div>
  );
};

export default BookingStatsCard;