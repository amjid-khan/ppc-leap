import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Extract first letter from name
  const avatarLetter = user?.name?.charAt(0)?.toUpperCase() || "?";

  return (
    <header className="h-16 bg-white backdrop-blur-sm shadow-md flex items-center px-6 justify-between z-50 relative">
      {/* Left: Logo + Title */}
      <div className="flex items-center">
        <img
          src="https://mls0rqzktgmc.i.optimole.com/w:77/h:36/q:mauto/ig:avif/https://ppcleap.com/wp-content/uploads/2025/05/Vector-1.png"
          alt="Logo"
          className="w-20 h-auto"
        />
        <h2 className="ml-10 md:ml-32 text-xl md:text-2xl font-bold whitespace-nowrap">
          <span className="text-green-900">Leap</span> Feed Optimizer
        </h2>
      </div>

      {/* Right: Account Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-lg hover:bg-gray-200 transition duration-200 shadow-sm"
        >
          <span className="font-medium text-gray-700">Account</span>
          <svg
            className={`w-4 h-4 transform transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* DROPDOWN */}
        <div
          className={`absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden transform transition-all duration-200 ${
            dropdownOpen ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"
          }`}
        >
          <div className="flex flex-col items-center px-4 py-6 bg-gray-50 border-b text-center">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-green-700 text-white flex items-center justify-center text-3xl font-bold shadow">
              {avatarLetter}
            </div>

            {/* User Info */}
            <p className="mt-3 font-semibold text-gray-800">{user?.name}</p>
            <p className="text-gray-500 text-sm">{user?.email}</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full text-center px-4 py-3 text-red-500 hover:bg-red-100 transition duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
