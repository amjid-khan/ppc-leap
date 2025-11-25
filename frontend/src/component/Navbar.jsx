import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import AccountManagement from "./AccountManagement.jsx";

const Navbar = () => {
  const { user, logout, accounts, selectedAccount, switchAccount } = useAuth();
  const navigate = useNavigate();

  const dropdownRef = useRef();
  const profileDropdownRef = useRef();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [showAccountManagement, setShowAccountManagement] = useState(false);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get first letter of name for avatar
  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || "?";

  // Handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
    setProfileDropdownOpen(false);
  };

  return (
    <header className="h-16 bg-white shadow-md flex items-center px-6 justify-between z-50 relative">

      {/* LEFT: LOGO + TITLE */}
      <div className="flex items-center gap-6">
        <img
          src="https://mls0rqzktgmc.i.optimole.com/w:77/h:36/q:mauto/ig:avif/https://ppcleap.com/wp-content/uploads/2025/05/Vector-1.png"
          alt="Logo"
          className="w-20 h-auto"
        />
        <h2 className="text-xl md:text-2xl font-bold whitespace-nowrap">
          <span className="text-green-900">Leap</span> Feed Optimizer
        </h2>
      </div>

      {/* RIGHT SECTION (Google-style bar) */}
      <div className="flex items-center gap-6">

        {/* ACCOUNT NAME + ID + DROPDOWN */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="cursor-pointer flex flex-col items-start"
          >
            <div className="flex items-center gap-1">
              <span className="font-medium text-gray-800 text-sm">
                {selectedAccount?.accountName || "Select Account"}
              </span>

              {/* Dropdown Icon */}
              <svg
                className={`w-4 h-4 transform transition-transform duration-200 ${
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

            <span className="text-xs text-gray-500 mt-[-3px]">
              {selectedAccount?.merchantId || ""}
            </span>
          </div>

          {/* DROPDOWN MENU */}
          <div
            className={`absolute right-0 mt-3 w-72 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden transform transition-all duration-200 ${
              dropdownOpen
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            <div className="max-h-80 overflow-y-auto">
              {accounts && accounts.length > 0 ? (
                <>
                  {accounts.map((acc) => (
                    <div
                      key={acc._id}
                      onClick={async () => {
                        await switchAccount(acc._id);
                        setDropdownOpen(false);
                        // Reload page to refresh products with new account
                        window.location.reload();
                      }}
                      className={`flex items-center p-4 hover:bg-gray-100 cursor-pointer transition ${
                        selectedAccount?._id === acc._id ? "bg-blue-50" : ""
                      }`}
                    >
                      {/* Google-style Circle Icon */}
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                        {acc.accountName.charAt(0).toUpperCase()}
                      </div>

                      <div className="ml-3 flex-1">
                        <p className="text-gray-800 font-semibold">{acc.accountName}</p>
                        <p className="text-xs text-gray-500">Merchant ID: {acc.merchantId}</p>
                      </div>
                      
                      {selectedAccount?._id === acc._id && (
                        <svg
                          className="w-5 h-5 text-blue-600"
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
                  <div
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowAccountManagement(true);
                    }}
                    className="flex items-center p-4 hover:bg-gray-100 cursor-pointer transition border-t border-gray-200"
                  >
                    <svg
                      className="w-5 h-5 text-gray-600 mr-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="text-sm text-gray-700 font-medium">Manage Accounts</span>
                  </div>
                </>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-gray-500 text-sm mb-3">No accounts found.</p>
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      setShowAccountManagement(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    Add Account
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Google Apps Icon */}
       
        {/* PROFILE SECTION WITH DROPDOWN */}
        <div className="relative" ref={profileDropdownRef}>
          <div
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="cursor-pointer"
          >
            {/* Avatar - Show first letter if no image */}
            {user?.image ? (
              <img
                src={user.image}
                alt="Profile"
                className="w-9 h-9 rounded-full border-2 border-gray-300 object-cover hover:border-gray-400 transition-colors"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold border-2 border-gray-300 hover:border-gray-400 transition-colors">
                {avatarLetter}
              </div>
            )}
          </div>

          {/* PROFILE DROPDOWN MENU - Google Merchant Center Style */}
          <div
            className={`absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden transform transition-all duration-200 z-50 ${
              profileDropdownOpen
                ? "opacity-100 scale-100"
                : "opacity-0 scale-95 pointer-events-none"
            }`}
          >
            {/* User Info Section */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                {/* Avatar in dropdown */}
                {user?.image ? (
                  <img
                    src={user.image}
                    alt="Profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center text-base font-semibold">
                    {avatarLetter}
                  </div>
                )}
                
                {/* Name and Email */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || ""}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout Section */}
            <div className="p-1">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
              >
                <svg
                  className="w-5 h-5 text-gray-500"
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
          </div>
        </div>
      </div>

      {/* Account Management Modal */}
      <AccountManagement
        isOpen={showAccountManagement}
        onClose={() => setShowAccountManagement(false)}
      />
    </header>
  );
};

export default Navbar;
