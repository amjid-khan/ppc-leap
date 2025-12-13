import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  ChevronsLeft,
  ChevronsRight,
  Sparkles,
  Database,
  Filter,
  X,
  SearchX,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { SkeletonTableRow } from "./SkeletonLoader";

const FeedData = () => {
  const { getProducts, selectedAccount } = useAuth();
  const [feedData, setFeedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all products (load everything at once)
  useEffect(() => {
    const fetchProductsData = async () => {
      setFeedData([]);
      setTotalItems(0);
      setCurrentPage(1);
      setLoading(true);

      const result = await getProducts(1, 10000);
      if (result.success) {
        const mappedProducts = result.products.map((product) => ({
          id: product.offerId || product.id,
          displayId: product.offerId || product.id,
          status:
            product.approvalStatus?.toLowerCase() === "approved"
              ? "approved"
              : product.approvalStatus?.toLowerCase() === "pending"
              ? "pending"
              : "disapproved",
          title: product.title || "",
          description: product.raw?.description || product.description || "",
          brand: product.brand || "",
          feedLabel: product.raw?.feedLabel || "GB",
          productType: product.raw?.productTypes?.[0] || "",
          googleProductCategory:
            product.raw?.googleProductCategory || "Not specified",
          price: product.price,
          salePrice: product.salePrice,
          availability: product.availability,
          link: product.link,
          imageLink: product.imageLink,
        }));
        setFeedData(mappedProducts);
        setTotalItems(mappedProducts.length);
      } else {
        setFeedData([]);
        setTotalItems(0);
      }

      setLoading(false);
    };

    fetchProductsData();
  }, [getProducts, selectedAccount]);

  // Filter data based on search and status filter
  const filteredData = feedData.filter((item) => {
    const matchesSearch =
      (item.title &&
        item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.brand &&
        item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.id && item.id.toString().includes(searchTerm));

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination for client-side display
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredData.length);
  const currentData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Show description in modal
  const handleViewDescription = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  // Show image in modal
  const handleImageClick = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  // Close modals
  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const closeImageModal = () => {
    setShowImageModal(false);
    setSelectedImage(null);
  };

  // Handle Optimize button click
  const handleOptimize = (itemId) => {
    alert(`Optimizing product ID: ${itemId}`);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCurrentPage(1);
  };

  // Check if any filter is active
  const hasActiveFilters = searchTerm !== "" || statusFilter !== "all";

  return (
    <div className="">
      {/* Header Card - Consistent with Dashboard */}
<div className="mb-6 ">
  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 p-3">
    <div className="flex justify-between items-start ">

      {/* Left Section */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-lg">
            <Database className="text-black dark:text-white" size={26} />
          </div>

          <h1 className="text-3xl font-bold text-black dark:text-white">FeedData</h1>
        </div>

        <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
          Manage and review your product feed data
        </p>
      </div>

      {/* Right Side - Filters */}
      <div className="flex gap-3 w-auto items-center">

        {/* Clear Filter Button */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            <X size={16} />
          </button>
        )}

        {/* Status Filter */}
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 focus:ring-2 focus:ring-blue-500"
          >
            <option value="approved">Approved</option>
            <option value="disapproved">Disapproved</option>
            <option value="pending">Pending</option>
          </select>

          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
            size={16}
          />

        </div>

        {/* Search Box */}
        <div className="relative w-[280px]">
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 text-sm focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={16}
          />
        </div>
      </div>
    </div>
  </div>
</div>



      {/* Table section */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow overflow-hidden mb-24">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-40">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-96">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-96">
                  Description
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-48">
                  Brand
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-32">
                  Feed Label
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-48">
                  Product Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-64">
                  Google Product Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider w-40">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonTableRow key={i} />
                  ))}
                </>
              ) : currentData.length > 0 ? (
                currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 group">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {item.status === "approved" ? (
                          <CheckCircle
                            className="text-green-500 mr-2"
                            size={18}
                          />
                        ) : (
                          <XCircle className="text-red-500 mr-2" size={18} />
                        )}
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            item.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white w-24">
                        <div className="text-xs leading-tight break-all whitespace-normal">
                          {item.displayId}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        {item.imageLink ? (
                          <img
                            src={item.imageLink}
                            alt={item.title}
                            className="h-20 w-20 object-cover rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => handleImageClick(item.imageLink)}
                            onError={(e) => {
                              e.target.src =
                                "https://via.placeholder.com/80?text=No+Image";
                            }}
                          />
                        ) : (
                          <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center text-xs text-gray-500 dark:text-gray-400 text-center px-1">
                            No Image
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-sm w-40 text-gray-900 dark:text-white line-clamp-3">
                        {item.title}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm w-56 text-gray-900 dark:text-white line-clamp-4 pr-2 flex-1">
                          {item.description}
                        </div>
                        <button
                          onClick={() => handleViewDescription(item)}
                          className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                          title="View full description"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white">{item.brand}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.feedLabel}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {item.productType}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white line-clamp-3">
                        {item.googleProductCategory}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleOptimize(item.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-blue-500 text-white text-sm font-medium rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                        title="Optimize this product"
                      >
                        <Sparkles size={16} className="mr-1.5" />
                        Optimize
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <SearchX size={64} className="text-gray-300 dark:text-gray-700 mb-4" />
                      <p className="text-lg font-medium text-gray-700 dark:text-white mb-1">
                        No results found
                      </p>
                      {searchTerm && searchTerm.trim() !== "" && (
                        <p className="text-sm text-gray-500">
                          No results found for "{searchTerm}"
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky pagination at bottom */}
      <div className="fixed bottom-0 left-64 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-4 px-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-end gap-6">
          {/* Results info */}
          <div className="text-sm text-gray-700 dark:text-gray-300">
            {loading ? (
              <span className="text-gray-500 dark:text-gray-400">Loading products...</span>
            ) : (
              <span>
                <span className="font-medium">{startIndex}</span> to{" "}
                <span className="font-medium">{endIndex}</span> of{" "}
                <span className="font-medium">{filteredData.length}</span>
              </span>
            )}
          </div>

          {/* Rows per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">Show rows:</span>
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="500">500</option>
            </select>
          </div>

          {/* Pagination buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              title="First page"
            >
              <ChevronsLeft size={18} />
            </button>

            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              title="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              title="Next page"
            >
              <ChevronRight size={18} />
            </button>

            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              title="Last page"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for viewing full description */}
      {showModal && selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  Description Details
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl"
                >
                  &times;
                </button>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">ID</h3>
                <p className="font-sm text-gray-700 dark:text-gray-300">{selectedItem.id}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">Title</h3>
                <p className="text-gray-700 dark:text-gray-300">{selectedItem.title}</p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Full Description
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mt-1 whitespace-pre-line">
                  {selectedItem.description}
                </p>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal for viewing full image */}
      {showImageModal && selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50"
          onClick={closeImageModal}
        >
          <div
            className="relative max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeImageModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-3xl font-bold"
            >
              &times;
            </button>
            <img
              src={selectedImage}
              alt="Product"
              className="max-w-full max-h-[85vh] object-contain rounded-lg"
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/800?text=Image+Not+Available";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedData;
