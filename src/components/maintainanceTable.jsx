import { getAllMaintenance } from "@/db/dbService";
import React, { useState, useEffect, useMemo } from "react";
import ExportCSV from '@/components/ExportCSV';
import getUser from "../Utils/getUser";

const AdvancedMaintenanceTable = () => {
  const [maintenance, setMaintenance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState("orderNumber");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterGovernorate, setFilterGovernorate] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [filterProject, setFilterProject] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadMaintenance = async () => {
      try {
        const data = await getAllMaintenance();
      
        const dataWithIndex = data.map((record, index) => ({
          ...record,
          uniqueId: `${record.orderNumber}-${index}`
        }));
        setMaintenance(dataWithIndex);
      } catch (error) {
        console.error("Error loading maintenance:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMaintenance();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const uniqueGovernorates = useMemo(() => {
    return [...new Set(maintenance.map((m) => m.governorate))].sort();
  }, [maintenance]);

  const uniqueBrands = useMemo(() => {
    return [...new Set(maintenance.map((m) => m.brand))].sort();
  }, [maintenance]);

  const filteredAndSortedMaintenance = useMemo(() => {
    let filtered = maintenance;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((m) =>
        (m.customerName && m.customerName.toLowerCase().includes(query)) ||
        (m.orderNumber && m.orderNumber.toString().includes(query)) ||
        (m.governorate && m.governorate.toLowerCase().includes(query)) ||
        (m.device && m.device.toLowerCase().includes(query)) ||
        (m.brand && m.brand.toLowerCase().includes(query)) ||
        (m.defectDescription && m.defectDescription.toLowerCase().includes(query)) ||
        (m.raisedBy && m.raisedBy.toLowerCase().includes(query))
      );
    }

    if (filterGovernorate !== "all") {
      filtered = filtered.filter((m) => m.governorate === filterGovernorate);
    }

    if (filterBrand !== "all") {
      filtered = filtered.filter((m) => m.brand === filterBrand);
    }

    if (filterProject !== "all") {
      filtered = filtered.filter((m) =>
        filterProject === "yes" ? m.isRelatedToProject : !m.isRelatedToProject
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "date" || sortField === "raisedAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [maintenance, sortField, sortDirection, filterGovernorate, filterBrand, filterProject, searchQuery]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return <div className="p-4 text-gray-600">Loading maintenance records...</div>;
  }

  return (
    <div className="p-6 max-w-full">
      <h1 className="text-2xl font-bold mb-6">Maintenance Records</h1>
      {(() => {
        const cu = getUser('currentUser');
        const role = String(cu?.role || '').toUpperCase();
        if (role === 'ADMIN' || role === 'SUPERVISOR') {
          const cols = [
            { key: 'orderNumber', label: 'Order #' },
            { key: 'date', label: 'Date' },
            { key: 'customerName', label: 'Customer' },
            { key: 'governorate', label: 'Governorate' },
            { key: 'device', label: 'Device' },
            { key: 'brand', label: 'Brand' },
            { key: 'isRelatedToProject', label: 'Project' },
            { key: 'defectDescription', label: 'Defect' },
          ];
          const data = filteredAndSortedMaintenance.map(r => ({
            orderNumber: r.orderNumber ?? '',
            date: r.date ? new Date(r.date).toISOString().slice(0,10) : '',
            customerName: r.customerName ?? '',
            governorate: r.governorate ?? '',
            device: r.device ?? '',
            brand: r.brand ?? '',
            isRelatedToProject: r.isRelatedToProject ? 'Yes' : 'No',
            defectDescription: r.defectDescription ?? '',
          }));
          return (
            <div className="mb-4">
              <ExportCSV data={data} columns={cols} fileName="maintenance.csv" />
            </div>
          );
        }
        return null;
      })()}
      
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by customer, order number, governorate, device, brand, defect, or raised by..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      
      <div className="mb-4 flex gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-medium mb-1">
            Filter by Governorate:
          </label>
          <select
            value={filterGovernorate}
            onChange={(e) => setFilterGovernorate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All Governorates</option>
            {uniqueGovernorates.map((gov) => (
              <option key={gov} value={gov}>
                {gov}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Filter by Brand:
          </label>
          <select
            value={filterBrand}
            onChange={(e) => setFilterBrand(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All Brands</option>
            {uniqueBrands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Related to Project:
          </label>
          <select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md bg-white"
          >
            <option value="all">All</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <div className="rounded-lg border border-gray-300 overflow-x-auto bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th
                className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-100 text-xs"
                onClick={() => handleSort("orderNumber")}
              >
                Order #{" "}
                {sortField === "orderNumber" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-100 text-xs"
                onClick={() => handleSort("date")}
              >
                Date{" "}
                {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-100 text-xs"
                onClick={() => handleSort("customerName")}
              >
                Customer{" "}
                {sortField === "customerName" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-100 text-xs"
                onClick={() => handleSort("governorate")}
              >
                Gov.{" "}
                {sortField === "governorate" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-100 text-xs"
                onClick={() => handleSort("brand")}
              >
                Brand{" "}
                {sortField === "brand" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th
                className="px-3 py-2 text-left font-medium cursor-pointer hover:bg-gray-100 text-xs"
                onClick={() => handleSort("isRelatedToProject")}
              >
                Project{" "}
                {sortField === "isRelatedToProject" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-3 py-2 text-left font-medium text-xs">Defect</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedMaintenance.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-8 text-center text-gray-500"
                >
                  No maintenance records found matching the filters
                </td>
              </tr>
            ) : (
              filteredAndSortedMaintenance.map((record) => (
                <tr key={record.uniqueId} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-3 py-2 font-medium text-xs">
                    {record.orderNumber}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-3 py-2 text-xs">{record.customerName}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {record.governorate}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {record.brand}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.isRelatedToProject
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {record.isRelatedToProject ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-3 py-2 max-w-xs truncate text-xs" title={record.defectDescription}>
                    {record.defectDescription}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredAndSortedMaintenance.length} of {maintenance.length} maintenance records
      </div>
    </div>
  );
};

export default AdvancedMaintenanceTable;