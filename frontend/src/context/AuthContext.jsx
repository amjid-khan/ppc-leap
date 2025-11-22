import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const AuthContext = createContext();

const API = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

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
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || err.message };
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // Check if user is authenticated (has valid token)
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    return !!token && !!user;
  };

  // ✅ New: Fetch products from backend API
  // const fetchProducts = async () => {
  //   try {
  //     // Optional: attach token if needed
  //     const token = localStorage.getItem("token");
  //     const headers = token ? { Authorization: `Bearer ${token}` } : {};

  //     const res = await axios.get(`${API}/api/merchant/products`, { headers });

  //     if (res.data.success) {
  //       console.log("Products fetched successfully:", res.data.data);
  //       return res.data.data;
  //     } else {
  //       console.error("Failed to fetch products:", res.data.message);
  //       return [];
  //     }
  //   } catch (err) {
  //     console.error("Error fetching products:", err.message);
  //     return [];
  //   }
  // };


  const fetchProducts = async (page = 1, limit = 50, searchQuery = "") => {
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const res = await axios.get(`${API}/api/merchant/products?${params.toString()}`, { headers });

      if (res.data.success) {
        return {
          products: res.data.data || [],
          pagination: res.data.pagination || {
            total: 0,
            page: 1,
            limit: 50,
            totalPages: 0
          }
        };
      } else {
        console.error("Failed to fetch products:", res.data.message);
        return {
          products: [],
          pagination: { total: 0, page: 1, limit: 50, totalPages: 0 }
        };
      }
    } catch (err) {
      console.error("Error fetching products:", err.message);
      return {
        products: [],
        pagination: { total: 0, page: 1, limit: 50, totalPages: 0 }
      };
    }
  };


  return (
    <AuthContext.Provider
      value={{ user, loading, register, login, logout, fetchProducts, isAuthenticated }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => useContext(AuthContext);
