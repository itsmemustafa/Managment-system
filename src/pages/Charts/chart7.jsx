import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getAllInstallations } from "@/db/dbService";
import ExportButton from "@/components/ExportPNG";
import { User } from "lucide-react";
import ExportCSV from '@/components/ExportCSV';
import getUser from "@/Utils/getUser";

const InstallationTrends = () => {
  const [timeData, setTimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState("daily");
  const [chartType, setChartType] = useState("area");
  const chartRef=useRef();

  useEffect(() => {

    const loadData = async () => {
      try {
        const installationData = await getAllInstallations();
        processTimeData(installationData, timeFrame);
      } catch (error) {
        console.error("Error loading installation data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeFrame]);

  const processTimeData = (data, frame) => {
    const timeCounts = {};
    const timeQuantities = {};

    data.forEach((record) => {
      const date = new Date(record.date);
      let key;

      if (frame === "daily") {
        key = date.toISOString().split("T")[0];
      } else if (frame === "weekly") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split("T")[0];
      } else if (frame === "monthly") {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      }

      timeCounts[key] = (timeCounts[key] || 0) + 1;
      timeQuantities[key] = (timeQuantities[key] || 0) + (record.quantity || 1);
    });

    const sortedData = Object.entries(timeCounts)
      .map(([date, count]) => ({
        date,
        installations: count,
        units: timeQuantities[date],
        displayDate: formatDisplayDate(date, frame)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

   
    const withAverage = sortedData.map((item, index) => {
      const start = Math.max(0, index - 2);
      const end = Math.min(sortedData.length, index + 3);
      const window = sortedData.slice(start, end);
      const avgInstallations = window.reduce((sum, d) => sum + d.installations, 0) / window.length;
      const avgUnits = window.reduce((sum, d) => sum + d.units, 0) / window.length;
      return {
        ...item,
        avgInstallations: Math.round(avgInstallations * 10) / 10,
        avgUnits: Math.round(avgUnits * 10) / 10
      };
    });

    setTimeData(withAverage);
  };

  const formatDisplayDate = (dateStr, frame) => {
    if (frame === "daily") {
      const date = new Date(dateStr);
      return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } else if (frame === "weekly") {
      const date = new Date(dateStr);
      return `Week ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    } else if (frame === "monthly") {
      const [year, month] = dateStr.split("-");
      const date = new Date(year, month - 1);
      return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    }
    return dateStr;
  };

  const calculateTrend = () => {
    if (timeData.length < 2) return { direction: "stable", percentage: 0 };

    const recent = timeData.slice(-7);
    const previous = timeData.slice(-14, -7);

    if (previous.length === 0) return { direction: "stable", percentage: 0 };

    const recentAvg = recent.reduce((sum, d) => sum + d.installations, 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + d.installations, 0) / previous.length;

    const change = ((recentAvg - previousAvg) / previousAvg) * 100;

    return {
      direction: change > 5 ? "up" : change < -5 ? "down" : "stable",
      percentage: Math.abs(change).toFixed(1)
    };
  };

  const trend = calculateTrend();
  const totalInstallations = timeData.reduce((sum, d) => sum + d.installations, 0);
  const totalUnits = timeData.reduce((sum, d) => sum + d.units, 0);
  const avgInstallations = timeData.length > 0 ? (totalInstallations / timeData.length).toFixed(1) : 0;
  const maxInstallations = Math.max(...timeData.map(d => d.installations), 0);
  const peakDate = timeData.find(d => d.installations === maxInstallations);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading trend data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Installation Trends Over Time</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Chart Type:</label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            >
              <option value="line">Line Chart</option>
              <option value="area">Area Chart</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Time Frame:</label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Installations</p>
          <p className="text-3xl font-bold text-gray-800">{totalInstallations}</p>
          <p className="text-sm text-green-600">All time</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Units</p>
          <p className="text-3xl font-bold text-gray-800">{totalUnits}</p>
          <p className="text-sm text-green-600">installed</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Peak Installations</p>
          <p className="text-3xl font-bold text-gray-800">{maxInstallations}</p>
          <p className="text-sm text-green-600">{peakDate?.displayDate || "N/A"}</p>
        </div>
        <div className={`rounded-lg border p-4 shadow-sm ${
          trend.direction === "up" ? "bg-green-50 border-green-200" :
          trend.direction === "down" ? "bg-red-50 border-red-200" :
          "bg-blue-50 border-blue-200"
        }`}>
          <p className="text-sm text-gray-600 mb-1">Trend</p>
          <div className="flex items-center gap-2">
            <p className={`text-3xl font-bold ${
              trend.direction === "up" ? "text-green-600" :
              trend.direction === "down" ? "text-red-600" :
              "text-blue-600"
            }`}>
              {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}
            </p>
            <p className={`text-2xl font-bold ${
              trend.direction === "up" ? "text-green-600" :
              trend.direction === "down" ? "text-red-600" :
              "text-blue-600"
            }`}>
              {trend.percentage}%
            </p>
          </div>
          <p className={`text-sm ${
            trend.direction === "up" ? "text-green-600" :
            trend.direction === "down" ? "text-red-600" :
            "text-blue-600"
          }`}>
            {trend.direction === "up" ? "Growing" :
             trend.direction === "down" ? "Declining" :
             "Stable"}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm" ref={chartRef}>
        <h2 className="text-lg font-semibold mb-4">Installation Trend Chart</h2>
        <ResponsiveContainer width="100%" height={400}>
          {chartType === "line" ? (
            <LineChart data={timeData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={Math.floor(timeData.length / 10) || 0}
                tick={{ fontSize: 11 }}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
              <Legend />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="installations" 
                name="Installations" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right"
                type="monotone" 
                dataKey="units" 
                name="Units Installed" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
              />
              <Line 
                yAxisId="left"
                type="monotone" 
                dataKey="avgInstallations" 
                name="Avg Installations" 
                stroke="#f59e0b" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          ) : (
            <AreaChart data={timeData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <defs>
                <linearGradient id="colorInstallations" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="displayDate" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={Math.floor(timeData.length / 10) || 0}
                tick={{ fontSize: 11 }}
              />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }} />
              <Legend />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="installations" 
                name="Installations" 
                stroke="#10b981" 
                fillOpacity={1}
                fill="url(#colorInstallations)"
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="units" 
                name="Units Installed" 
                stroke="#3b82f6" 
                fillOpacity={1}
                fill="url(#colorUnits)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
        <ExportButton targetRef={chartRef} fileName="chart.png"  />
      </div>

      {/* Recent Data Table */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-300 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Recent Period Breakdown</h2>
          {(() => {
            const cu = getUser('currentUser');
            const role = String(cu?.role || '').toUpperCase();
            if (role === 'ADMIN' || role === 'SUPERVISOR') {
              const recent = timeData.slice(-10).map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const change = prev ? p.installations - prev.installations : 0;
                const avgUnitsPerInstall = p.installations ? (p.units / p.installations).toFixed(1) : '0.0';
                return { ...p, change, avgUnitsPerInstall };
              });
              const cols = [
                { key: 'displayDate', label: 'Period' },
                { key: 'installations', label: 'Installations' },
                { key: 'units', label: 'Units' },
                { key: 'avgUnitsPerInstall', label: 'Avg Units/Install' },
                { key: 'change', label: 'Change' },
              ];
              const data = recent.slice().reverse().map(r => ({
                displayDate: r.displayDate,
                installations: r.installations,
                units: r.units,
                avgUnitsPerInstall: r.avgUnitsPerInstall,
                change: r.change,
              }));
              return <ExportCSV data={data} columns={cols} fileName="installation-trend-breakdown.csv" />;
            }
            return null;
          })()}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Period</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Installations</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Units</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Avg Units/Install</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Trend</th>
              </tr>
            </thead>
            <tbody>
              {timeData.slice(-10).reverse().map((period, index) => {
                const prevPeriod = timeData[timeData.length - 10 + (9 - index) - 1];
                const change = prevPeriod ? period.installations - prevPeriod.installations : 0;
                const avgUnitsPerInstall = (period.units / period.installations).toFixed(1);
                
                return (
                  <tr key={period.date} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{period.displayDate}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
                        {period.installations}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                        {period.units}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {avgUnitsPerInstall}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {change > 0 ? (
                        <span className="text-green-600">↑ +{change}</span>
                      ) : change < 0 ? (
                        <span className="text-red-600">↓ {change}</span>
                      ) : (
                        <span className="text-gray-600">→ 0</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InstallationTrends;