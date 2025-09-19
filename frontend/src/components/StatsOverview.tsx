import React, { useEffect, useState } from "react";

const START_PACKETS = 356;
const START_TRAYS = 31;

const StatsOverview = () => {
  const [animatedPackets, setAnimatedPackets] = useState(START_PACKETS);
  const [animatedTrays, setAnimatedTrays] = useState(START_TRAYS);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedPackets(prev => prev + Math.max(1, Math.round(prev * 0.1)));
      setAnimatedTrays(prev => prev + Math.max(1, Math.round(prev * 0.1)));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border">
      <div className="grid grid-cols-2 divide-x">
        <div className="px-8 py-6">
          <p className="text-sm font-medium text-gray-500">Total Packets</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {animatedPackets.toLocaleString()}
          </p>
        </div>
        <div className="px-8 py-6">
          <p className="text-sm font-medium text-gray-500">Total Trays</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {animatedTrays.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsOverview;
