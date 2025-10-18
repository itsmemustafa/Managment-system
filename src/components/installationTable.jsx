import { getAllInstallations } from "@/db/dbService";
import React, { useState, useEffect, useMemo } from "react";
import ExportCSV from '@/components/ExportCSV';
import getUser from "../Utils/getUser";

const AdvancedInstallationsTable = () => {
  const [installations, setInstallations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("orderNumber");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterGovernorate, setFilterGovernorate] = useState("all");
  const [filterBrand, setFilterBrand] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const loadInstallations = async () => {
      try {
        const data = await getAllInstallations();
        // Add unique IDs to each record to prevent key conflicts
        const dataWithIds = data.map((item, index) => ({
          ...item,
          uniqueId: item.id || item._id || `${item.orderNumber}-${item.date}-${index}-${Date.now()}`
        }));
        setInstallations(dataWithIds);
        setError(null);
      } catch (error) {
        console.error("Error loading installations:", error);
        setError("Failed to load installation records. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadInstallations(); 
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
    return [...new Set(installations.map((i) => i.governorate))].sort();
  }, [installations]);

  const uniqueBrands = useMemo(() => {
    return [...new Set(installations.map((i) => i.brand))].sort();
  }, [installations]);

  const filteredAndSortedInstallations = useMemo(() => {
    let filtered = installations;

    // Search filter with safer implementation
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((i) => {
        const searchableFields = [
          i.customerName,
          i.orderNumber?.toString(),
          i.governorate,
          i.productModel,
          i.brand,
          i.address,
          i.raisedBy
        ];
        
        return searchableFields.some(field => 
          field && field.toString().toLowerCase().includes(query)
        );
      });
    }

    if (filterGovernorate !== "all") {
      filtered = filtered.filter((i) => i.governorate === filterGovernorate);
    }

    if (filterBrand !== "all") {
      filtered = filtered.filter((i) => i.brand === filterBrand);
    }

    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

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
  }, [installations, sortField, sortDirection, filterGovernorate, filterBrand, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (e) {
      return "Invalid Date";
    }
  };

  if (loading) {
    return <div className="p-4 text-gray-600">Loading installation records...</div>;
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-h-[calc(100vh-70px)] overflow-y-scroll">
      <h1 className="text-2xl font-bold mb-6">Installation Records</h1>
      {(() => {
        const cu = getUser('currentUser');
        const role = String(cu?.role || '').toUpperCase();
        if (role === 'ADMIN' || role === 'SUPERVISOR') {
          const cols = [
            { key: 'orderNumber', label: 'Order #' },
            { key: 'date', label: 'Date' },
            { key: 'customerName', label: 'Customer' },
            { key: 'governorate', label: 'Governorate' },
            { key: 'productModel', label: 'Product' },
            { key: 'brand', label: 'Brand' },
            { key: 'quantity', label: 'Qty' },
            { key: 'notes', label: 'Notes' },
          ];
          const data = filteredAndSortedInstallations.map(r => ({
            orderNumber: r.orderNumber || '',
            date: r.date ? new Date(r.date).toISOString().slice(0,10) : '',
            customerName: r.customerName || '',
            governorate: r.governorate || '',
            productModel: r.productModel || '',
            brand: r.brand || '',
            quantity: r.quantity ?? 0,
            notes: r.notes || '',
          }));
          return (
            <div className="mb-4">
              <ExportCSV data={data} columns={cols} fileName="installations.csv" />
            </div>
          );
        }
        return null;
      })()}
      
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by customer, order number, governorate, product, brand, address, or raised by..."
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
                onClick={() => handleSort("productModel")}
              >
                Product{" "}
                {sortField === "productModel" && (sortDirection === "asc" ? "↑" : "↓")}
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
                onClick={() => handleSort("quantity")}
              >
                Qty{" "}
                {sortField === "quantity" && (sortDirection === "asc" ? "↑" : "↓")}
              </th>
              <th className="px-3 py-2 text-left font-medium text-xs">Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedInstallations.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-8 text-center text-gray-500"
                >
                  No installation records found matching the filters
                </td>
              </tr>
            ) : (
              filteredAndSortedInstallations.map((record) => (
                <tr
                  key={record.uniqueId}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-3 py-2 font-medium text-xs">
                    {record.orderNumber || "N/A"}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-xs">
                    {formatDate(record.date)}
                  </td>
                  <td className="px-3 py-2 text-xs">{record.customerName || "N/A"}</td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {record.governorate || "N/A"}
                    </span>
                  </td>
                  <td className="px-3 py-2 max-w-xs truncate text-xs">
                    {record.productModel || "N/A"}
                  </td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {record.brand || "N/A"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center text-xs">
                    <span className="px-2 py-1 rounded-full bg-green-100 text-green-800 font-medium">
                      {record.quantity || 0}
                    </span>
                  </td>
                  <td className="px-3 py-2 max-w-xs truncate text-xs" title={record.notes}>
                    {record.notes || "-"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        Showing {filteredAndSortedInstallations.length} of {installations.length} installation records
      </div>
    </div>
  );
};

export default AdvancedInstallationsTable;