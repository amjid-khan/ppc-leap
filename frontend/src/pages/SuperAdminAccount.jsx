import React from "react";
import { UserCircle } from "lucide-react";

const SuperAdminAccount = () => {
  return (
    <div className="">
      {/* Premium Header */}
      <div className="mb-6 relative">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 p-3">
          <div className="flex justify-between items-start">
            {/* Left Section */}
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="bg-gray-100 dark:bg-gray-800 p-2.5 rounded-lg">
                  <UserCircle className="text-black dark:text-white" size={26} />
                </div>
                <h1 className="text-2xl font-bold text-black dark:text-white">
                  Account
                </h1>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-base">
                Manage account settings and preferences
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminAccount;
