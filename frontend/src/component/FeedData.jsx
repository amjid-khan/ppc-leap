import React, { useState, useEffect } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext"; // path adjust as needed

const FeedData = () => {
  const { fetchProducts } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rowsPerPage, setRowsPerPage] = useState(50);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [totalProducts, setTotalProducts] = useState(0);

  const totalPages = Math.ceil(totalProducts / rowsPerPage);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);
      try {
        const data = await fetchProducts();
        let productsArray = data.resources || [];

        // Optional search filter
        if (searchQuery.trim()) {
          productsArray = productsArray.filter((p) =>
            p.title.toLowerCase().includes(searchQuery.toLowerCase())
          );
        }

        setTotalProducts(productsArray.length);

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        setProducts(productsArray.slice(start, end));
      } catch (err) {
        console.error("Error loading products:", err);
      }
      setLoading(false);
    };

    loadProducts();
  }, [currentPage, rowsPerPage, searchQuery, fetchProducts]);

  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handleFirst = () => setCurrentPage(1);
  const handleLast = () => setCurrentPage(totalPages);

  const handleOptimize = (id) => {
    alert(`Optimizing product ID: ${id}`);
  };

  return (
    <div className="p-6 relative min-h-[calc(100vh-64px)] flex flex-col">
      <h1 className="text-2xl font-semibold mb-6 text-slate-800">Feed Data</h1>

      {/* Search Bar */}
      <div className="max-w-md mb-6">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-300 shadow-sm hover:shadow-md transition duration-300 focus-within:border-blue-500 focus-within:shadow-blue-100">
          <Search className="w-5 h-5 text-slate-500" />
          <input
            type="text"
            placeholder="Search feed data..."
            className="w-full bg-transparent outline-none text-slate-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 shadow-sm bg-white flex-1">
        {loading ? (
          <div className="p-6 text-center text-slate-500">Loading products...</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Image</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Brand</th>
                <th className="px-4 py-3">Feed Label</th>
                <th className="px-4 py-3">Product Type</th>
                <th className="px-4 py-3">Google Category</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="border-t hover:bg-slate-50 transition h-16"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">{item.id}</td>
                  <td className="px-4 py-3">
                    <img
                      src={item.imageLink || "https://via.placeholder.com/60"}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover border"
                    />
                  </td>
                  <td className="px-4 py-3 font-medium">{item.title}</td>
                  <td className="px-4 py-3 text-slate-600 line-clamp-2">
                    {item.description}
                  </td>
                  <td className="px-4 py-3">{item.brand || "-"}</td>
                  <td className="px-4 py-3">{item.feedLabel || "-"}</td>
                  <td className="px-4 py-3">{item.productType || "-"}</td>
                  <td className="px-4 py-3">{item.googleCategory || "-"}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleOptimize(item.id)}
                      className="px-3 py-1 bg-gray-600 text-white rounded hover:bg-blue-700 transition text-sm"
                    >
                      Optimize
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination / Rows Selector */}
      <div className="sticky bottom-0 w-full bg-white border-t border-slate-200 flex flex-col md:flex-row items-center justify-end px-4 py-3 shadow-md mt-4">
        <div className="flex items-center gap-4 mb-2 md:mb-0">
          <div className="flex items-center gap-2">
            <label className="text-slate-700 text-sm font-medium">Show rows</label>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-1 rounded border border-slate-300 bg-white text-sm"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
              <option value={500}>500</option>
            </select>
          </div>
          <div className="text-slate-700 text-sm">
            {`${(currentPage - 1) * rowsPerPage + 1}–${Math.min(
              currentPage * rowsPerPage,
              totalProducts
            )} of ${totalProducts}`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleFirst}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"
          >
            <ChevronsLeft className="w-5 h-5 text-slate-700" />
          </button>
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"
          >
            <ChevronLeft className="w-5 h-5 text-slate-700" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"
          >
            <ChevronRight className="w-5 h-5 text-slate-700" />
          </button>
          <button
            onClick={handleLast}
            disabled={currentPage === totalPages}
            className="p-2 rounded hover:bg-slate-100 disabled:opacity-50"
          >
            <ChevronsRight className="w-5 h-5 text-slate-700" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedData;
  