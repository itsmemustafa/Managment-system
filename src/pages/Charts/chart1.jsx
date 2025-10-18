import React, { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { getAllMaintenance, getAllDeviceTypes } from "@/db/dbService";
import ExportButton from '../../components/ExportPNG';
import { Package, TrendingUp, Activity, Filter, Download, BarChart3 } from "lucide-react";

const Chart1 = () => {
  const [deviceData, setDeviceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topCount, setTopCount] = useState(10);
  const [viewMode, setViewMode] = useState('bar'); 
  const chartRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [maintenanceData, deviceTypes] = await Promise.all([
          getAllMaintenance(),
          getAllDeviceTypes(),
        ]);

        
        const nameByCode = new Map(
          deviceTypes.map((t) => [
            String(t.code || "").toUpperCase(),
            t.name || t.code || "Unknown",
          ])
        );

        const deviceCounts = {};
        maintenanceData.forEach((record) => {
          const byDevice = (record.device || "").trim();
          const byType = (record.deviceType || "").trim();
          const byCode = nameByCode.get(
            String(record.deviceTypeCode || "").toUpperCase()
          );
          const label = byDevice || byType || byCode || "Unknown";
          const key = label.replace(/\s+/g, " ").trim();
          deviceCounts[key] = (deviceCounts[key] || 0) + 1;
        });

        const sortedDevices = Object.entries(deviceCounts)
          .map(([device, count]) => ({
            device,
            count,
            percentage: ((count / maintenanceData.length) * 100).toFixed(1)
          }))
          .sort((a, b) => b.count - a.count);

        setDeviceData(sortedDevices);
      } catch (error) {
        console.error("Error loading maintenance data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const colors = [
    "#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981",
    "#06b6d4", "#6366f1", "#f97316", "#14b8a6", "#a855f7",
    "#ef4444", "#84cc16", "#f43f5e", "#0ea5e9", "#d946ef"
  ];

  const topDevices = deviceData.slice(0, topCount);
  const totalMaintenance = deviceData.reduce((sum, d) => sum + d.count, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading maintenance analytics...</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{payload[0].payload.device}</p>
          <p className="text-blue-600 font-bold text-lg">{payload[0].value} records</p>
          <p className="text-sm text-gray-600">{payload[0].payload.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Device Maintenance Analytics</h1>
              <p className="text-sm text-gray-500">Track maintenance volume across device types</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('bar')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'bar' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Bar Chart
              </button>
              <button
                onClick={() => setViewMode('pie')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'pie' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Pie Chart
              </button>
            </div>
            
            <select
              value={topCount}
              onChange={(e) => setTopCount(Number(e.target.value))}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm font-medium hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={15}>Top 15</option>
              <option value={20}>Top 20</option>
              <option value={deviceData.length}>All ({deviceData.length})</option>
            </select>
          </div>
        </div>

        {/* Stats Cards - Updated to match governorate dashboard style */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Total Records</p>
            <p className="text-3xl font-bold text-blue-600">{totalMaintenance}</p>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Device Types</p>
            <p className="text-3xl font-bold text-purple-600">{deviceData.length}</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Top Device</p>
            <p className="text-xl font-bold text-red-600 truncate">{deviceData[0]?.device}</p>
            <p className="text-sm text-gray-600">{deviceData[0]?.count} records</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Average/Type</p>
            <p className="text-3xl font-bold text-green-600">{(totalMaintenance / deviceData.length).toFixed(1)}</p>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm" ref={chartRef}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Maintenance Volume Visualization</h2>
            <ExportButton targetRef={chartRef} fileName="device-maintenance-chart.png" />
          </div>

          {viewMode === 'bar' ? (
            <ResponsiveContainer width="100%" height={450}>
              <BarChart data={topDevices} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
                <defs>
                  {topDevices.map((entry, index) => (
                    <linearGradient key={`gradient-${index}`} id={`colorGradient${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={colors[index % colors.length]} stopOpacity={0.8}/>
                      <stop offset="100%" stopColor={colors[index % colors.length]} stopOpacity={0.4}/>
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="device" 
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  interval={0}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis tick={{ fontSize: 12, fill: '#6b7280' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]} animationDuration={1000}>
                  {topDevices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#colorGradient${index})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={450}>
              <PieChart>
                <Pie
                  data={topDevices}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({device, percentage}) => `${device}: ${percentage}%`}
                  outerRadius={150}
                  fill="#8884d8"
                  dataKey="count"
                  animationDuration={1000}
                >
                  {topDevices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Detailed Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Device Type</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Count</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Percentage</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {topDevices.map((device, index) => (
                  <tr key={device.device} className="hover:bg-blue-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-white text-sm shadow-md ${
                        index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400' :
                        index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                        'bg-gradient-to-br from-blue-400 to-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }}></div>
                        <span className="font-semibold text-gray-900">{device.device}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-800">
                        {device.count}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-lg font-bold text-gray-900">{device.percentage}%</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-3 rounded-full transition-all duration-1000 ease-out"
                            style={{
                              width: `${device.percentage}%`,
                              background: `linear-gradient(90deg, ${colors[index % colors.length]}, ${colors[index % colors.length]}dd)`
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-12 text-right">{device.count}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Additional Insights */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6 shadow-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Top 3 Devices Account For</p>
              <p className="text-3xl font-bold text-blue-600">
                {((deviceData.slice(0, 3).reduce((sum, d) => sum + d.count, 0) / totalMaintenance) * 100).toFixed(1)}%
              </p>
              <p className="text-sm text-gray-500 mt-1">of all maintenance records</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">Bottom 50% Devices</p>
              <p className="text-3xl font-bold text-purple-600">
                {Math.floor(deviceData.length / 2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">have minimal maintenance volume</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Chart1;