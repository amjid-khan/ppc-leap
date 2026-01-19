import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import SuperAdminSidebar from "./SuperAdminSidebar";

const SuperAdminLayout = () => {
  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-950">
      <Navbar />

      <div className="flex flex-1 overflow-hidden">
        <SuperAdminSidebar />

        {/* Main content */}
        <main className="flex-1 p-4 overflow-y-auto bg-white dark:bg-gray-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
