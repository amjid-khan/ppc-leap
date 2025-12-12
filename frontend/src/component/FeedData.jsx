import React, { useState, useEffect } from 'react';
import { Search, Eye, ChevronLeft, ChevronRight, CheckCircle, XCircle, Zap, ChevronsLeft, ChevronsRight, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SkeletonTableRow } from './SkeletonLoader';

const FeedData = () => {
  const { getProducts, selectedAccount } = useAuth();
  const [feedData, setFeedData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch all products (load everything at once)
  useEffect(() => {
    const fetchProductsData = async () => {
      // Clear previous data immediately on account change to avoid showing stale items
      setFeedData([]);
      setTotalItems(0);
      setCurrentPage(1);
      setLoading(true);

      const result = await getProducts(1, 10000); // Load all products at once
      if (result.success) {
        // Map API data to match UI expectations
        const mappedProducts = result.products.map((product) => ({
          id: product.offerId || product.id,
          displayId: product.offerId || product.id,
          status: product.approvalStatus?.toLowerCase() === 'approved' ? 'approved' : (product.approvalStatus?.toLowerCase() === 'pending' ? 'pending' : 'disapproved'),
          title: product.title || '',
          description: product.raw?.description || product.description || '',
          brand: product.brand || '',
          feedLabel: product.raw?.feedLabel || 'GB',
          productType: product.raw?.productTypes?.[0] || '',
          googleProductCategory: product.raw?.googleProductCategory || 'Not specified',
          price: product.price,
          salePrice: product.salePrice,
          availability: product.availability,
          link: product.link,
          imageLink: product.imageLink,
        }));
        setFeedData(mappedProducts);
        setTotalItems(mappedProducts.length);
      } else {
        // ensure empty state when fetch fails or returns no products
        setFeedData([]);
        setTotalItems(0);
      }

      setLoading(false);
    };

    fetchProductsData();
  }, [getProducts, selectedAccount]);

  // Filter data based on search (only applies to current page data)
  const filteredData = feedData.filter(item => 
    (item.title && item.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.brand && item.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.id && item.id.toString().includes(searchTerm))
  );

  // Pagination for client-side display
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredData.length);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  // Handle Optimize button click
  const handleOptimize = (itemId) => {
    alert(`Optimizing product ID: ${itemId}`);
    // Add your optimization logic here
  };

  // Handle items per page change
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  return (
    <div className="min-h-screen  p-4 md:p-6">
      {/* Header section with title and search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">FeedData</h1>
          <p className="text-gray-600 mt-1">Manage and review your product feed data</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by ID, title, or brand..."
              className="w-full md:w-80 pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
      </div>

      {/* Table section */}
      <div className="bg-white rounded-lg shadow overflow-hidden mb-24">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-40">ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">Image</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-96">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-96">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-48">Brand</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-32">Feed Label</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-48">Product Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-64">Google Product Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider w-40">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <SkeletonTableRow key={i} />
                  ))}
                </>
              ) : currentData.length > 0 ? (
                currentData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 group">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        {item.status === 'approved' ? (
                          <CheckCircle className="text-green-500 mr-2" size={18} />
                        ) : (
                          <XCircle className="text-red-500 mr-2" size={18} />
                        )}
                        <span className={`px-2 py-1 text-xs rounded-full ${item.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 w-24">
                        <div className="text-xs leading-tight break-all whitespace-normal">{item.displayId}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center">
                        {item.imageLink ? (
                          <div className="relative group">
                            <img 
                              src={item.imageLink} 
                              alt={item.title}
                              className="h-20 w-20 object-cover rounded border border-gray-200 cursor-pointer hover:border-blue-500 transition-colors"
                              onError={(e) => {e.target.src = 'https://via.placeholder.com/80?text=No+Image'}}
                            />
                            {/* <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 bg-black bg-opacity-50 flex items-center justify-center transition-opacity">
                              <span className="text-white text-xs">View</span>
                            </div> */}
                          </div>
                        ) : (
                          <div className="h-20 w-20 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500 text-center px-1">
                            No Image
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="text-sm w-40 text-gray-900 line-clamp-3">{item.title}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-between">
                        <div className="text-sm  w-56 text-gray-900 line-clamp-4 pr-2 flex-1">{item.description}</div>
                        <button 
                          onClick={() => handleViewDescription(item)}
                          className="text-gray-500 hover:text-blue-600 ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100"
                          title="View full description"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{item.brand}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900">{item.feedLabel}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900">{item.productType}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm text-gray-900 line-clamp-3">{item.googleProductCategory}</div>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleOptimize(item.id)}
                        className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
                        title="Optimize this product"
                      >
                        <Zap size={16} className="mr-1.5" />
                        Optimize
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">
                    {searchTerm && searchTerm.trim() !== '' ? (
                      <>{`No results found for "${searchTerm}"`}</>
                    ) : (
                      <>No results found</>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky pagination at bottom */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-gray-200 py-4 px-6 shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-end gap-6">
          {/* Results info - Google Merchant Center style */}
          <div className="text-sm text-gray-700">
            {loading ? (
              <span className="text-gray-500">Loading products...</span>
            ) : (
              <span>
                <span className="font-medium">{startIndex}</span> to <span className="font-medium">{endIndex}</span> of <span className="font-medium">{filteredData.length}</span>
              </span>
            )}
          </div>
          
          {/* Rows per page selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">Show rows:</span>
            <select 
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>  
              <option value="500">500</option>  
            </select>
          </div>
          
          {/* Pagination buttons only (no page numbers) */}
          <div className="flex items-center gap-2">
            {/* First page button */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              title="First page"
            >
              <ChevronsLeft size={18} />
            </button>
            
            {/* Previous page button */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              title="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            
            {/* Next page button */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              title="Next page"
            >
              <ChevronRight size={18} />
            </button>
            
            {/* Last page button */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              title="Last page"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for viewing full description */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-gray-800">Description Details</h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  &times;
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className=" text-sm font-medium text-gray-900">ID</h3>
                <p className=" font-sm text-gray-700">{selectedItem.id}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900">Title</h3>
                <p className="text-gray-700">{selectedItem.title}</p>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900">Full Description</h3>
                <p className="text-gray-700 mt-1 whitespace-pre-line">{selectedItem.description}</p>
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
    </div>
  );
};

export default FeedData;