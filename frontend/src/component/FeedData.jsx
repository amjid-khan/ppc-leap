import React, { useState, useEffect, useRef } from "react";
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
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showAccountSwitchNotification, setShowAccountSwitchNotification] = useState(false);
  const [prevAccountId, setPrevAccountId] = useState(null);
  const filterDropdownRef = useRef(null);

  // Drag scroll state
  const tableContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartScrollLeft, setDragStartScrollLeft] = useState(0);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target)) {
        setShowFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch all products (load everything at once)
  useEffect(() => {
    const fetchProductsData = async () => {
      setFeedData([]);
      setTotalItems(0);
      setCurrentPage(1);
      setLoading(true);

      // Add merchant ID to logs for debugging
      console.log(`📦 Fetching products for merchant: ${selectedAccount?.merchantId}`);

      const result = await getProducts(1, 10000);
      if (result.success) {
        console.log(`✅ Got ${result.products.length} products for merchant: ${selectedAccount?.merchantId}`);
        
        const cleanDescription = (text) => {
          if (!text) return "";
          // Remove leading "About this item:" (case-insensitive) and any leading whitespace/newlines
          return text.replace(/^\s*about this item:\s*/i, "");
        };

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
          description: cleanDescription(product.raw?.description || product.description || ""),
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
          approvalStatus: product.approvalStatus || "unknown", // Store raw approval status too
        }));
        setFeedData(mappedProducts);
        setTotalItems(mappedProducts.length);
      } else {
        console.warn(`❌ Failed to fetch products for merchant: ${selectedAccount?.merchantId}`);
        setFeedData([]);
        setTotalItems(0);
      }

      setLoading(false);
    };

    fetchProductsData();
  }, [getProducts, selectedAccount]);

  // Show notification when account switches
  // useEffect(() => {
  //   if (selectedAccount?.merchantId && prevAccountId && prevAccountId !== selectedAccount?.merchantId) {
  //     setShowAccountSwitchNotification(true);
  //     const timer = setTimeout(() => setShowAccountSwitchNotification(false), 3000);
  //     return () => clearTimeout(timer);
  //   }
  //   setPrevAccountId(selectedAccount?.merchantId);
  // }, [selectedAccount?.merchantId, prevAccountId]);

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

  // Handle mouse down for drag scroll
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartScrollLeft(tableContainerRef.current.scrollLeft);
  };

  // Handle mouse move for drag scroll
  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const x = e.clientX - dragStartX;
    tableContainerRef.current.scrollLeft = dragStartScrollLeft - x;
  };

  // Handle mouse up for drag scroll
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="">
      {/* Header Card - Consistent with Dashboard */}
    <div className="mb-6 ">
  <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 p-3 ">
    <div className="flex justify-between items-center ">
      {/* Left Section */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <div className="bg-green-500 dark:bg-green-800 p-2.5 rounded-lg">
            <Database className="text-white dark:text-white" size={26} />
          </div>

          <h1 className="text-2xl font-bold text-black dark:text-white">
            Feed Data
          </h1>
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
            className="p-2 rounded-lg bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center gap-2 transition-all duration-200 hover:scale-105"
            title="Clear all filters"
          >
            <X size={18} />
          </button>
        )}

        {/* Status Filter Dropdown */}
        <div className="relative" ref={filterDropdownRef}>
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className={`p-2 rounded-lg transition-all duration-200 flex items-center justify-center ${
              statusFilter !== "all"
                ? "bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400"
                : "bg-green-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            } hover:scale-105`}
            title="Filter by status"
          >
            <Filter size={18} />
          </button>

          {/* Dropdown Menu */}
          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-2">
                {[
                  { value: "all", label: "All Products" },
                  { value: "approved", label: "Approved" },
                  { value: "disapproved", label: "Disapproved" },
                  { value: "pending", label: "Pending" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setStatusFilter(option.value);
                      setCurrentPage(1);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-md transition-all duration-200 font-medium text-sm ${
                      statusFilter === option.value
                        ? "bg-green-500 text-white shadow-md"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
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
        <div
          ref={tableContainerRef}
          className="overflow-x-auto"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
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
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {item.status === "approved" ? (
                          <CheckCircle
                            className="text-green-500 mr-2"
                            size={18}
                          />
                        ) : item.status === "pending" ? (
                          <div className="w-[18px] h-[18px] rounded-full border-2 border-yellow-500 mr-2 flex items-center justify-center">
                            <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                          </div>
                        ) : (
                          <XCircle className="text-red-500 mr-2" size={18} />
                        )}
                        <span
                          className={`px-2 py-1 text-xs rounded-full font-medium ${
                            item.status === "approved"
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                              : item.status === "pending"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
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
                            className="w-20 sm:w-24 md:w-20 aspect-square object-cover rounded border border-gray-200 dark:border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
                            onClick={() => handleImageClick(item.imageLink)}
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/100?text=No+Image";
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
                      <div className="text-sm text-gray-900 dark:text-white">
                        {item.brand}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.feedLabel}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white line-clamp-3 max-w-48">
                        {item.productType}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 dark:text-white line-clamp-3">
                        {item.googleProductCategory}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button className="inline-flex items-center px-3 py-1.5 bg-green-500 text-white text-sm font-medium rounded-md">
                        <Sparkles size={16} className="mr-1.5" />
                        Optimize
                      </button>
                    </td>
                  </tr>
                ))
              ) : feedData.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <Database
                        size={64}
                        className="text-gray-300 dark:text-gray-700 mb-4"
                      />
                      <p className="text-lg font-medium text-gray-700 dark:text-white mb-1">
                        No products in this account
                      </p>
                      <p className="text-sm text-gray-500">
                        This account doesn't have any products yet
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="10" className="px-4 py-16">
                    <div className="flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                      <SearchX
                        size={64}
                        className="text-gray-300 dark:text-gray-700 mb-4"
                      />
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
              <span className="text-gray-500 dark:text-gray-400">
                Loading products...
              </span>
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
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Show rows:
            </span>
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
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  ID
                </h3>
                <p className="font-sm text-gray-700 dark:text-gray-300">
                  {selectedItem.id}
                </p>
              </div>

              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  Title
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {selectedItem.title}
                </p>
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
