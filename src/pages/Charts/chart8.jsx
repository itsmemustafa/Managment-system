import React, { useState, useEffect, useRef } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getAllInstallations } from "@/db/dbService";
import ExportButton from "@/components/ExportPNG";
import ExportCSV from '@/components/ExportCSV';
import getUser from "@/Utils/getUser";

const BrandInstallationPerformance = () => {
  const [brandData, setBrandData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topCount, setTopCount] = useState(10);
  const [chartType, setChartType] = useState("bar");
const chartRef=useRef();

  useEffect(() => {
    const loadData = async () => {
      try {
        const installationData = await getAllInstallations();
        
        const brandStats = {};
        
        installationData.forEach((record) => {
          const brand = record.brand || "Unknown";
          if (!brandStats[brand]) {
            brandStats[brand] = {
              brand,
              installations: 0,
              totalUnits: 0,
              governorates: new Set()
            };
          }
          brandStats[brand].installations++;
          brandStats[brand].totalUnits += (record.quantity || 1);
          if (record.governorate) {
            brandStats[brand].governorates.add(record.governorate);
          }
        });

        const processedData = Object.values(brandStats)
          .map((brand) => ({
            brand: brand.brand,
            installations: brand.installations,
            totalUnits: brand.totalUnits,
            governorateCount: brand.governorates.size,
            avgUnitsPerInstall: (brand.totalUnits / brand.installations).toFixed(1),
            percentage: ((brand.installations / installationData.length) * 100).toFixed(1),
            marketShare: ((brand.totalUnits / installationData.reduce((sum, i) => sum + (i.quantity || 1), 0)) * 100).toFixed(1)
          }))
          .sort((a, b) => b.installations - a.installations);

        setBrandData(processedData);
      } catch (error) {
        console.error("Error loading installation data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const colors = [
    "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
    "#ec4899", "#06b6d4", "#14b8a6", "#f97316", "#a855f7"
  ];

  const topBrands = brandData.slice(0, topCount);
  const totalInstallations = brandData.reduce((sum, b) => sum + b.installations, 0);
  const totalUnits = brandData.reduce((sum, b) => sum + b.totalUnits, 0);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading brand installation data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Brand Performance in Installations</h1>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Brands</p>
          <p className="text-3xl font-bold text-blue-600">{brandData.length}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Installations</p>
          <p className="text-3xl font-bold text-green-600">{totalInstallations}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Units</p>
          <p className="text-3xl font-bold text-purple-600">{totalUnits}</p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Leading Brand</p>
          <p className="text-lg font-bold text-orange-600 truncate" title={brandData[0]?.brand}>
            {brandData[0]?.brand}
          </p>
          <p className="text-sm text-gray-600">{brandData[0]?.percentage}% share</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm" ref={chartRef}>
        <h2 className="text-lg font-semibold mb-4">Installation Volume by Brand</h2>
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
                tick={{ fontSize: 11 }}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
              <Legend />
              <Bar yAxisId="left" dataKey="installations" name="Installations" fill="#10b981" radius={[8, 8, 0, 0]} />
              <Bar yAxisId="right" dataKey="totalUnits" name="Total Units" fill="#3b82f6" radius={[8, 8, 0, 0]} />
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
                dataKey="installations"
              >
                {topBrands.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
                <ExportButton targetRef={chartRef} fileName="chart.png"  />
      </div>

      {/* Detailed Table */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-300 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Brand Performance Details</h2>
          {(() => {
            const cu = getUser('currentUser');
            const role = String(cu?.role || '').toUpperCase();
            if (role === 'ADMIN' || role === 'SUPERVISOR') {
              const cols = [
                { key: 'rank', label: 'Rank' },
                { key: 'brand', label: 'Brand' },
                { key: 'installations', label: 'Installations' },
                { key: 'totalUnits', label: 'Total Units' },
                { key: 'avgUnitsPerInstall', label: 'Avg Units' },
                { key: 'governorateCount', label: 'Coverage (gov.)' },
                { key: 'marketShare', label: 'Market Share' },
              ];
              const data = topBrands.map((b, i) => ({
                rank: i + 1,
                brand: b.brand,
                installations: b.installations,
                totalUnits: b.totalUnits,
                avgUnitsPerInstall: b.avgUnitsPerInstall,
                governorateCount: b.governorateCount,
                marketShare: b.marketShare + '%',
              }));
              return <ExportCSV data={data} columns={cols} fileName="brand-installations.csv" />;
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
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Installations</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Total Units</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Avg Units</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Coverage</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Market Share</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">Performance</th>
              </tr>
            </thead>
            <tbody>
              {topBrands.map((brand, index) => {
                const performance = brand.installations > totalInstallations * 0.15 ? "Excellent" :
                                   brand.installations > totalInstallations * 0.08 ? "Good" :
                                   brand.installations > totalInstallations * 0.04 ? "Average" : "Low";
                const performanceColor = performance === "Excellent" ? "bg-green-100 text-green-800" :
                                        performance === "Good" ? "bg-blue-100 text-blue-800" :
                                        performance === "Average" ? "bg-yellow-100 text-yellow-800" :
                                        "bg-gray-100 text-gray-800";
                
                return (
                  <tr key={brand.brand} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-gray-300'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium max-w-xs truncate" title={brand.brand}>
                      {brand.brand}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                        {brand.installations}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                        {brand.totalUnits}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {brand.avgUnitsPerInstall}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="px-2 py-1 rounded-full bg-purple-100 text-purple-800 text-xs">
                        {brand.governorateCount} gov.
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-gray-600">{brand.marketShare}%</span>
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${Math.min(brand.marketShare, 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${performanceColor}`}>
                        {performance}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">🏆 Market Leaders</h3>
          <div className="space-y-2">
            {brandData.slice(0, 3).map((brand, index) => (
              <div key={brand.brand} className="flex items-center justify-between">
                <span className="text-sm font-medium truncate max-w-xs" title={brand.brand}>
                  {index + 1}. {brand.brand}
                </span>
                <span className="text-sm text-green-600 font-semibold">
                  {brand.installations} installs
                </span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">🌍 Widest Coverage</h3>
          <div className="space-y-2">
            {[...brandData].sort((a, b) => b.governorateCount - a.governorateCount).slice(0, 3).map((brand, index) => (
              <div key={brand.brand} className="flex items-center justify-between">
                <span className="text-sm font-medium truncate max-w-xs" title={brand.brand}>
                  {index + 1}. {brand.brand}
                </span>
                <span className="text-sm text-purple-600 font-semibold">
                  {brand.governorateCount} regions
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">📦 Bulk Installers</h3>
          <div className="space-y-2">
            {[...brandData].sort((a, b) => b.avgUnitsPerInstall - a.avgUnitsPerInstall).slice(0, 3).map((brand, index) => (
              <div key={brand.brand} className="flex items-center justify-between">
                <span className="text-sm font-medium truncate max-w-xs" title={brand.brand}>
                  {index + 1}. {brand.brand}
                </span>
                <span className="text-sm text-blue-600 font-semibold">
                  {brand.avgUnitsPerInstall} avg/install
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandInstallationPerformance;