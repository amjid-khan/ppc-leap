import { createContext, useContext, useState, useEffect, useRef } from "react";
import axios from "axios";

const AuthContext = createContext();
const API = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isAccountSwitching, setIsAccountSwitching] = useState(false);

  // Product caching - multi-account cache
  const productsCache = useRef({});
  const productsCacheTime = useRef({});
  const productsFetchAbort = useRef(null);

  // HELPER FUNCTIONS
  const persistUser = (userData) => {
    if (userData) {
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      setUser(null);
      localStorage.removeItem("user");
    }
  };

  const clearSession = () => {
    persistUser(null);
    setAccounts([]);
    setSelectedAccount(null);
    localStorage.removeItem("token");
  };

  const updateUserSelectedAccount = (accountId) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, selectedAccount: accountId || null };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  // SYNC ACCOUNTS - with background product fetch
  const syncAccounts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await axios.get(`${API}/api/auth/merchant-accounts`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const accountsList = res.data?.accounts || [];

      const normalized = accountsList.map((a) => ({
        _id: a._id || a.id || `${a.id}`,
        accountName: a.name || a.accountName || "Unnamed Account",
        merchantId: a.id || a.merchantId || a._id || null,
        websiteUrl: a.websiteUrl || "",
        email: a.email || "",
        businessType: a.businessType || "",
        status: a.status || "",
        raw: a,
      }));

      setAccounts(normalized);

      if (normalized.length === 0) {
        setSelectedAccount(null);
        updateUserSelectedAccount(null);
        return;
      }

      const preferredMerchantId = user?.selectedAccount;
      let preferredAccount =
        normalized.find((acc) => acc.merchantId === preferredMerchantId) ||
        normalized[0];

      setSelectedAccount(preferredAccount);
      updateUserSelectedAccount(preferredAccount.merchantId);

      // 🔄 Start background fetch for first account
      fetchProductsInBackground(preferredAccount.merchantId);
    } catch (err) {
      console.error("Error loading accounts:", err);
    }
  };

  // BACKGROUND PRODUCT FETCHING - non-blocking
  const fetchProductsInBackground = async (merchantId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      // Cancel previous fetch if exists
      if (productsFetchAbort.current) {
        productsFetchAbort.current.abort();
      }

      productsFetchAbort.current = new AbortController();

      const res = await axios.get(`${API}/api/merchant/products`, {
        params: { page: 1, limit: 10000 },
        headers: { Authorization: `Bearer ${token}` },
        signal: productsFetchAbort.current.signal,
      });

      const products = res.data.products || [];

      // Cache products per account
      productsCache.current[merchantId] = products;
      productsCacheTime.current[merchantId] = Date.now();

      console.log(`✅ Products cached for ${merchantId}`);
    } catch (err) {
      if (err.code !== "ERR_CANCELED") {
        console.error("Background fetch error:", err.message);
      }
    }
  };

  // ACCOUNT SWITCH - INSTANT UI UPDATE + 2-second loader + Background fetch
  const switchAccount = async (accountId) => {
    if (!accountId) return false;

    const accountToSwitch =
      accounts.find((acc) => acc._id === accountId) ||
      accounts.find((acc) => acc.merchantId === accountId);

    if (!accountToSwitch) return false;

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token");

      // ⚡ INSTANT: Update UI immediately + Show loader for 2 seconds
      setIsAccountSwitching(true);
      setSelectedAccount(accountToSwitch);
      updateUserSelectedAccount(accountToSwitch.merchantId);

      // ✅ Update backend (non-blocking)
      axios.post(
        `${API}/api/auth/select-account`,
        { merchantId: accountToSwitch.merchantId },
        { headers: { Authorization: `Bearer ${token}` } }
      ).catch(err => console.error("Backend sync error:", err));

      // 🔄 Check if products cached, if not fetch in background
      const merchantId = accountToSwitch.merchantId;
      const now = Date.now();
      const cachedProducts = productsCache.current[merchantId];
      const cacheTime = productsCacheTime.current[merchantId];

      // Valid cache = exists AND less than 30 minutes old
      const hasValidCache = cachedProducts && cacheTime && (now - cacheTime < 30 * 60 * 1000);

      if (!hasValidCache) {
        // Fetch in background (don't await)
        fetchProductsInBackground(merchantId);
      } else {
        console.log("✅ Using cached products");
      }

      // ⏱️ Keep loader visible for 2 seconds minimum
      setTimeout(() => {
        setIsAccountSwitching(false);
      }, 2000);

      return true;
    } catch (err) {
      console.error("Error switching account:", err);
      setIsAccountSwitching(false);
      return false;
    }
  };

  // AUTH VERIFY ON MOUNT
  useEffect(() => {
    const verifyUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        clearSession();
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(`${API}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.success) {
          persistUser(res.data.user);
        } else {
          clearSession();
        }
      } catch {
        clearSession();
      } finally {
        setLoading(false);
      }
    };
    verifyUser();
  }, []);

  // Load accounts when user logs in
  useEffect(() => {
    if (user && !loading) {
      // Only sync accounts if selectedAccount is not set
      // This prevents overwriting manual account switches
      if (!selectedAccount) {
        syncAccounts();
      }
    }
  }, [user, loading, selectedAccount]);

  // AUTH FUNCTIONS
  const register = async (name, email, password, confirmPassword) => {
    try {
      const res = await axios.post(`${API}/api/auth/register`, {
        name,
        email,
        password,
        confirmPassword,
      });
      localStorage.setItem("token", res.data.token);
      persistUser(res.data.user);
      await syncAccounts();
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const login = async (email, password) => {
    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      persistUser(res.data.user);
      await syncAccounts();
      return { success: true, user: res.data.user };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const loginWithToken = async (token) => {
    if (!token) return { success: false, message: "No token provided" };
    localStorage.setItem("token", token);

    try {
      const res = await axios.get(`${API}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success && res.data.user) {
        persistUser(res.data.user);
        await syncAccounts();
        return { success: true };
      } else {
        clearSession();
        return { success: false, message: "Invalid token" };
      }
    } catch (err) {
      clearSession();
      return { success: false, message: err.message };
    }
  };

  // GET PRODUCTS - Returns cached OR fetches with cache
  const getProducts = async (page = 1, limit = 50) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token");

      const merchantId = selectedAccount?.merchantId;
      if (!merchantId) throw new Error("No merchant selected");

      // ⚡ CHECK CACHE FIRST
      const now = Date.now();
      const cachedProducts = productsCache.current[merchantId];
      const cacheTime = productsCacheTime.current[merchantId];

      // Valid cache = exists AND less than 30 minutes old
      if (
        cachedProducts &&
        cacheTime &&
        now - cacheTime < 30 * 60 * 1000
      ) {
        console.log("✅ Returning cached products");
        return {
          success: true,
          products: cachedProducts,
          total: cachedProducts.length,
          page: 1,
          limit: cachedProducts.length,
          fromCache: true,
        };
      }

      // 🔄 NO CACHE - Fetch from API
      console.log("📡 Fetching products from API...");
      const res = await axios.get(`${API}/api/merchant/products`, {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` },
      });

      const products = res.data.products || [];

      // Store in cache
      productsCache.current[merchantId] = products;
      productsCacheTime.current[merchantId] = Date.now();

      return {
        success: true,
        products: products,
        total: products.length,
        page: 1,
        limit: products.length,
        fromCache: false,
      };
    } catch (err) {
      console.error("Error fetching products:", err);
      return {
        success: false,
        products: [],
        total: 0,
        message: err.message,
      };
    }
  };


  const logout = () => clearSession();

  const isAuthenticated = () => !!user && !!localStorage.getItem("token");

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        accounts,
        selectedAccount,
        isAccountSwitching,
        register,
        login,
        logout,
        syncAccounts,
        switchAccount,
        loginWithToken,
        isAuthenticated,
        getProducts,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("useAuth must be used within AuthProvider");
    return {
      user: null,
      loading: true,
      accounts: [],
      selectedAccount: null,
      isAccountSwitching: false,
      register: async () => ({ success: false }),
      login: async () => ({ success: false }),
      logout: () => {},
      syncAccounts: async () => {},
      switchAccount: async () => false,
      loginWithToken: async () => ({ success: false }),
      isAuthenticated: () => false,
      getProducts: async () => ({ success: false, products: [] }),
    };
  }
  return context;
};
