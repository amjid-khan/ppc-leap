import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const API = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);

  // Verify token and load user on mount
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem("token");

      // If no token, clear everything
      if (!token) {
        localStorage.removeItem("user");
        setUser(null);
        setLoading(false);
        return;
      }

      // Verify token with backend
      try {
        const res = await axios.get(`${API}/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data.success && res.data.user) {
          setUser(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } else {
          // Invalid token, clear everything
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
        }
      } catch (err) {
        // Token invalid or expired, clear everything
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  // Load accounts when user is available
  useEffect(() => {
    if (user && !loading) {
      loadUserAccounts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading]);

  // Load user accounts
  const loadUserAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API}/api/accounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        const accountsList = res.data.accounts || [];
        setAccounts(accountsList);
        
        // If accounts exist and none selected, select first one
        if (accountsList.length > 0 && !selectedAccount) {
          const firstAccount = accountsList[0];
          setSelectedAccount(firstAccount);
          // Switch to first account on backend
          try {
            await axios.post(
              `${API}/api/accounts/${firstAccount._id}/switch`,
              {},
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
          } catch (err) {
            console.error("Error switching to first account:", err);
          }
        }
      }
    } catch (err) {
      console.error("Error loading accounts:", err);
    }
  };

  // Register function
  const register = async (name, email, password) => {
    try {
      const res = await axios.post(`${API}/api/auth/register`, {
        name,
        email,
        password,
      });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API}/api/auth/login`, { email, password });
      setUser(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      localStorage.setItem("token", res.data.token);
      // Load accounts after login
      await loadUserAccounts();
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setAccounts([]);
    setSelectedAccount(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Account management functions
  const fetchUserAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      const res = await axios.get(`${API}/api/accounts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        setAccounts(res.data.accounts || []);
        return { success: true, accounts: res.data.accounts };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const addAccount = async (accountName, merchantId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      const res = await axios.post(
        `${API}/api/accounts`,
        { accountName, merchantId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        const newAccounts = [...accounts, res.data.account];
        setAccounts(newAccounts);
        
        // If no account selected, select the new one
        if (!selectedAccount) {
          setSelectedAccount(res.data.account);
          await switchAccount(res.data.account._id);
        }
        
        return { success: true, account: res.data.account };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const switchAccount = async (accountId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      const res = await axios.post(
        `${API}/api/accounts/${accountId}/switch`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        const account = accounts.find((acc) => acc._id === accountId);
        if (account) {
          setSelectedAccount(account);
        }
        return { success: true, account: res.data.account };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const deleteAccount = async (accountId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      const res = await axios.delete(`${API}/api/accounts/${accountId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.success) {
        const updatedAccounts = accounts.filter((acc) => acc._id !== accountId);
        setAccounts(updatedAccounts);
        
        // If deleted account was selected, select first available
        if (selectedAccount?._id === accountId) {
          if (updatedAccounts.length > 0) {
            setSelectedAccount(updatedAccounts[0]);
            await switchAccount(updatedAccounts[0]._id);
          } else {
            setSelectedAccount(null);
          }
        }
        
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  const updateAccount = async (accountId, accountName, merchantId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token");

      const res = await axios.put(
        `${API}/api/accounts/${accountId}`,
        { accountName, merchantId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.success) {
        const updatedAccounts = accounts.map((acc) =>
          acc._id === accountId ? res.data.account : acc
        );
        setAccounts(updatedAccounts);
        
        // Update selected account if it was the one updated
        if (selectedAccount?._id === accountId) {
          setSelectedAccount(res.data.account);
        }
        
        return { success: true, account: res.data.account };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  // Check if user is authenticated (has valid token)
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    return !!token && !!user;
  };
const fetchProducts = async (page = 1, limit = 20, searchQuery = "") => {
  try {
    const token = localStorage.getItem("token");
    
    if (!token) {
      throw new Error("No authentication token found");
    }

    const headers = { 
      Authorization: `Bearer ${token}`,
      'Cache-Control': 'no-cache' // Prevent browser caching issues
    };

    // Optimized URL construction
    const baseUrl = `${API}/api/merchant/products`;
    const params = new URLSearchParams({
      page: Math.max(1, page),
      limit: Math.min(100, Math.max(1, limit)) // Limit to 100 max
    });
    
    if (searchQuery && searchQuery.trim()) {
      params.append('search', searchQuery.trim().substring(0, 100)); // Limit search length
    }

    const url = `${baseUrl}?${params.toString()}`;
    
    console.time(`API_Fetch_Products_${page}`);
    const res = await axios.get(url, { 
      headers,
      timeout: 30000 // 30 second timeout
    });
    console.timeEnd(`API_Fetch_Products_${page}`);

    if (res.data.success) {
      return {
        products: res.data.data || [],
        pagination: res.data.pagination || {
          total: 0,
          page: page,
          limit: limit,
          totalPages: 0
        }
      };
    } else {
      console.warn("API returned non-success:", res.data.message);
      return {
        products: [],
        pagination: { 
          total: 0, 
          page: page, 
          limit: limit, 
          totalPages: 0 
        }
      };
    }
  } catch (err) {
    console.error("Error fetching products:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status
    });

    // Return user-friendly error information
    let errorMessage = "Failed to fetch products";
    
    if (err.code === 'ECONNABORTED') {
      errorMessage = "Request timeout. Please try again.";
    } else if (err.response?.status === 401) {
      errorMessage = "Session expired. Please login again.";
      // Optional: Clear token and redirect to login
      localStorage.removeItem("token");
      window.location.href = '/login';
    } else if (err.response?.status === 404) {
      errorMessage = "Products endpoint not found.";
    } else if (err.response?.status >= 500) {
      errorMessage = "Server error. Please try again later.";
    }

    throw new Error(errorMessage);
  }
};

const fetchBrands = async () => {
  try {
    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const res = await axios.get(`${API}/api/merchant/products?limit=100`, { headers });

    if (res.data.success) {
      // Extract unique brands from products
      const products = res.data.data || [];
      const uniqueBrands = [...new Map(
        products
          .filter(product => product.brand && product.brand.trim() !== "")
          .map(product => [product.brand, {
            name: product.brand,
            id: product.id || product.sku || Math.random().toString(36).substr(2, 9),
            productCount: products.filter(p => p.brand === product.brand).length
          }])
      ).values()];

      console.log("Brands extracted:", uniqueBrands);
      return {
        brands: uniqueBrands,
        totalBrands: uniqueBrands.length
      };
    } else {
      console.error("Failed to fetch brands:", res.data.message);
      return {
        brands: [],
        totalBrands: 0
      };
    }
  } catch (err) {
    console.error("Error fetching brands:", err.message);
    return {
      brands: [],
      totalBrands: 0
    };
  }
};


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        register,
        login,
        logout,
        fetchProducts,
        isAuthenticated,
        fetchBrands,
        accounts,
        selectedAccount,
        fetchUserAccounts,
        addAccount,
        switchAccount,
        deleteAccount,
        updateAccount,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);
