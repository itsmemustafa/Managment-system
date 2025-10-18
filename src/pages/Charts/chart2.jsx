import React, { useState, useEffect,useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { getAllMaintenance } from "@/db/dbService";
import ExportButton from "@/components/ExportPNG";
import ExportCSV from '@/components/ExportCSV';
import getUser from "@/Utils/getUser";

const TopBrandsMaintenance = () => {
  const [brandData, setBrandData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topCount, setTopCount] = useState(10);
  const [chartType, setChartType] = useState("bar");
  const chartRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const maintenanceData = await getAllMaintenance();
        
   
        const brandCounts = {};
        maintenanceData.forEach((record) => {
          const brand = record.brand || "Unknown";
          brandCounts[brand] = (brandCounts[brand] || 0) + 1;
        });


        const sortedBrands = Object.entries(brandCounts)
          .map(([brand, count]) => ({
            brand,
            count,
            percentage: ((count / maintenanceData.length) * 100).toFixed(1)
          }))
          .sort((a, b) => b.count - a.count);

        setBrandData(sortedBrands);
      } catch (error) {
        console.error("Error loading maintenance data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16",
    "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9"
  ];

  const topBrands = brandData.slice(0, topCount);
  const totalMaintenance = brandData.reduce((sum, d) => sum + d.count, 0);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading brand maintenance data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Top Brands with Maintenance Issues</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Chart Type:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            >
              <option value="bar">Bar Chart</option>
              <option value="pie">Pie Chart</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Show top:</label>
            <select
              value={topCount}
              onChange={(e) => setTopCount(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={20}>20</option>
              <option value={brandData.length}>All</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Maintenance Issues</p>
            <p className="text-3xl font-bold text-red-600">{totalMaintenance}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Brands with Issues</p>
            <p className="text-3xl font-bold text-red-600">{brandData.length}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm"  ref={chartRef}>
        <h2 className="text-lg font-semibold mb-4">Maintenance Issues by Brand</h2>
        {chartType === "bar" ? (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topBrands} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="brand" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                formatter={(value) => [value, 'Maintenance Issues']}
              />
              <Legend />
              <Bar dataKey="count" name="Maintenance Issues" radius={[8, 8, 0, 0]}>
                {topBrands.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={topBrands}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={(entry) => `${entry.brand}: ${entry.percentage}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="count"
              >
                {topBrands.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
                formatter={(value) => [value, 'Maintenance Issues']}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
                <ExportButton targetRef={chartRef} fileName="chart.png" />

      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-300 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Brand Breakdown Table</h2>
          {(() => {
            const cu = getUser('currentUser');
            const role = String(cu?.role || '').toUpperCase();
            if (role === 'ADMIN' || role === 'SUPERVISOR') {
              const cols = [
                { key: 'rank', label: 'Rank' },
                { key: 'brand', label: 'Brand' },
                { key: 'count', label: 'Issues Count' },
                { key: 'percentage', label: 'Percentage' },
                { key: 'status', label: 'Status' },
              ];
              const data = topBrands.map((b, i) => ({
                rank: i + 1,
                brand: b.brand,
                count: b.count,
                percentage: b.percentage + '%',
                status: b.count > totalMaintenance * 0.15 ? 'High Risk' : b.count > totalMaintenance * 0.08 ? 'Medium Risk' : 'Low Risk',
              }));
              return <ExportCSV data={data} columns={cols} fileName="brand-maintenance.csv" />;
            }
            return null;
          })()}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Brand</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Issues Count</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Percentage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Visual</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {topBrands.map((brand, index) => (
                <tr key={brand.brand} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                      index === 0 ? 'bg-red-500' :
                      index === 1 ? 'bg-orange-500' :
                      index === 2 ? 'bg-yellow-500' :
                      'bg-gray-300'
                    }`}>
                      {index + 1}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{brand.brand}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    <span className="px-3 py-1 rounded-full bg-red-100 text-red-800">
                      {brand.count}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {brand.percentage}%
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: `${brand.percentage}%`,
                          backgroundColor: colors[index % colors.length]
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      brand.count > totalMaintenance * 0.15 ? 'bg-red-100 text-red-800' :
                      brand.count > totalMaintenance * 0.08 ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {brand.count > totalMaintenance * 0.15 ? 'High Risk' :
                       brand.count > totalMaintenance * 0.08 ? 'Medium Risk' :
                       'Low Risk'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Brand with Most Issues</p>
          <p className="text-xl font-bold text-gray-800 truncate">{brandData[0]?.brand}</p>
          <p className="text-sm text-red-600">{brandData[0]?.count} maintenance issues</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Top 3 Brands</p>
          <p className="text-xl font-bold text-gray-800">
            {brandData.slice(0, 3).reduce((sum, d) => sum + d.count, 0)}
          </p>
          <p className="text-sm text-red-600">
            {((brandData.slice(0, 3).reduce((sum, d) => sum + d.count, 0) / totalMaintenance) * 100).toFixed(1)}% of total issues
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Average Issues per Brand</p>
          <p className="text-xl font-bold text-gray-800">
            {(totalMaintenance / brandData.length).toFixed(1)}
          </p>
          <p className="text-sm text-red-600">maintenance issues</p>
        </div>
      </div>
    </div>
  );
};

export default TopBrandsMaintenance;