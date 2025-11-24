import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";

const Navbar = () => {
  const { user } = useAuth();

  const dropdownRef = useRef();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const accounts = user?.accounts || [
    {
      accountName: "PhoneBits.co.uk",
      merchantId: "540577233",
    }
  ];

  const [selectedAccount, setSelectedAccount] = useState(
    accounts[0]?.accountName || "Select Account"
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
              <span className="font-medium text-gray-800 text-sm">{selectedAccount}</span>

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
              {accounts[0].merchantId}
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
              {accounts.map((acc, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setSelectedAccount(acc.accountName);
                    setDropdownOpen(false);
                  }}
                  className="flex items-center p-4 hover:bg-gray-100 cursor-pointer transition"
                >
                  {/* Google-style Circle Icon */}
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
                    {acc.accountName.charAt(0).toUpperCase()}
                  </div>

                  <div className="ml-3">
                    <p className="text-gray-800 font-semibold">{acc.accountName}</p>
                    <p className="text-xs text-gray-500">Merchant ID: {acc.merchantId}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Google Apps Icon */}
       
        {/* PROFILE IMAGE */}
        <img
          src="/mnt/data/b9ee955e-2df9-4d0b-acc5-4008fc1981a5.png"
          alt="Profile"
          className="w-9 h-9 rounded-full border-2 border-yellow-300 object-cover cursor-pointer"
        />
      </div>
    </header>
  );
};

export default Navbar;
