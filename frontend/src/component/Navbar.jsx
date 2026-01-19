import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useNavigate } from "react-router-dom";
import { Search, Moon, Sun, Globe } from "lucide-react";

const Navbar = () => {
  const { user, logout, accounts, selectedAccount, switchAccount, isAccountSwitching } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const dropdownRef = useRef();
  const profileDropdownRef = useRef();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
        setSearchQuery("");
      }
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setImageError(false);
  }, [user?.image]);

  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || "?";
  const hasValidImage = user?.image && user.image.trim() !== "" && !imageError;

  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileDropdownOpen(false);
  };

  // Filter accounts based on search query
  const filteredAccounts = accounts?.filter((acc) => {
    const query = searchQuery.toLowerCase();
    return (
      acc.accountName.toLowerCase().includes(query) ||
      acc.merchantId.toLowerCase().includes(query)
    );
  });

  // Handle account switch - INSTANT UI UPDATE
  const handleAccountSwitch = async (accountId) => {
    // Don't await - let it update UI immediately
    switchAccount(accountId);
    // Close dropdown instantly
    setDropdownOpen(false);
    setSearchQuery("");
  };

  return (
    <>
      <header className="bg-white dark:bg-black border-b border-gray-300 dark:border-gray-700 flex items-center px-6 py-4 justify-between z-50 relative transition-colors duration-300 h-16 min-h-[64px]">
        {/* LEFT: LOGO + TITLE */}
        <div className="flex items-center gap-2">
          <img
            src="https://mls0rqzktgmc.i.optimole.com/w:77/h:36/q:mauto/ig:avif/https://ppcleap.com/wp-content/uploads/2025/05/Vector-1.png"
            alt="Logo"
            className="w-20 h-auto"
          />
          <h2 className="text-md md:text-xl font-bold whitespace-nowrap dark:text-white">
            <span className="text-green-900 dark:text-green-400">Leap</span> Feed Optimizer
          </h2>
        </div>

        {/* RIGHT SECTION */}
        <div className="flex items-center gap-6">

          {/* 🔍 SEARCH ICON */}
          {/* <div className="cursor-pointer text-gray-600 hover:text-gray-900 transition-colors">
            <Search size={20} strokeWidth={2} />
          </div> */}

          {/* DIVIDER */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>

          {/* 🌐 LANGUAGE ICON */}
          {/* <div className="cursor-pointer text-gray-600 hover:text-blue-600 transition-colors">
            <Globe size={20} strokeWidth={2} />
          </div> */}

          {/* DIVIDER */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>

          {/* 🌙 THEME TOGGLE ICON */}
          <div 
            className="cursor-pointer text-gray-600 hover:text-amber-500 transition-colors dark:text-gray-400 dark:hover:text-amber-400"
            onClick={toggleTheme}
          >
            {isDarkMode ? (
              <Sun size={20} strokeWidth={2} />
            ) : (
              <Moon size={20} strokeWidth={2} />
            )}
          </div>

          {/* DIVIDER - Hide for superadmin */}
          {user?.role !== "superadmin" && (
            <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>
          )}

          {/* ACCOUNT DROPDOWN - Hide for superadmin */}
          {user?.role !== "superadmin" && (
            <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="cursor-pointer flex flex-col items-start px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors duration-300"
            >
              <div className="flex items-center gap-2">
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-gray-800 dark:text-white text-sm">
                      {selectedAccount?.accountName || "Select Account"}
                    </span>

                    <svg
                      className={`w-4 h-4 text-gray-500 transform transition-transform duration-200 ${
                        dropdownOpen ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Merchant ID: {selectedAccount?.merchantId || ""}
                  </span>
                </div>
              </div>
            </div>

            {/* DROPDOWN MENU */}
            <div
              className={`absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-200 z-50 ${
                dropdownOpen
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 pointer-events-none -translate-y-2"
              }`}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {selectedAccount?.accountName || "Select Account"}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Merchant Centre ID: {selectedAccount?.merchantId || ""}
                  </p>
                </div>
              </div>

              <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                <div className="relative">
                  <svg
                    className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search for business"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-600 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto">
                {filteredAccounts && filteredAccounts.length > 0 ? (
                  <>
                    {filteredAccounts.map((acc) => (
                      <div
                        key={acc._id}
                        onClick={() => handleAccountSwitch(acc._id)}
                        className={`flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors duration-200 ${
                          selectedAccount?._id === acc._id
                            ? "bg-blue-50 dark:bg-blue-900 border-r-2 border-blue-500"
                            : ""
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {acc.accountName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            Merchant ID: {acc.merchantId}
                          </p>
                        </div>

                        {selectedAccount?._id === acc._id && (
                          <svg
                            className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        className="w-6 h-6 text-gray-400 dark:text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                      {searchQuery ? "No matching accounts found" : "No accounts found"}
                    </p>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div
                  onClick={() => {
                    setDropdownOpen(false);
                    setShowAccountManagement(true);
                    setSearchQuery("");
                  }}
                  className="flex items-center justify-center p-3 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-200"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    Manage accounts
                  </span>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* DIVIDER */}
          <div className="w-px h-6 bg-gray-300 dark:bg-gray-700"></div>

          {/* PROFILE SECTION */}
          <div className="relative" ref={profileDropdownRef}>
            <div
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="cursor-pointer"
            >
              {hasValidImage ? (
                <img
                  src={user.image}
                  alt="Profile"
                  className="w-9 h-9 rounded-full border-2  border-gray-300 dark:border-gray-600 object-cover hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold border-2 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200">
                  {avatarLetter}
                </div>
              )}
            </div>

            <div
              className={`absolute right-0 mt-4 w-80 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transform transition-all duration-200 z-50 ${
                profileDropdownOpen
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 pointer-events-none -translate-y-2"
              }`}
            >
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
                  {user?.email || ""}
                </p>

                <div className="flex justify-center mb-2">
                  {hasValidImage ? (
                    <img
                      src={user.image}
                      alt="Profile"
                      className="w-22 h-22 rounded-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-xl font-semibold">
                      {avatarLetter}
                    </div>
                  )}
                </div>

                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || "User"}
                </p>
              </div>

              <div className="p-1 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200 text-left"
                >
                  <svg
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.36-2.38.996.61 2.296.07 2.572-1.06z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>Manage your Google Account</span>
                </button>
              </div>

              <div className="p-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors duration-200 text-left"
                >
                  <svg
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Sign out</span>
                </button>
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <div className="flex justify-center gap-4 text-xs">
                  <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </header>

      {/* SWITCHING LOADER OVERLAY - Logo-based attractive loader */}
      {isAccountSwitching && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center transition-all duration-300">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-5 border border-gray-200 dark:border-gray-700 min-w-[220px]">
            {/* Logo + Animated Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center">
              {/* Soft outer glow */}
              <div className="absolute inset-0 rounded-full bg-green-400/10 dark:bg-green-500/10 animate-ping" style={{ animationDuration: "2s" }} />
              {/* Static ring */}
              <div className="absolute inset-0 rounded-full border-2 border-gray-200 dark:border-gray-600" />
              {/* Spinning accent – green (Leap brand) */}
              <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-green-500 border-r-green-400 dark:border-t-green-400 dark:border-r-green-300 animate-spin" />
              {/* Logo – center, subtle pulse */}
              <div className="relative z-10 flex items-center justify-center animate-pulse" style={{ animationDuration: "1.8s" }}>
                <img
                  src="https://mls0rqzktgmc.i.optimole.com/w:77/h:36/q:mauto/ig:avif/https://ppcleap.com/wp-content/uploads/2025/05/Vector-1.png"
                  alt="Leap"
                  className="w-14 h-auto object-contain drop-shadow-sm"
                  onError={(e) => { e.target.src = "/logo.jpg"; e.target.className = "w-12 h-12 object-contain rounded"; }}
                />
              </div>
            </div>

            {/* Loading Text */}
            <div className="text-center">
              <p className="text-base font-semibold text-gray-900 dark:text-white mb-0.5">
                Switching Account
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please wait...
              </p>
            </div>

            {/* Thin progress line */}
            <div className="w-full h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-gradient-to-r from-green-500 to-green-400 dark:from-green-400 dark:to-green-300" style={{ animation: "shimmer 1.2s ease-in-out infinite" }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;