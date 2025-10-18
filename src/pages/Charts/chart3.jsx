import React, { useState, useEffect, useRef } from "react";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { getAllMaintenance } from "@/db/dbService";
import ExportButton from "@/components/ExportPNG";
import ExportCSV from '@/components/ExportCSV';
import getUser from "@/Utils/getUser";

const CasesOverTimeTrend = () => {
  const [timeData, setTimeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFrame, setTimeFrame] = useState("daily");
  const [chartType, setChartType] = useState("line");
const chartRef=useRef();

  useEffect(() => {
    const loadData = async () => {
      try {
        const maintenanceData = await getAllMaintenance();
        processTimeData(maintenanceData, timeFrame);
      } catch (error) {
        console.error("Error loading maintenance data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [timeFrame]);

  const processTimeData = (data, frame) => {
    const timeCounts = {};

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
    });


    const sortedData = Object.entries(timeCounts)
      .map(([date, count]) => ({
        date,
        count,
        displayDate: formatDisplayDate(date, frame)
      }))
      .sort((a, b) => a.date.localeCompare(b.date));


    const withAverage = sortedData.map((item, index) => {
      const start = Math.max(0, index - 2);
      const end = Math.min(sortedData.length, index + 3);
      const window = sortedData.slice(start, end);
      const average = window.reduce((sum, d) => sum + d.count, 0) / window.length;
      return {
        ...item,
        average: Math.round(average * 10) / 10
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
      return `Week of ${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
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

    const recentAvg = recent.reduce((sum, d) => sum + d.count, 0) / recent.length;
    const previousAvg = previous.reduce((sum, d) => sum + d.count, 0) / previous.length;

    const change = ((recentAvg - previousAvg) / previousAvg) * 100;

    return {
      direction: change > 5 ? "up" : change < -5 ? "down" : "stable",
      percentage: Math.abs(change).toFixed(1)
    };
  };

  const trend = calculateTrend();
  const totalCases = timeData.reduce((sum, d) => sum + d.count, 0);
  const avgCases = timeData.length > 0 ? (totalCases / timeData.length).toFixed(1) : 0;
  const maxCases = Math.max(...timeData.map(d => d.count), 0);
  const peakDate = timeData.find(d => d.count === maxCases);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading trend data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold">Maintenance Cases Over Time</h1>
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

      {/* Trend Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Total Cases</p>
          <p className="text-3xl font-bold text-gray-800">{totalCases}</p>
          <p className="text-sm text-blue-600">All time</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Average per Period</p>
          <p className="text-3xl font-bold text-gray-800">{avgCases}</p>
          <p className="text-sm text-blue-600">{timeFrame} average</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Peak Cases</p>
          <p className="text-3xl font-bold text-gray-800">{maxCases}</p>
          <p className="text-sm text-blue-600">{peakDate?.displayDate || "N/A"}</p>
        </div>
        <div className={`rounded-lg border p-4 shadow-sm ${
          trend.direction === "up" ? "bg-red-50 border-red-200" :
          trend.direction === "down" ? "bg-green-50 border-green-200" :
          "bg-blue-50 border-blue-200"
        }`}>
          <p className="text-sm text-gray-600 mb-1">Trend</p>
          <div className="flex items-center gap-2">
            <p className={`text-3xl font-bold ${
              trend.direction === "up" ? "text-red-600" :
              trend.direction === "down" ? "text-green-600" :
              "text-blue-600"
            }`}>
              {trend.direction === "up" ? "↑" : trend.direction === "down" ? "↓" : "→"}
            </p>
            <p className={`text-2xl font-bold ${
              trend.direction === "up" ? "text-red-600" :
              trend.direction === "down" ? "text-green-600" :
              "text-blue-600"
            }`}>
              {trend.percentage}%
            </p>
          </div>
          <p className={`text-sm ${
            trend.direction === "up" ? "text-red-600" :
            trend.direction === "down" ? "text-green-600" :
            "text-blue-600"
          }`}>
            {trend.direction === "up" ? "Increasing" :
             trend.direction === "down" ? "Decreasing" :
             "Stable"}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm" ref={chartRef}>
        <h2 className="text-lg font-semibold mb-4">Cases Trend Chart</h2>
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
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Cases" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="average" 
                name="Moving Average" 
                stroke="#f59e0b" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            </LineChart>
          ) : (
            <AreaChart data={timeData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorAverage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1}/>
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
              <YAxis />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="count" 
                name="Cases" 
                stroke="#3b82f6" 
                fillOpacity={1}
                fill="url(#colorCount)"
              />
              <Area 
                type="monotone" 
                dataKey="average" 
                name="Moving Average" 
                stroke="#f59e0b" 
                strokeDasharray="5 5"
                fillOpacity={1}
                fill="url(#colorAverage)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
       
      </div>
 <ExportButton targetRef={chartRef} fileName="chart.png"  />
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
                const change = prev ? p.count - prev.count : 0;
                return { ...p, change };
              });
              const cols = [
                { key: 'displayDate', label: 'Period' },
                { key: 'count', label: 'Cases' },
                { key: 'average', label: 'Moving Avg' },
                { key: 'change', label: 'Change' },
              ];
              const data = recent.slice().reverse().map(r => ({
                displayDate: r.displayDate,
                count: r.count,
                average: r.average,
                change: r.change,
              }));
              return <ExportCSV data={data} columns={cols} fileName="trend-breakdown.csv" />;
            }
            return null;
          })()}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Period</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Cases</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Moving Avg</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Trend</th>
              </tr>
            </thead>
            <tbody>
              {timeData.slice(-10).reverse().map((period, index) => {
                const prevPeriod = timeData[timeData.length - 10 + (9 - index) - 1];
                const change = prevPeriod ? period.count - prevPeriod.count : 0;
                return (
                  <tr key={period.date} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium">{period.displayDate}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                        {period.count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {period.average}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {change > 0 ? (
                        <span className="text-red-600">↑ +{change}</span>
                      ) : change < 0 ? (
                        <span className="text-green-600">↓ {change}</span>
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

export default CasesOverTimeTrend;