import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const RatingChart = ({ reviews }) => {
  // Calculate rating distribution
  const ratingCounts = [1, 2, 3, 4, 5].map(rating => {
    const count = reviews.filter(review => review.rating === rating).length;
    return {
      rating: `${rating} Star${rating !== 1 ? 's' : ''}`,
      count,
      percentage: reviews.length > 0 ? ((count / reviews.length) * 100).toFixed(1) : 0
    };
  });

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-gray-900 dark:text-gray-100 font-semibold">{label}</p>
          <p className="text-blue-600 dark:text-blue-400">
            {`Count: ${data.count} (${data.percentage}%)`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
        Rating Distribution
      </h3>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={ratingCounts}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis
              dataKey="rating"
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-gray-600 dark:text-gray-400"
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="#3B82F6"
              radius={[4, 4, 0, 0]}
              className="hover:opacity-80 transition-opacity"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {reviews.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
          No reviews yet to display rating distribution.
        </p>
      )}
    </div>
  );
};

export default RatingChart;
