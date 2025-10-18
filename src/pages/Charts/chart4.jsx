import React, { useState, useEffect, useReducer, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { getAllMaintenance, getAllInstallations } from "@/db/dbService";
import ExportButton from "@/components/ExportPNG";
import ExportCSV from '@/components/ExportCSV';
import getUser from "@/Utils/getUser";

const GovernoratePerformanceDashboard = () => {
  const [governorateData, setGovernorateData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("totalActivity");
  const chartRef=useRef();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [maintenanceData, installationData] = await Promise.all([
          getAllMaintenance(),
          getAllInstallations()
        ]);

        const govStats = {};

        maintenanceData.forEach((record) => {
          const gov = record.governorate || "Unknown";
          if (!govStats[gov]) {
            govStats[gov] = {
              governorate: gov,
              maintenanceCount: 0,
              installationCount: 0,
              projectRelated: 0
            };
          }
          govStats[gov].maintenanceCount++;
          if (record.isRelatedToProject) {
            govStats[gov].projectRelated++;
          }
        });

        installationData.forEach((record) => {
          const gov = record.governorate || "Unknown";
          if (!govStats[gov]) {
            govStats[gov] = {
              governorate: gov,
              maintenanceCount: 0,
              installationCount: 0,
              projectRelated: 0
            };
          }
          govStats[gov].installationCount++;
        });
 
        const processedData = Object.values(govStats).map((gov) => ({
          ...gov,
          totalActivity: gov.maintenanceCount + gov.installationCount,
          maintenanceRatio: gov.maintenanceCount / (gov.maintenanceCount + gov.installationCount),
          projectPercentage: gov.maintenanceCount > 0 
            ? ((gov.projectRelated / gov.maintenanceCount) * 100).toFixed(1)
            : 0
        }));

        setGovernorateData(processedData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const sortedData = [...governorateData].sort((a, b) => {
    if (sortBy === "totalActivity") return b.totalActivity - a.totalActivity;
    if (sortBy === "maintenance") return b.maintenanceCount - a.maintenanceCount;
    if (sortBy === "installation") return b.installationCount - a.installationCount;
    if (sortBy === "ratio") return b.maintenanceRatio - a.maintenanceRatio;
    return 0;
  });

  const colors = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];

  if (loading) {
    return <div className="p-6 text-gray-600">Loading governorate data...</div>;
  }

  const totalMaintenance = governorateData.reduce((sum, g) => sum + g.maintenanceCount, 0);
  const totalInstallations = governorateData.reduce((sum, g) => sum + g.installationCount, 0);
  const avgRatio = governorateData.reduce((sum, g) => sum + g.maintenanceRatio, 0) / governorateData.length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Governorate Performance Dashboard</h1>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
          >
            <option value="totalActivity">Total Activity</option>
            <option value="maintenance">Maintenance Count</option>
            <option value="installation">Installation Count</option>
            <option value="ratio">Maintenance Ratio</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Governorates</p>
          <p className="text-3xl font-bold text-blue-600">{governorateData.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Maintenance</p>
          <p className="text-3xl font-bold text-red-600">{totalMaintenance}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Installations</p>
          <p className="text-3xl font-bold text-green-600">{totalInstallations}</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Avg Maintenance Ratio</p>
          <p className="text-3xl font-bold text-purple-600">{(avgRatio * 100).toFixed(0)}%</p>
        </div>
      </div>

      {/* Stacked Bar Chart */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm" ref={chartRef}>
        <h2 className="text-lg font-semibold mb-4">Activity by Governorate</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sortedData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="governorate" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 11 }}
            />
            <YAxis />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
            <Legend />
            <Bar dataKey="maintenanceCount" name="Maintenance" stackId="a" fill="#ef4444" />
            <Bar dataKey="installationCount" name="Installations" stackId="a" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ExportButton targetRef={chartRef} fileName="chart.png"  />
      {/* Detailed Table */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden ">
        <div className="p-4 bg-gray-50 border-b border-gray-300 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Governorate Breakdown</h2>
          {(() => {
            const cu = getUser('currentUser');
            const role = String(cu?.role || '').toUpperCase();
            if (role === 'ADMIN' || role === 'SUPERVISOR') {
              const cols = [
                { key: 'governorate', label: 'Governorate' },
                { key: 'maintenanceCount', label: 'Maintenance' },
                { key: 'installationCount', label: 'Installations' },
                { key: 'totalActivity', label: 'Total' },
                { key: 'maintenanceRatioPct', label: 'Maint. Ratio %' },
                { key: 'projectPercentage', label: 'Project %' },
              ];
              const data = sortedData.map(g => ({
                governorate: g.governorate,
                maintenanceCount: g.maintenanceCount,
                installationCount: g.installationCount,
                totalActivity: g.totalActivity,
                maintenanceRatioPct: ((g.maintenanceRatio || 0) * 100).toFixed(0) + '%',
                projectPercentage: g.projectPercentage + '%',
              }));
              return <ExportCSV data={data} columns={cols} fileName="governorate-breakdown.csv" />;
            }
            return null;
          })()}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Governorate</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Maintenance</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Installations</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Total</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Maint. Ratio</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Project %</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-700">Health</th>
              </tr>
            </thead>
            <tbody>
              {sortedData.map((gov, index) => {
                const healthScore = gov.maintenanceRatio < 0.4 ? "Excellent" : 
                                   gov.maintenanceRatio < 0.6 ? "Good" : 
                                   gov.maintenanceRatio < 0.75 ? "Fair" : "Poor";
                const healthColor = gov.maintenanceRatio < 0.4 ? "bg-green-100 text-green-800" : 
                                   gov.maintenanceRatio < 0.6 ? "bg-blue-100 text-blue-800" : 
                                   gov.maintenanceRatio < 0.75 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800";
                
                return (
                  <tr key={gov.governorate} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{gov.governorate}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 font-semibold">
                        {gov.maintenanceCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                        {gov.installationCount}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold">
                      {gov.totalActivity}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="text-gray-600">{(gov.maintenanceRatio * 100).toFixed(0)}%</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${gov.maintenanceRatio * 100}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {gov.projectPercentage}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${healthColor}`}>
                        {healthScore}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">🏆 Best Performing</h3>
          <div className="space-y-2">
            {sortedData
              .sort((a, b) => a.maintenanceRatio - b.maintenanceRatio)
              .slice(0, 3)
              .map((gov, index) => (
                <div key={gov.governorate} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{index + 1}. {gov.governorate}</span>
                  <span className="text-sm text-green-600 font-semibold">
                    {(gov.maintenanceRatio * 100).toFixed(0)}% maintenance
                  </span>
                </div>
              ))}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">⚠️ Needs Attention</h3>
          <div className="space-y-2">
            {sortedData
              .sort((a, b) => b.maintenanceRatio - a.maintenanceRatio)
              .slice(0, 3)
              .map((gov, index) => (
                <div key={gov.governorate} className="flex items-center justify-between">
                  <span className="text-sm font-medium">{index + 1}. {gov.governorate}</span>
                  <span className="text-sm text-red-600 font-semibold">
                    {(gov.maintenanceRatio * 100).toFixed(0)}% maintenance
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernoratePerformanceDashboard;