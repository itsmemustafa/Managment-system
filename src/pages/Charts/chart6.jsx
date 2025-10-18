import React, { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import { getAllInstallations } from "@/db/dbService";
import ExportButton from "@/components/ExportPNG";
import ExportCSV from '@/components/ExportCSV';
import getUser from "@/Utils/getUser";

const TopProductsInstallations = () => {
  const [productData, setProductData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topCount, setTopCount] = useState(10);

  useEffect(() => {
    const loadData = async () => {
      try {
        const installationData = await getAllInstallations();
        
      
        const productCounts = {};
        const productQuantities = {};
        
        installationData.forEach((record) => {
          const product = record.productModel || "Unknown";
          productCounts[product] = (productCounts[product] || 0) + 1;
          productQuantities[product] = (productQuantities[product] || 0) + (record.quantity || 1);
        });

 
        const sortedProducts = Object.entries(productCounts)
          .map(([product, count]) => ({
            product,
            installations: count,
            totalQuantity: productQuantities[product],
            avgQuantity: (productQuantities[product] / count).toFixed(1),
            percentage: ((count / installationData.length) * 100).toFixed(1)
          }))
          .sort((a, b) => b.installations - a.installations);

        setProductData(sortedProducts);
      } catch (error) {
        console.error("Error loading installation data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const colors = [
    "#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ef4444",
    "#ec4899", "#6366f1", "#14b8a6", "#f97316", "#a855f7"
  ];

  const topProducts = productData.slice(0, topCount);
  const totalInstallations = productData.reduce((sum, d) => sum + d.installations, 0);
  const totalQuantity = productData.reduce((sum, d) => sum + d.totalQuantity, 0);
  const chartRef=useRef()

  if (loading) {
    return <div className="p-6 text-gray-600">Loading installation data...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Top Products by Installation Volume</h1>
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
            <option value={productData.length}>All</option>
          </select>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Installations</p>
            <p className="text-3xl font-bold text-green-600">{totalInstallations}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Units Installed</p>
            <p className="text-3xl font-bold text-green-600">{totalQuantity}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Product Types</p>
            <p className="text-3xl font-bold text-green-600">{productData.length}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-lg border border-gray-300 p-6 shadow-sm" ref={chartRef}>
        <h2 className="text-lg font-semibold mb-4">Installation Volume Chart</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={topProducts} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="product" 
              angle={-45}
              textAnchor="end"
              height={120}
              interval={0}
              tick={{ fontSize: 10 }}
            />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              formatter={(value, name) => {
                if (name === "installations") return [value, 'Installations'];
                if (name === "totalQuantity") return [value, 'Total Units'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="installations" name="Installations" radius={[8, 8, 0, 0]}>
              {topProducts.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ExportButton targetRef={chartRef} fileName="chart.png"  />

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-300 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-300 flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Product Breakdown Table</h2>
          {(() => {
            const cu = getUser('currentUser');
            const role = String(cu?.role || '').toUpperCase();
            if (role === 'ADMIN' || role === 'SUPERVISOR') {
              const cols = [
                { key: 'rank', label: 'Rank' },
                { key: 'product', label: 'Product Model' },
                { key: 'installations', label: 'Installations' },
                { key: 'totalQuantity', label: 'Total Units' },
                { key: 'avgQuantity', label: 'Avg Qty' },
                { key: 'percentage', label: 'Percentage' },
              ];
              const data = topProducts.map((p, i) => ({
                rank: i + 1,
                product: p.product,
                installations: p.installations,
                totalQuantity: p.totalQuantity,
                avgQuantity: p.avgQuantity,
                percentage: p.percentage + '%',
              }));
              return <ExportCSV data={data} columns={cols} fileName="product-installations.csv" />;
            }
            return null;
          })()}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Product Model</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Installations</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Total Units</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Avg Qty</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-700">Percentage</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700">Visual</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((product, index) => (
                <tr key={product.product} className="border-b border-gray-200 hover:bg-gray-50">
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
                  <td className="px-4 py-3 text-sm font-medium max-w-xs truncate" title={product.product}>
                    {product.product}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800">
                      {product.installations}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800">
                      {product.totalQuantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {product.avgQuantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-gray-600">
                    {product.percentage}%
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="h-2.5 rounded-full"
                        style={{
                          width: `${product.percentage}%`,
                          backgroundColor: colors[index % colors.length]
                        }}
                      />
                    </div>
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
          <p className="text-sm text-gray-600 mb-1">Most Installed Product</p>
          <p className="text-xl font-bold text-gray-800 truncate" title={productData[0]?.product}>
            {productData[0]?.product}
          </p>
          <p className="text-sm text-green-600">{productData[0]?.installations} installations</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Top 3 Products</p>
          <p className="text-xl font-bold text-gray-800">
            {productData.slice(0, 3).reduce((sum, d) => sum + d.installations, 0)}
          </p>
          <p className="text-sm text-green-600">
            {((productData.slice(0, 3).reduce((sum, d) => sum + d.installations, 0) / totalInstallations) * 100).toFixed(1)}% of total
          </p>
        </div>
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm">
          <p className="text-sm text-gray-600 mb-1">Average per Product Type</p>
          <p className="text-xl font-bold text-gray-800">
            {(totalInstallations / productData.length).toFixed(1)}
          </p>
          <p className="text-sm text-green-600">installations</p>
        </div>
      </div>
    </div>
  );
};

export default TopProductsInstallations;