import React from 'react';

export const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-6 border-l-4 border-gray-300 dark:border-gray-700 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20 mb-2"></div>
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-32 mt-2"></div>
        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-24 mt-2"></div>
      </div>
      <div className="h-12 w-12 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
    </div>
  </div>
);

export const SkeletonTableRow = () => (
  <tr className="animate-pulse">
    <td className="px-4 py-3"><div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div></td>
    <td className="px-4 py-3"><div className="h-16 w-16 bg-gray-300 dark:bg-gray-700 rounded"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div></td>
    <td className="px-4 py-3"><div className="h-4 bg-gray-300 dark:bg-gray-700 rounded"></div></td>
  </tr>
);

export const SkeletonDashboardStats = () => (
  <>
    {[1, 2, 3, 4, 5].map((i) => (
      <SkeletonCard key={i} />
    ))}
  </>
);

export const SkeletonDashboardTable = () => (
  <>
    {[1, 2, 3, 4, 5].map((i) => (
      <SkeletonTableRow key={i} />
    ))}
  </>
);
