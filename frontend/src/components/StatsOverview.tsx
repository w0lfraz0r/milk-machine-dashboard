import React from "react";

const StatsOverview = ({ stats, isLoading }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border">
    <div className="grid grid-cols-2 divide-x">
      <div className="px-8 py-6">
        <p className="text-sm font-medium text-gray-500">Total Packets</p>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          {isLoading ? (
            <div className="h-9 bg-gray-200 animate-pulse rounded w-24" />
          ) : (
            stats.totalPackets.toLocaleString()
          )}
        </p>
      </div>
      {/* <div className="px-8 py-6">
        <p className="text-sm font-medium text-gray-500">Active Lines</p>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          {isLoading ? (
            <div className="h-9 bg-gray-200 animate-pulse rounded w-8" />
          ) : (
            stats.activeLines
          )}
        </p>
      </div> */}
      <div className="px-8 py-6">
        <p className="text-sm font-medium text-gray-500">Total Trays</p>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          {isLoading ? (
            <div className="h-9 bg-gray-200 animate-pulse rounded w-8" />
          ) : (
            stats.totalTrays
          )}
        </p>
      </div>
      {/* <div className="px-8 py-6">
        <p className="text-sm font-medium text-gray-500">Utilization</p>
        <p className="mt-2 text-3xl font-semibold text-gray-900">
          {isLoading ? (
            <div className="h-9 bg-gray-200 animate-pulse rounded w-16" />
          ) : (
            `${stats.capacityUtilization}%`
          )}
        </p>
      </div> */}
    </div>
  </div>
);

export default StatsOverview;
