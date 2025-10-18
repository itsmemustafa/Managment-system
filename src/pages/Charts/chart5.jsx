import React, { useState, useEffect, useRef } from "react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { getAllMaintenance } from "@/db/dbService";
import ExportButton from "@/components/ExportPNG";
import ExportCSV from '@/components/ExportCSV';
import getUser from "@/Utils/getUser";

const ProjectImpactAnalysis = () => {
  const [projectData, setProjectData] = useState({
    projectRelated: 0,
    nonProjectRelated: 0,
    projectNames: [],
    deviceBreakdown: [],
    timelineData: []
  });
  const [loading, setLoading] = useState(true);
  const chartRef = useRef();

  useEffect(() => {
    const loadData = async () => {
      try {
        const maintenanceData = await getAllMaintenance();

     
        const projectRelated = maintenanceData.filter(m => m.isRelatedToProject).length;
        const nonProjectRelated = maintenanceData.length - projectRelated;


        const projectCounts = {};
        maintenanceData
          .filter(m => m.isRelatedToProject && m.projectName)
          .forEach(m => {
            projectCounts[m.projectName] = (projectCounts[m.projectName] || 0) + 1;
          });

        const projectNames = Object.entries(projectCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);

        
        const deviceStats = {};
        maintenanceData.forEach(m => {
          const device = m.device || "Unknown";
          if (!deviceStats[device]) {
            deviceStats[device] = { device, project: 0, nonProject: 0 };
          }
          if (m.isRelatedToProject) {
            deviceStats[device].project++;
          } else {
            deviceStats[device].nonProject++;
          }
        });

        const deviceBreakdown = Object.values(deviceStats)
          .sort((a, b) => (b.project + b.nonProject) - (a.project + a.nonProject))
          .slice(0, 10);

        
        const timelineCounts = {};
        maintenanceData.forEach(m => {
          const date = new Date(m.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (!timelineCounts[monthKey]) {
            timelineCounts[monthKey] = { month: monthKey, project: 0, nonProject: 0 };
          }
          
          if (m.isRelatedToProject) {
            timelineCounts[monthKey].project++;
          } else {
            timelineCounts[monthKey].nonProject++;
          }
        });

        const timelineData = Object.values(timelineCounts)
          .sort((a, b) => a.month.localeCompare(b.month))
          .map(item => ({
            ...item,
            displayMonth: new Date(item.month + "-01").toLocaleDateString("en-US", { 
              month: "short", 
              year: "numeric" 
            })
          }));

        setProjectData({
          projectRelated,
          nonProjectRelated,
          projectNames,
          deviceBreakdown,
          timelineData
        });
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="p-6 text-gray-600">Loading project impact data...</div>;
  }

  const pieData = [
    { name: "Project Related", value: projectData.projectRelated },
    { name: "Non-Project", value: projectData.nonProjectRelated }
  ];

  const colors = ["#3b82f6", "#94a3b8"];
  const total = projectData.projectRelated + projectData.nonProjectRelated;
  const projectPercentage = ((projectData.projectRelated / total) * 100).toFixed(1);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Project Impact Analysis</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total Maintenance</p>
          <p className="text-3xl font-bold text-blue-600">{total}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Project Related</p>
          <p className="text-3xl font-bold text-green-600">{projectData.projectRelated}</p>
          <p className="text-sm text-gray-600">{projectPercentage}% of total</p>
        </div>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Non-Project</p>
          <p className="text-3xl font-bold text-gray-600">{projectData.nonProjectRelated}</p>
          <p className="text-sm text-gray-600">{(100 - projectPercentage).toFixed(1)}% of total</p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Active Projects</p>
          <p className="text-3xl font-bold text-purple-600">{projectData.projectNames.length}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div ref={chartRef}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" >
        {/* Pie Chart */}
        <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Project vs Non-Project Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={(entry) => `${entry.name}: ${entry.value} (${((entry.value / total) * 100).toFixed(1)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Top Projects Bar Chart */}
        <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Top Projects by Maintenance Volume</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectData.projectNames} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={80}
                interval={0}
                tick={{ fontSize: 9 }}
              />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm" >
        <h2 className="text-lg font-semibold mb-4">Maintenance Trends Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={projectData.timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="displayMonth" 
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
              tick={{ fontSize: 11 }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="project" name="Project Related" stroke="#3b82f6" strokeWidth={2} />
            <Line type="monotone" dataKey="nonProject" name="Non-Project" stroke="#94a3b8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Device Breakdown Chart */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm" >
        <h2 className="text-lg font-semibold mb-4">Device Type Breakdown: Project vs Non-Project</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={projectData.deviceBreakdown} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="device" 
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              tick={{ fontSize: 10 }}
            />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="project" name="Project Related" stackId="a" fill="#3b82f6" />
            <Bar dataKey="nonProject" name="Non-Project" stackId="a" fill="#94a3b8" />
          </BarChart>
        </ResponsiveContainer>
        
      </div></div>
      <ExportButton targetRef={chartRef} fileName="chart.png"  />
      {/* Top Projects Table */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-300 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Project Details</h2>
          {(() => {
            const cu = getUser('currentUser');
            const role = String(cu?.role || '').toUpperCase();
            if (role === 'ADMIN' || role === 'SUPERVISOR') {
              const cols = [
                { key: 'rank', label: 'Rank' },
                { key: 'name', label: 'Project Name' },
                { key: 'count', label: 'Maintenance Count' },
                { key: 'percentage', label: '% of Project Issues' },
                { key: 'impact', label: 'Impact' },
              ];
              const data = projectData.projectNames.map((p, i) => ({
                rank: i + 1,
                name: p.name,
                count: p.count,
                percentage: projectData.projectRelated ? ((p.count / projectData.projectRelated) * 100).toFixed(1) + '%' : '0%',
                impact: p.count > projectData.projectRelated * 0.2 ? 'High' : p.count > projectData.projectRelated * 0.1 ? 'Medium' : 'Low',
              }));
              return <ExportCSV data={data} columns={cols} fileName="project-details.csv" />;
            }
            return null;
          })()}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Project Name</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Maintenance Count</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">% of Project Issues</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Impact</th>
              </tr>
            </thead>
            <tbody>
              {projectData.projectNames.map((project, index) => {
                const percentage = ((project.count / projectData.projectRelated) * 100).toFixed(1);
                const impact = project.count > projectData.projectRelated * 0.2 ? "High" :
                              project.count > projectData.projectRelated * 0.1 ? "Medium" : "Low";
                const impactColor = impact === "High" ? "bg-red-100 text-red-800" :
                                   impact === "Medium" ? "bg-yellow-100 text-yellow-800" :
                                   "bg-green-100 text-green-800";
                
                return (
                  <tr key={project.name} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-bold text-white text-xs ${
                        index === 0 ? 'bg-yellow-500' :
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-600' :
                        'bg-gray-300'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium max-w-xs truncate" title={project.name}>
                      {project.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">
                      <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 font-semibold">
                        {project.count}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-gray-600">
                      {percentage}%
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${impactColor}`}>
                        {impact}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">Project Contribution</h3>
          <p className="text-sm text-gray-700">
            Project-related maintenance accounts for <span className="font-bold text-blue-600">{projectPercentage}%</span> of all maintenance activities, indicating {projectPercentage > 50 ? "significant" : "moderate"} project impact on overall maintenance workload.
          </p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-green-800 mb-2">Top Project</h3>
          <p className="text-sm text-gray-700">
            <span className="font-bold text-green-600">{projectData.projectNames[0]?.name || "N/A"}</span> leads with {projectData.projectNames[0]?.count || 0} maintenance issues, requiring focused attention.
          </p>
        </div>
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-purple-800 mb-2">Recommendation</h3>
          <p className="text-sm text-gray-700">
            {projectPercentage > 60 
              ? "High project maintenance suggests need for better quality control during installation."
              : "Balanced maintenance distribution indicates good project planning."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectImpactAnalysis;